import React, { useState } from "react";
import { Alert, Linking, Switch } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useBankDepositController } from "@/controllers/BankDepositController";
import { BANKS, bankName } from "@/models/banks";
import { DepositParser } from "@/models/DepositParser";
import { BankDeposit, DepositAction, SenderRule, UnknownSenderPolicy } from "@/models/types";
import Card from "@/views/components/Card";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import SegmentedControl from "@/views/components/SegmentedControl";
import { formatCurrency, formatDate } from "@/utils/format";
import * as S from "./styles";

const ACTIONS: { value: DepositAction; label: string; short: string; description: string }[] = [
  { value: "income", label: "Saldo", short: "Saldo", description: "Entra como receita e soma no saldo." },
  {
    value: "borrowed",
    label: "Me emprestou",
    short: "Emprestou",
    description: "Vira um empréstimo que você precisa pagar a essa pessoa.",
  },
  {
    value: "repayment",
    label: "Me pagou",
    short: "Pagou",
    description: "Abate de um empréstimo que você fez para essa pessoa.",
  },
  { value: "ignore", label: "Ignorar", short: "Ignorar", description: "Não registra nada." },
];

const actionLabel = (action: string) => ACTIONS.find((a) => a.value === action)?.label ?? "Aguardando revisão";

const UNKNOWN_OPTIONS: { value: UnknownSenderPolicy; label: string }[] = [
  { value: "ask", label: "Revisar" },
  { value: "income", label: "Saldo" },
  { value: "ignore", label: "Ignorar" },
];

const UNKNOWN_HINTS: Record<UnknownSenderPolicy, string> = {
  ask: "Ficam aguardando você decidir aqui embaixo.",
  income: "Entram direto como receita.",
  ignore: "São descartados.",
};

function RuleForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: SenderRule;
  onSave: (rule: SenderRule) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [action, setAction] = useState<DepositAction>(initial?.action ?? "income");

  const save = () => {
    if (!name.trim()) {
      Alert.alert("Falta o nome", "Informe o nome como ele aparece na notificação do banco.");
      return;
    }
    onSave({ name: name.trim(), action });
  };

  return (
    <Card style={{ marginTop: 12 }}>
      <S.Input value={name} onChangeText={setName} placeholder="Nome da pessoa" autoCapitalize="words" autoFocus />
      <SegmentedControl
        options={ACTIONS.map((a) => ({ value: a.value, label: a.short }))}
        value={action}
        onChange={setAction}
      />
      <S.Hint>{ACTIONS.find((a) => a.value === action)?.description}</S.Hint>
      <S.FormActions>
        <AnimatedPressable onPress={onCancel} hitSlop={8}>
          <S.CancelText>Cancelar</S.CancelText>
        </AnimatedPressable>
        <AnimatedPressable onPress={save} hitSlop={8}>
          <S.SaveText>Salvar</S.SaveText>
        </AnimatedPressable>
      </S.FormActions>
    </Card>
  );
}

