import { Alert } from "react-native";

interface RecordActionsOptions {
  onEdit: () => void;
  onDelete: () => void;
  /** Se informado, adiciona a opção de cancelar a compra recorrente deste lançamento. */
  onCancelRecurrence?: () => void;
}

/**
 * Abre o menu de ações de um registro (Editar / Excluir). Cada opção pede
 * uma confirmação antes de executar a ação.
 */
export function showRecordActions({ onEdit, onDelete, onCancelRecurrence }: RecordActionsOptions) {
  const confirmEdit = () =>
    Alert.alert("Editar lançamento", "Deseja editar este registro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Editar", onPress: onEdit },
    ]);

  const confirmDelete = () =>
    Alert.alert("Excluir lançamento", "Deseja remover este registro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: onDelete },
    ]);

  Alert.alert("Lançamento", "O que deseja fazer com este registro?", [
    { text: "Cancelar", style: "cancel" },
    { text: "Editar", onPress: confirmEdit },
    ...(onCancelRecurrence
      ? [{ text: "Interromper gasto futuro", onPress: () => confirmCancelRecurrence(onCancelRecurrence) }]
      : []),
    { text: "Excluir", style: "destructive", onPress: confirmDelete },
  ]);
}

/**
 * Confirma a interrupção de um gasto futuro (conta recorrente ou parcelada). Os lançamentos
 * já feitos continuam no histórico — só param de ser gerados os dos próximos meses.
 */
export function confirmCancelRecurrence(onConfirm: () => void) {
  Alert.alert(
    "Interromper gasto futuro",
    "Os descontos já feitos continuam no histórico, mas nenhum novo será lançado a partir de agora.",
    [
      { text: "Voltar", style: "cancel" },
      { text: "Interromper", style: "destructive", onPress: onConfirm },
    ]
  );
}
