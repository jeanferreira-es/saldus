/**
 * MODEL LAYER
 * Regras de negócio puras sobre Transaction/Loan. Toda a "matemática"
 * do app mora aqui — nada de estado, React ou storage.
 */
import { Transaction, Loan, TransactionKind } from "./types";

export interface CategoryTotal {
  category: string;
  total: number;
}

export class FinanceCalculator {
  /**
   * Saldo atual = receitas - despesas (todas as transações já lançadas)
   * + efeito líquido dos empréstimos em aberto.
   *
   * Empréstimo que EU FIZ para alguém (lent) e ainda não foi pago de volta:
   *   dinheiro saiu do meu bolso -> reduz o saldo.
   * Empréstimo que EU PEGUEI (borrowed) e ainda não paguei de volta:
   *   dinheiro entrou no meu bolso -> aumenta o saldo.
   * Uma vez marcado como quitado, o efeito é neutro (o dinheiro já "voltou").
   */
  static balance(transactions: Transaction[], loans: Loan[]): number {
    const txTotal = transactions.reduce((sum, t) => {
      return t.kind === "income" ? sum + t.amount : sum - t.amount;
    }, 0);

    const loanEffect = loans.reduce((sum, loan) => {
      if (loan.paid) return sum;
      return loan.kind === "lent" ? sum - loan.amount : sum + loan.amount;
    }, 0);

    return txTotal + loanEffect;
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
   * - empréstimos que peguei (borrowed) ainda não pagos, com vencimento no próximo mês
   */
  static nextMonthCommitment(transactions: Transaction[], loans: Loan[]): number {
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

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const borrowedDueNextMonth = loans
      .filter(
        (l) => l.kind === "borrowed" && !l.paid && l.dueDate && this.isSameMonth(l.dueDate, nextMonth)
      )
      .reduce((sum, l) => sum + l.amount, 0);

    return recurringExpenses + remainingInstallments + borrowedDueNextMonth;
  }

  /** Quanto eu devo RECEBER de volta no próximo mês (empréstimos que fiz). */
  static nextMonthReceivable(loans: Loan[]): number {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return loans
      .filter((l) => l.kind === "lent" && !l.paid && l.dueDate && this.isSameMonth(l.dueDate, nextMonth))
      .reduce((sum, l) => sum + l.amount, 0);
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
