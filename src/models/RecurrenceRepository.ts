/**
 * MODEL LAYER — persistência.
 * Encapsula todo o acesso ao SQLite para Recurrences (compras recorrentes e
 * parceladas) e a geração dos lançamentos mensais a partir delas.
 */
import { getDatabase, generateId } from "@/database";
import { RecurrenceCalculator } from "./RecurrenceCalculator";
import { Recurrence } from "./types";

type RecurrenceRow = {
  id: string;
  kind: string;
  type: string;
  amount: number;
  category: string;
  description: string;
  start_date: string;
  installments_start: number | null;
  installments_total: number | null;
  generated_count: number;
  canceled_at: string | null;
  due_day: number | null;
  max_occurrences: number | null;
};

/** Campos que o usuário define ao cadastrar/editar um gasto futuro. */
export type RecurrenceInput = Omit<Recurrence, "id" | "generatedCount" | "canceledAt">;

function rowToRecurrence(row: RecurrenceRow): Recurrence {
  return {
    id: row.id,
    kind: row.kind as Recurrence["kind"],
    type: row.type as Recurrence["type"],
    amount: row.amount,
    category: row.category,
    description: row.description,
    startDate: row.start_date,
    dueDay: row.due_day ?? undefined,
    maxOccurrences: row.max_occurrences ?? undefined,
    installments:
      row.installments_start != null && row.installments_total != null
        ? { start: row.installments_start, total: row.installments_total }
        : undefined,
    generatedCount: row.generated_count,
    canceledAt: row.canceled_at ?? undefined,
  };
}

export class RecurrenceRepository {
  static async getAll(): Promise<Recurrence[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<RecurrenceRow>("SELECT * FROM recurrences ORDER BY rowid DESC");
    return rows.map(rowToRecurrence);
  }

  /**
   * Cria a regra. Cada ocorrência só vira lançamento quando chega o dia do desconto
   * (com startDate no futuro, o saldo não muda agora).
   */
  static async add(data: RecurrenceInput): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO recurrences
        (id, kind, type, amount, category, description, start_date,
         installments_start, installments_total, generated_count, canceled_at, due_day, max_occurrences)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)`,
      [
        generateId(),
        data.kind,
        data.type,
        data.amount,
        data.category,
        data.description,
        data.startDate,
        data.installments?.start ?? null,
        data.installments?.total ?? null,
        data.dueDay ?? null,
        data.maxOccurrences ?? null,
      ]
    );
    await this.generateDue(new Date());
  }

  /**
   * Edita a regra. Vale para os próximos descontos: os lançamentos já gerados
   * continuam como estão. O tipo e o mês inicial não mudam.
   */
  static async update(
    id: string,
    data: Pick<RecurrenceInput, "amount" | "category" | "description" | "dueDay" | "maxOccurrences" | "installments">
  ): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE recurrences
         SET amount = ?, category = ?, description = ?, due_day = ?, max_occurrences = ?,
             installments_start = ?, installments_total = ?
       WHERE id = ?`,
      [
        data.amount,
        data.category,
        data.description,
        data.dueDay ?? null,
        data.maxOccurrences ?? null,
        data.installments?.start ?? null,
        data.installments?.total ?? null,
        id,
      ]
    );
    await this.generateDue(new Date());
  }

  /** Encerra a regra: nada novo é gerado, os lançamentos já existentes continuam no histórico. */
  static async cancel(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("UPDATE recurrences SET canceled_at = ? WHERE id = ? AND canceled_at IS NULL", [
      new Date().toISOString(),
      id,
    ]);
  }

  /** Exclui a regra, desde que ela não tenha lançamentos (senão, use `cancel`). */
  static async remove(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      "DELETE FROM recurrences WHERE id = ? AND NOT EXISTS (SELECT 1 FROM transactions WHERE recurrence_id = ?)",
      [id, id]
    );
  }

  /**
   * Gera os lançamentos de todas as ocorrências que já venceram até `now` e ainda
   * não foram lançadas (ex: o app ficou meses sem ser aberto). Lançamentos excluídos
   * pelo usuário não voltam, porque o progresso fica salvo em `generated_count`.
   * Retorna quantos lançamentos foram criados.
   */
  static generateDue(now: Date): Promise<number> {
    // Execuções em fila: duas gerações simultâneas (abertura + volta do background)
    // leriam o mesmo generated_count e duplicariam lançamentos.
    const run = this.generating.then(() => this.runGenerateDue(now));
    this.generating = run.catch(() => undefined);
    return run;
  }

  private static generating: Promise<unknown> = Promise.resolve();

  private static async runGenerateDue(now: Date): Promise<number> {
    const db = await getDatabase();
    const recurrences = await this.getAll();
    let created = 0;

    await db.withTransactionAsync(async () => {
      for (const recurrence of recurrences) {
        const due = RecurrenceCalculator.dueOccurrences(recurrence, now);
        if (due.length === 0) continue;

        for (const index of due) {
          const current = RecurrenceCalculator.installmentNumber(recurrence, index);
          await db.runAsync(
            `INSERT INTO transactions
              (id, kind, amount, category, description, date, recurrence, installments_total,
               installments_current, recurrence_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              generateId(),
              recurrence.kind,
              recurrence.amount,
              recurrence.category,
              recurrence.description,
              RecurrenceCalculator.occurrenceDate(recurrence, index).toISOString(),
              recurrence.type,
              recurrence.installments?.total ?? null,
              current ?? null,
              recurrence.id,
            ]
          );
        }
        await db.runAsync("UPDATE recurrences SET generated_count = ? WHERE id = ?", [
          due[due.length - 1] + 1,
          recurrence.id,
        ]);
        created += due.length;
      }
    });

    return created;
  }
}
