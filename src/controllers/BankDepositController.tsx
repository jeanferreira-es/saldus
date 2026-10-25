/**
 * CONTROLLER LAYER
 * Depósitos automáticos (só Android): esvazia a fila de notificações capturadas
 * pelo serviço nativo, identifica valor e remetente e, conforme as regras do usuário,
 * lança como receita, como empréstimo ou deixa aguardando revisão.
 * Saídas continuam sendo registradas manualmente.
 */
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as BankNotifications from "../../modules/bank-notifications";
import { useFinanceController } from "@/controllers/FinanceController";
import {
  BankDeposit,
  BankDepositSettings,
  DepositAction,
  SenderRule,
  UnknownSenderPolicy,
} from "@/models/types";
import { bankName } from "@/models/banks";
import { DepositParser } from "@/models/DepositParser";
import { BankDepositRepository } from "@/models/BankDepositRepository";
import {
  BankDepositSettingsRepository,
  DEFAULT_BANK_DEPOSIT_SETTINGS,
} from "@/models/BankDepositSettingsRepository";

interface BankDepositControllerValue {
  supported: boolean;
  permissionGranted: boolean;
  settings: BankDepositSettings;
  pending: BankDeposit[];
  recent: BankDeposit[];
  openPermissionSettings: () => void;
  toggleBank: (bankId: string) => Promise<void>;
  saveRule: (rule: SenderRule, previousName?: string) => Promise<void>;
  removeRule: (name: string) => Promise<void>;
  setUnknownSender: (policy: UnknownSenderPolicy) => Promise<void>;
  resolveDeposit: (deposit: BankDeposit, action: DepositAction, remember: boolean) => Promise<void>;
}

const BankDepositControllerContext = createContext<BankDepositControllerValue | undefined>(undefined);

