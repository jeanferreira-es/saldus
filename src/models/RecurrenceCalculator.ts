/**
 * MODEL LAYER
 * Regras de negócio puras sobre gastos futuros (contas recorrentes e compras
 * parceladas): em que data cai cada ocorrência, quais já venceram e quanto
 * ainda vai ser descontado do saldo.
 */
import { Recurrence } from "./types";

export class RecurrenceCalculator {
  /** Diferença em meses de calendário entre duas datas (ignora o dia). */
  static monthsBetween(fromIso: string, to: Date): number {
    const from = new Date(fromIso);
    return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  }

  /** Dia do desconto: o escolhido pelo usuário ou, em regras antigas, o dia da primeira ocorrência. */
  static dueDay(recurrence: Pick<Recurrence, "startDate" | "dueDay">): number {
    return recurrence.dueDay ?? new Date(recurrence.startDate).getDate();
  }

  /**
   * Data da ocorrência de índice `index` (0 = mês de startDate). Cai no dia do desconto,
   * limitado ao último dia do mês (dia 31 → 28/02 → 31/03).
   */
  static occurrenceDate(recurrence: Pick<Recurrence, "startDate" | "dueDay">, index: number): Date {
    const start = new Date(recurrence.startDate);
    const monthStart = new Date(start.getFullYear(), start.getMonth() + index, 1);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const date = new Date(start);
    date.setFullYear(
      monthStart.getFullYear(),
      monthStart.getMonth(),
      Math.min(this.dueDay(recurrence), daysInMonth)
    );
    return date;
  }

  /**
   * Primeira data de desconto no dia `day` estritamente depois de hoje: cadastrar um
   * gasto futuro nunca mexe no saldo na hora (vencendo hoje, o primeiro é no mês que vem).
   */
  static firstDueDate(day: number, now: Date): Date {
    const rule = { startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), dueDay: day };
    const thisMonth = this.occurrenceDate(rule, 0); // meia-noite do dia do desconto
    return thisMonth > now ? thisMonth : this.occurrenceDate(rule, 1);
  }

  /** Número da parcela correspondente à ocorrência `index` (só para parceladas). */
  static installmentNumber(recurrence: Recurrence, index: number): number | undefined {
    return recurrence.installments ? recurrence.installments.start + index : undefined;
  }

  /** Quantas ocorrências a regra tem ao todo (undefined = até ser interrompida). */
  static totalOccurrences(recurrence: Recurrence): number | undefined {
    if (recurrence.installments) return recurrence.installments.total - recurrence.installments.start + 1;
    return recurrence.maxOccurrences;
  }

  /** A ocorrência `index` ainda faz parte da regra (não passou da última parcela/mês)? */
  static hasOccurrence(recurrence: Recurrence, index: number): boolean {
    if (index < 0) return false;
    const total = this.totalOccurrences(recurrence);
    return total === undefined || index < total;
  }

  /** Índices das ocorrências que já venceram até `now` e ainda não viraram lançamento. */
  static dueOccurrences(recurrence: Recurrence, now: Date): number[] {
    const due: number[] = [];
    for (let index = recurrence.generatedCount; this.hasOccurrence(recurrence, index); index++) {
      const date = this.occurrenceDate(recurrence, index);
      if (date > now) break;
      if (recurrence.canceledAt && date >= new Date(recurrence.canceledAt)) break;
      due.push(index);
    }
    return due;
  }

  /** A regra ainda vai gerar lançamentos no futuro? */
  static isActive(recurrence: Recurrence): boolean {
    if (recurrence.canceledAt) return false;
    return this.hasOccurrence(recurrence, recurrence.generatedCount);
  }

  /** Data do próximo desconto, se ainda houver. */
  static nextDueDate(recurrence: Recurrence): Date | undefined {
    return this.isActive(recurrence) ? this.occurrenceDate(recurrence, recurrence.generatedCount) : undefined;
  }

  /** Quantas ocorrências ainda faltam descontar (undefined = sem fim definido). */
  static remainingOccurrences(recurrence: Recurrence): number | undefined {
    if (recurrence.canceledAt) return 0;
    const total = this.totalOccurrences(recurrence);
    return total === undefined ? undefined : Math.max(total - recurrence.generatedCount, 0);
  }

  /** Valor desta regra no mês de `month` (0 se não houver ocorrência nele). */
  static amountInMonth(recurrence: Recurrence, month: Date): number {
    if (recurrence.canceledAt) return 0;
    const index = this.monthsBetween(recurrence.startDate, month);
    return this.hasOccurrence(recurrence, index) ? recurrence.amount : 0;
  }

  /** O que ainda vai ser descontado ESTE mês (ocorrências do mês que não viraram lançamento). */
  static remainingThisMonth(recurrences: Recurrence[], now: Date): number {
    return recurrences
      .filter((r) => r.kind === "expense" && !r.canceledAt)
      .reduce((sum, r) => {
        const index = this.monthsBetween(r.startDate, now);
        return index >= r.generatedCount && this.hasOccurrence(r, index) ? sum + r.amount : sum;
      }, 0);
  }

  /**
   * Quanto já está comprometido no PRÓXIMO mês: contas recorrentes ativas +
   * parcelas que ainda caem no mês seguinte. Cada regra conta uma única vez.
   */
  static nextMonthCommitment(recurrences: Recurrence[], now: Date): number {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return recurrences
      .filter((r) => r.kind === "expense")
      .reduce((sum, r) => sum + this.amountInMonth(r, nextMonth), 0);
  }
}
