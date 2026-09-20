/**
 * MODEL LAYER — persistência.
 * Encapsula todo o acesso ao SQLite para Transactions.
 * O Controller nunca fala com o banco diretamente, sempre por aqui.
 */
import { getDatabase } from "@/database";
import { Transaction } from "./types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

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
  };
}

export class TransactionRepository {
  static async getAll(): Promise<Transaction[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TransactionRow>(
      "SELECT * FROM transactions ORDER BY rowid DESC"
    );
    return rows.map(rowToTransaction);
  }

  static async add(data: Omit<Transaction, "id">): Promise<Transaction[]> {
    const db = await getDatabase();
    const id = generateId();
    await db.runAsync(
      `INSERT INTO transactions
        (id, kind, amount, category, description, date, recurrence, installments_total, installments_current)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
