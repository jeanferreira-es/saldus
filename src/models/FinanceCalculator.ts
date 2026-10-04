/**
 * MODEL LAYER
 * Regras de negócio puras sobre Transaction/Loan. Toda a "matemática"
 * do app mora aqui — nada de estado, React ou storage.
 */
import { Transaction, TransactionKind } from "./types";

export interface CategoryTotal {
  category: string;
  total: number;
}

export class FinanceCalculator {
  /**
   * Saldo atual = receitas - despesas (todas as transações já lançadas).
   * Empréstimos NÃO entram aqui — são tratados separadamente (ver LoanCalculator),
   * já que representam dinheiro de terceiros, não o caixa do usuário.
   */
  static balance(transactions: Transaction[]): number {
    return transactions.reduce((sum, t) => {
      return t.kind === "income" ? sum + t.amount : sum - t.amount;
    }, 0);
  }

  static sumByKind(transactions: Transaction[], kind: TransactionKind): number {
    return transactions.filter((t) => t.kind === kind).reduce((sum, t) => sum + t.amount, 0);
  }

  private static isSameMonth(iso: string, ref: Date): boolean {
    const d = new Date(iso);
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  }

  static transactionsInMonth(transactions: Transaction[], ref: Date): Transaction[] {
    return transactions.filter((t) => this.isSameMonth(t.date, ref));
  }

  /**
   * Quanto já está comprometido no PRÓXIMO mês:
   * - todas as despesas recorrentes (assinaturas, aluguel...) tendem a se repetir
   * - parcelas de compras parceladas que ainda não terminaram
   * (Empréstimos não entram aqui — ver LoanCalculator.)
   */
  static nextMonthCommitment(transactions: Transaction[]): number {
    const recurringExpenses = transactions
      .filter((t) => t.kind === "expense" && t.recurrence === "recurring")
      .reduce((sum, t) => sum + t.amount, 0);

    const remainingInstallments = transactions
      .filter(
        (t) =>
          t.kind === "expense" &&
          t.recurrence === "installment" &&
          t.installments &&
          t.installments.current < t.installments.total
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return recurringExpenses + remainingInstallments;
  }

  static totalsByCategory(transactions: Transaction[], kind: TransactionKind): CategoryTotal[] {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.kind === kind)
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
      });
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }
}
