/**
 * MODEL LAYER — persistência.
 * Encapsula todo o acesso ao SQLite para Loans.
 */
import { getDatabase } from "@/database";
import { Loan } from "./types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type LoanRow = {
  id: string;
  kind: string;
  person: string;
  amount: number;
  date: string;
  due_date: string | null;
  type: string;
  notes: string | null;
};

function rowToLoan(row: LoanRow): Loan {
  return {
    id: row.id,
    kind: row.kind as Loan["kind"],
    person: row.person,
    amount: row.amount,
    date: row.date,
    dueDate: row.due_date ?? undefined,
    type: row.type as Loan["type"],
    notes: row.notes ?? undefined,
  };
}

export class LoanRepository {
  static async getAll(): Promise<Loan[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<LoanRow>("SELECT * FROM loans ORDER BY rowid DESC");
    return rows.map(rowToLoan);
  }

  static async add(data: Omit<Loan, "id">): Promise<Loan[]> {
    const db = await getDatabase();
    const id = generateId();
    await db.runAsync(
      `INSERT INTO loans (id, kind, person, amount, date, due_date, type, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.kind,
        data.person,
        data.amount,
        data.date,
        data.dueDate ?? null,
        data.type,
        data.notes ?? null,
      ]
    );
    return this.getAll();
  }

  static async update(id: string, data: Omit<Loan, "id">): Promise<Loan[]> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE loans
         SET kind = ?, person = ?, amount = ?, date = ?, due_date = ?, type = ?, notes = ?
       WHERE id = ?`,
      [
        data.kind,
        data.person,
        data.amount,
        data.date,
        data.dueDate ?? null,
        data.type,
        data.notes ?? null,
        id,
      ]
    );
    return this.getAll();
  }

  static async remove(id: string): Promise<Loan[]> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM loans WHERE id = ?", [id]);
    return this.getAll();
  }
}