export function BankDepositControllerProvider({ children }: { children: React.ReactNode }) {
  const { addTransaction, addLoan } = useFinanceController();
  const [settings, setSettings] = useState<BankDepositSettings>(DEFAULT_BANK_DEPOSIT_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [pending, setPending] = useState<BankDeposit[]>([]);
  const [recent, setRecent] = useState<BankDeposit[]>([]);

  // A sincronização roda a partir de eventos nativos/AppState: lê sempre a versão mais recente.
  const settingsRef = useRef(settings);
  const queue = useRef<Promise<void>>(Promise.resolve());

  const reload = async () => {
    const [pend, rec] = await Promise.all([BankDepositRepository.getPending(), BankDepositRepository.getRecent()]);
    setPending(pend);
    setRecent(rec);
  };

  /** Serializa as operações para a mesma notificação nunca ser lançada duas vezes. */
  const enqueue = (task: () => Promise<void>) => {
    queue.current = queue.current.then(task).catch((e) => console.warn("Depósitos automáticos:", e));
    return queue.current;
  };

  const updateSettings = async (next: BankDepositSettings) => {
    settingsRef.current = next;
    setSettings(next);
    BankNotifications.setAllowedPackages(next.enabledBanks);
    await BankDepositSettingsRepository.set(next);
  };

  /** Lança o depósito como receita ou empréstimo. "pending"/"ignore" não geram registro. */
  const apply = async (deposit: BankDeposit, action: DepositAction | "pending") => {
    const rule = DepositParser.matchRule(deposit.sender, settingsRef.current.senderRules);
    const person = rule?.name ?? DepositParser.displayName(deposit.sender);
    const notes = `Registrado pela notificação do ${bankName(deposit.bankId)}`;

    if (action === "income") {
      await addTransaction({
        kind: "income",
        amount: deposit.amount,
        category: "Transferência",
        description: person ? `Pix de ${person}` : `Depósito · ${bankName(deposit.bankId)}`,
        date: deposit.date,
        recurrence: "none",
      });
    } else if ((action === "borrowed" || action === "repayment") && person) {
      await addLoan({
        kind: action === "borrowed" ? "borrowed" : "lent",
        type: action === "borrowed" ? "loan" : "payment",
        person,
        amount: deposit.amount,
        date: deposit.date,
        notes,
      });
    }
  };

  const sync = () =>
    enqueue(async () => {
      for (const raw of BankNotifications.drain()) {
        const parsed = DepositParser.parse(raw.title, raw.text);
        if (!parsed) continue;
        const deposit: BankDeposit = {
          id: raw.id,
          bankId: raw.packageName,
          sender: parsed.sender,
          amount: parsed.amount,
          date: new Date(raw.postedAt).toISOString(),
          text: [raw.title, raw.text].filter(Boolean).join(" · "),
          status: DepositParser.decide(parsed.sender, settingsRef.current),
        };
        if (await BankDepositRepository.isDuplicate(deposit)) continue;
        await BankDepositRepository.add(deposit);
        await apply(deposit, deposit.status);
      }
      await reload();
    });

  useEffect(() => {
    if (!BankNotifications.isSupported) return;

    (async () => {
      const stored = await BankDepositSettingsRepository.get();
      settingsRef.current = stored;
      setSettings(stored);
      BankNotifications.setAllowedPackages(stored.enabledBanks);
      setPermissionGranted(BankNotifications.isPermissionGranted());
      await sync();
    })();

    const notificationSub = BankNotifications.addNotificationListener(() => sync());
    // Ao voltar das configurações do sistema (permissão) ou com notificações acumuladas.
    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      setPermissionGranted(BankNotifications.isPermissionGranted());
      sync();
    });
    return () => {
      notificationSub.remove();
      appStateSub.remove();
    };
  }, []);

  const toggleBank = (bankId: string) =>
    enqueue(async () => {
      const current = settingsRef.current;
      const enabledBanks = current.enabledBanks.includes(bankId)
        ? current.enabledBanks.filter((id) => id !== bankId)
        : [...current.enabledBanks, bankId];
      await updateSettings({ ...current, enabledBanks });
    });

  /** Salva a regra e já aplica aos depósitos pendentes dessa pessoa. */
  const saveRule = (rule: SenderRule, previousName?: string) =>
    enqueue(async () => {
      const current = settingsRef.current;
      const replaced = DepositParser.normalizeName(previousName ?? rule.name);
      const senderRules = [
        ...current.senderRules.filter((r) => DepositParser.normalizeName(r.name) !== replaced),
        { name: rule.name.trim(), action: rule.action },
      ].sort((a, b) => a.name.localeCompare(b.name));
      await updateSettings({ ...current, senderRules });

      for (const deposit of await BankDepositRepository.getPending()) {
        const matched = DepositParser.matchRule(deposit.sender, senderRules);
        if (!matched) continue;
        await BankDepositRepository.setStatus(deposit.id, matched.action);
        await apply(deposit, matched.action);
      }
      await reload();
    });

  const removeRule = (name: string) =>
    enqueue(async () => {
      const current = settingsRef.current;
      await updateSettings({ ...current, senderRules: current.senderRules.filter((r) => r.name !== name) });
    });

  const setUnknownSender = (policy: UnknownSenderPolicy) =>
    enqueue(() => updateSettings({ ...settingsRef.current, unknownSender: policy }));

  const resolveDeposit = async (deposit: BankDeposit, action: DepositAction, remember: boolean) => {
    if (remember && deposit.sender) {
      return saveRule({ name: DepositParser.displayName(deposit.sender), action });
    }
    return enqueue(async () => {
      await BankDepositRepository.setStatus(deposit.id, action);
      await apply(deposit, action);
      await reload();
    });
  };

  const value: BankDepositControllerValue = {
    supported: BankNotifications.isSupported,
    permissionGranted,
    settings,
    pending,
    recent,
    openPermissionSettings: BankNotifications.openPermissionSettings,
    toggleBank,
    saveRule,
    removeRule,
    setUnknownSender,
    resolveDeposit,
  };

  return (
    <BankDepositControllerContext.Provider value={value}>{children}</BankDepositControllerContext.Provider>
  );
}

export function useBankDepositController() {
  const ctx = useContext(BankDepositControllerContext);
  if (!ctx) throw new Error("useBankDepositController deve ser usado dentro de BankDepositControllerProvider");
  return ctx;
}
