import { useNavigation } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import { Transaction } from "@/models/types";
import { showRecordActions } from "@/utils/recordActions";

/**
 * Menu de ações de um lançamento (Editar / Cancelar recorrência / Excluir),
 * compartilhado pelas telas que listam transações.
 */
export function useTransactionActions() {
  const { recurrences, removeTransaction, cancelRecurrence } = useFinanceController();
  const navigation = useNavigation<any>();

  return (transaction: Transaction) => {
    const recurrence = recurrences.find((r) => r.id === transaction.recurrenceId);
    const cancellable = recurrence?.type === "recurring" && !recurrence.canceledAt;

    showRecordActions({
      onEdit: () => navigation.navigate("AddTransaction", { id: transaction.id }),
      onDelete: () => removeTransaction(transaction.id),
      onCancelRecurrence: cancellable ? () => cancelRecurrence(recurrence.id) : undefined,
    });
  };
}
