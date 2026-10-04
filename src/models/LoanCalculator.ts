/**
 * MODEL LAYER
 * Regras de negócio sobre empréstimos — agrupa os lançamentos (Loan) por
 * pessoa/instituição + direção, calculando o total em aberto de cada uma.
 * Totalmente separado de FinanceCalculator: empréstimos não entram no saldo.
 */
import { Loan, LoanGroup } from "./types";

export class LoanCalculator {
  static groupByPerson(loans: Loan[]): LoanGroup[] {
    const groups = new Map<string, LoanGroup>();

    for (const loan of loans) {
      const key = `${loan.kind}|${loan.person.trim().toLowerCase()}`;
      const effect = loan.type === "payment" ? -loan.amount : loan.amount;

      const existing = groups.get(key);
      if (existing) {
        existing.total += effect;
        existing.entries.push(loan);
        if (loan.date > existing.lastDate) existing.lastDate = loan.date;
      } else {
        groups.set(key, {
          key,
          kind: loan.kind,
          person: loan.person.trim(),
          total: effect,
          entries: [loan],
          lastDate: loan.date,
        });
      }
    }

    for (const group of groups.values()) {
      group.entries.sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    return Array.from(groups.values()).sort((a, b) => (a.lastDate < b.lastDate ? 1 : -1));
  }

  /** Soma do que ainda está em aberto para receber (empréstimos que EU fiz). */
  static totalReceivable(loans: Loan[]): number {
    return this.groupByPerson(loans)
      .filter((g) => g.kind === "lent")
      .reduce((sum, g) => sum + Math.max(g.total, 0), 0);
  }

  /** Soma do que ainda está em aberto para pagar (empréstimos que EU peguei). */
  static totalPayable(loans: Loan[]): number {
    return this.groupByPerson(loans)
      .filter((g) => g.kind === "borrowed")
      .reduce((sum, g) => sum + Math.max(g.total, 0), 0);
  }
}
