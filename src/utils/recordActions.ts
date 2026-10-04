import { Alert } from "react-native";

interface RecordActionsOptions {
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Abre o menu de ações de um registro (Editar / Excluir). Cada opção pede
 * uma confirmação antes de executar a ação.
 */
export function showRecordActions({ onEdit, onDelete }: RecordActionsOptions) {
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
    { text: "Excluir", style: "destructive", onPress: confirmDelete },
  ]);
}
