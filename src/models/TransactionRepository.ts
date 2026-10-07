/**
 * MODEL LAYER — persistência.
 * Encapsula todo o acesso ao SQLite para Transactions.
 * O Controller nunca fala com o banco diretamente, sempre por aqui.
 */
import { getDatabase, generateId } from "@/database";
import { Transaction } from "./types";

type TransactionRow = {
  id: string;
  kind: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  recurrence: string;
  installments_total: number | null;
  installments_current: number | null;
  recurrence_id: string | null;
};

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    kind: row.kind as Transaction["kind"],
    amount: row.amount,
    category: row.category,
    description: row.description,
    date: row.date,
    recurrence: row.recurrence as Transaction["recurrence"],
    installments:
      row.installments_total != null && row.installments_current != null
        ? { total: row.installments_total, current: row.installments_current }
        : undefined,
    recurrenceId: row.recurrence_id ?? undefined,
  };
}

export class TransactionRepository {
  static async getAll(): Promise<Transaction[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TransactionRow>(
      "SELECT * FROM transactions ORDER BY date DESC, rowid DESC"
    );
    return rows.map(rowToTransaction);
  }

  static async add(data: Omit<Transaction, "id">): Promise<Transaction[]> {
    const db = await getDatabase();
    const id = generateId();
    await db.runAsync(
      `INSERT INTO transactions
        (id, kind, amount, category, description, date, recurrence, installments_total, installments_current,
         recurrence_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.kind,
        data.amount,
        data.category,
        data.description,
        data.date,
        data.recurrence,
        data.installments?.total ?? null,
        data.installments?.current ?? null,
        data.recurrenceId ?? null,
      ]
    );
    return this.getAll();
  }

  static async update(id: string, data: Omit<Transaction, "id">): Promise<Transaction[]> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE transactions
         SET kind = ?, amount = ?, category = ?, description = ?, date = ?, recurrence = ?,
             installments_total = ?, installments_current = ?
       WHERE id = ?`,
      [
        data.kind,
        data.amount,
        data.category,
        data.description,
        data.date,
        data.recurrence,
        data.installments?.total ?? null,
        data.installments?.current ?? null,
        id,
      ]
    );
    return this.getAll();
  }

  static async remove(id: string): Promise<Transaction[]> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM transactions WHERE id = ?", [id]);
    return this.getAll();
  }
}