export default function BankDepositsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const {
    supported,
    permissionGranted,
    settings,
    pending,
    recent,
    openPermissionSettings,
    toggleBank,
    saveRule,
    removeRule,
    setUnknownSender,
    resolveDeposit,
  } = useBankDepositController();
  // null: formulário fechado · "": nova pessoa · nome: editando
  const [editing, setEditing] = useState<string | null>(null);

  const editingRule = settings.senderRules.find((r) => r.name === editing);
  const history = recent.filter((d) => d.status !== "pending").slice(0, 10);

  const confirmRemove = (rule: SenderRule) =>
    Alert.alert("Remover pessoa", `Parar de usar a regra de ${rule.name}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => removeRule(rule.name) },
    ]);

  const resolve = (deposit: BankDeposit, action: DepositAction) => {
    if (!deposit.sender) {
      resolveDeposit(deposit, action, false);
      return;
    }
    const name = DepositParser.displayName(deposit.sender);
    Alert.alert(actionLabel(action), `Fazer isso sempre que ${name} te enviar dinheiro?`, [
      { text: "Só desta vez", onPress: () => resolveDeposit(deposit, action, false) },
      { text: "Sempre", onPress: () => resolveDeposit(deposit, action, true) },
    ]);
  };

  const renderDeposit = (deposit: BankDeposit, idx: number, list: BankDeposit[], withActions: boolean) => (
    <S.Row key={deposit.id} divider={idx < list.length - 1} style={{ alignItems: "flex-start" }}>
      <S.RowInfo>
        <S.RowLabel numberOfLines={1}>
          {deposit.sender ? DepositParser.displayName(deposit.sender) : "Remetente não identificado"}
        </S.RowLabel>
        <S.RowSubtitle>
          {bankName(deposit.bankId)} · {formatDate(deposit.date)}
          {withActions ? "" : ` · ${actionLabel(deposit.status)}`}
        </S.RowSubtitle>
        {withActions && (
          <>
            <S.DepositText numberOfLines={3}>{deposit.text}</S.DepositText>
            <S.Chips>
              {ACTIONS.map((a) => {
                // Empréstimo precisa de alguém do outro lado.
                const disabled = !deposit.sender && (a.value === "borrowed" || a.value === "repayment");
                return (
                  <AnimatedPressable key={a.value} disabled={disabled} onPress={() => resolve(deposit, a.value)}>
                    <S.Chip disabled={disabled}>
                      <S.ChipText>{a.label}</S.ChipText>
                    </S.Chip>
                  </AnimatedPressable>
                );
              })}
            </S.Chips>
          </>
        )}
      </S.RowInfo>
      <S.Amount muted={!withActions && deposit.status === "ignore"}>{formatCurrency(deposit.amount)}</S.Amount>
    </S.Row>
  );

  return (
    <S.Container edges={["top"]}>
      <S.Header>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <S.BackBtn>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </S.BackBtn>
        </AnimatedPressable>
        <S.Title>Depósitos pelo banco</S.Title>
      </S.Header>

      <S.Scroll>
        <S.Intro>
          O app lê as notificações de Pix e transferências recebidas nos bancos escolhidos e registra cada
          entrada conforme a pessoa que enviou. As saídas continuam sendo lançadas por você.
        </S.Intro>

        <S.SectionLabel>Permissão</S.SectionLabel>
        <Card>
          {supported ? (
            <>
              <S.Row style={{ paddingHorizontal: 0, paddingVertical: 0 }}>
                <S.StatusDot active={permissionGranted} />
                <S.RowInfo>
                  <S.RowLabel>Acesso às notificações</S.RowLabel>
                  <S.RowSubtitle>{permissionGranted ? "Ativo" : "Desativado — nada é capturado"}</S.RowSubtitle>
                </S.RowInfo>
              </S.Row>
              {!permissionGranted && (
                <>
                  <AnimatedPressable onPress={openPermissionSettings}>
                    <S.PrimaryBtn>
                      <S.PrimaryBtnText>Permitir acesso</S.PrimaryBtnText>
                    </S.PrimaryBtn>
                  </AnimatedPressable>
                  <S.Hint>
                    Se o interruptor estiver bloqueado ("configuração restrita"), abra as informações do app, toque
                    em ⋮ e escolha "Permitir configurações restritas". Depois volte e tente de novo.
                  </S.Hint>
                  <AnimatedPressable onPress={() => Linking.openSettings()}>
                    <S.LinkText>Abrir informações do app</S.LinkText>
                  </AnimatedPressable>
                </>
              )}
            </>
          ) : (
            <S.RowSubtitle>
              Disponível só no app Android instalado pelo APK (não funciona no Expo Go nem no iPhone).
            </S.RowSubtitle>
          )}
        </Card>

        <S.SectionLabel>Bancos monitorados</S.SectionLabel>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {BANKS.map((bank, idx) => (
            <S.Row key={bank.id} divider={idx < BANKS.length - 1}>
              <Ionicons name="business-outline" size={18} color={theme.textSecondary} />
              <S.RowLabel style={{ flex: 1 }}>{bank.name}</S.RowLabel>
              <Switch
                value={settings.enabledBanks.includes(bank.id)}
                onValueChange={() => toggleBank(bank.id)}
                trackColor={{ true: theme.primary, false: theme.border }}
                thumbColor="#FFFFFF"
              />
            </S.Row>
          ))}
        </Card>

        <S.SectionLabel>Pessoas</S.SectionLabel>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {settings.senderRules.length === 0 && <S.EmptyText>Nenhuma pessoa cadastrada</S.EmptyText>}
          {settings.senderRules.map((rule) => (
            <AnimatedPressable key={rule.name} onPress={() => setEditing(rule.name)}>
              <S.Row divider>
                <Ionicons name="person-circle-outline" size={22} color={theme.primary} />
                <S.RowInfo>
                  <S.RowLabel numberOfLines={1}>{rule.name}</S.RowLabel>
                  <S.RowSubtitle>{actionLabel(rule.action)}</S.RowSubtitle>
                </S.RowInfo>
                <AnimatedPressable hitSlop={10} onPress={() => confirmRemove(rule)}>
                  <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
                </AnimatedPressable>
              </S.Row>
            </AnimatedPressable>
          ))}
          <AnimatedPressable onPress={() => setEditing("")}>
            <S.Row>
              <Ionicons name="add-circle-outline" size={22} color={theme.primary} />
              <S.RowLabel style={{ color: theme.primary }}>Adicionar pessoa</S.RowLabel>
            </S.Row>
          </AnimatedPressable>
        </Card>
        {editing !== null && (
          <RuleForm
            key={editing}
            initial={editingRule}
            onCancel={() => setEditing(null)}
            onSave={(rule) => {
              saveRule(rule, editingRule?.name);
              setEditing(null);
            }}
          />
        )}
        <S.Hint>Use o nome como ele aparece na notificação; sobrenome abreviado também vale.</S.Hint>

        <S.SectionLabel>Pessoas não cadastradas</S.SectionLabel>
        <SegmentedControl options={UNKNOWN_OPTIONS} value={settings.unknownSender} onChange={setUnknownSender} />
        <S.Hint>{UNKNOWN_HINTS[settings.unknownSender]}</S.Hint>

        {pending.length > 0 && (
          <>
            <S.SectionLabel>Aguardando revisão ({pending.length})</S.SectionLabel>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {pending.map((d, idx) => renderDeposit(d, idx, pending, true))}
            </Card>
          </>
        )}

        <S.SectionLabel>Detectados recentemente</S.SectionLabel>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {history.length === 0 ? (
            <S.EmptyText>Nenhum depósito detectado ainda</S.EmptyText>
          ) : (
            history.map((d, idx) => renderDeposit(d, idx, history, false))
          )}
        </Card>
      </S.Scroll>
    </S.Container>
  );
}
