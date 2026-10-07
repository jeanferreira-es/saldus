/**
 * MODEL LAYER
 * Regras de negócio puras sobre compras recorrentes e parceladas: em que data
 * cai cada ocorrência, quais já venceram e quanto compromete o próximo mês.
 */
import { Recurrence } from "./types";

export class RecurrenceCalculator {
  /** Diferença em meses de calendário entre duas datas (ignora o dia). */
  static monthsBetween(fromIso: string, to: Date): number {
    const from = new Date(fromIso);
    return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  }

  /**
   * Data da ocorrência de índice `index` (0 = startDate). Mantém o dia do mês da
   * primeira ocorrência, limitado ao último dia do mês (31/01 → 28/02 → 31/03).
   */
  static occurrenceDate(recurrence: Recurrence, index: number): Date {
    const start = new Date(recurrence.startDate);
    const monthStart = new Date(start.getFullYear(), start.getMonth() + index, 1);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const date = new Date(start);
    date.setFullYear(monthStart.getFullYear(), monthStart.getMonth(), Math.min(start.getDate(), daysInMonth));
    return date;
  }

  /** Número da parcela correspondente à ocorrência `index` (só para parceladas). */
  static installmentNumber(recurrence: Recurrence, index: number): number | undefined {
    return recurrence.installments ? recurrence.installments.start + index : undefined;
  }

  /** A ocorrência `index` ainda faz parte da regra (não passou da última parcela)? */
  static hasOccurrence(recurrence: Recurrence, index: number): boolean {
    if (index < 0) return false;
    const number = this.installmentNumber(recurrence, index);
    return number === undefined || number <= (recurrence.installments?.total ?? 0);
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
  static isActive(recurrence: Recurrence, now: Date): boolean {
    if (recurrence.canceledAt) return false;
    return this.hasOccurrence(recurrence, this.monthsBetween(recurrence.startDate, now) + 1);
  }

  /** Valor desta regra no mês de `month` (0 se não houver ocorrência nele). */
  static amountInMonth(recurrence: Recurrence, month: Date): number {
    if (recurrence.canceledAt) return 0;
    const index = this.monthsBetween(recurrence.startDate, month);
    return this.hasOccurrence(recurrence, index) ? recurrence.amount : 0;
  }

  /**
   * Quanto já está comprometido no PRÓXIMO mês: despesas recorrentes ativas +
   * parcelas que ainda caem no mês seguinte. Cada regra conta uma única vez.
   */
  static nextMonthCommitment(recurrences: Recurrence[], now: Date): number {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return recurrences
      .filter((r) => r.kind === "expense")
      .reduce((sum, r) => sum + this.amountInMonth(r, nextMonth), 0);
  }
}
