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
  paid: number;
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
    paid: row.paid === 1,
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
      `INSERT INTO loans (id, kind, person, amount, date, due_date, paid, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.kind,
        data.person,
        data.amount,
        data.date,
        data.dueDate ?? null,
        data.paid ? 1 : 0,
        data.notes ?? null,
      ]
    );
    return this.getAll();
  }

  static async remove(id: string): Promise<Loan[]> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM loans WHERE id = ?", [id]);
    return this.getAll();
  }

  static async togglePaid(id: string): Promise<Loan[]> {
    const db = await getDatabase();
    await db.runAsync("UPDATE loans SET paid = 1 - paid WHERE id = ?", [id]);
    return this.getAll();
  }
}
