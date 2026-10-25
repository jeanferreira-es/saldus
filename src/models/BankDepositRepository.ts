/**
 * MODEL LAYER — persistência.
 * Depósitos detectados pelas notificações dos bancos (histórico + pendentes de revisão).
 */
import { getDatabase } from "@/database";
import { BankDeposit } from "./types";

type BankDepositRow = {
  id: string;
  bank_id: string;
  sender: string;
  amount: number;
  date: string;
  text: string;
  status: string;
};

function rowToDeposit(row: BankDepositRow): BankDeposit {
  return {
    id: row.id,
    bankId: row.bank_id,
    sender: row.sender,
    amount: row.amount,
    date: row.date,
    text: row.text,
    status: row.status as BankDeposit["status"],
  };
}

/** Bancos às vezes publicam a mesma notificação mais de uma vez em poucos segundos. */
const DUPLICATE_WINDOW_MS = 3 * 60 * 1000;

export class BankDepositRepository {
  static async getRecent(limit = 50): Promise<BankDeposit[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BankDepositRow>(
      "SELECT * FROM bank_deposits ORDER BY date DESC LIMIT ?",
      [limit]
    );
    return rows.map(rowToDeposit);
  }

  static async getPending(): Promise<BankDeposit[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BankDepositRow>(
      "SELECT * FROM bank_deposits WHERE status = 'pending' ORDER BY date DESC"
    );
    return rows.map(rowToDeposit);
  }

  static async isDuplicate(deposit: BankDeposit): Promise<boolean> {
    const db = await getDatabase();
    const time = new Date(deposit.date).getTime();
    const row = await db.getFirstAsync(
      `SELECT 1 FROM bank_deposits
        WHERE id = ?
           OR (bank_id = ? AND amount = ? AND sender = ? AND date BETWEEN ? AND ?)
        LIMIT 1`,
      [
        deposit.id,
        deposit.bankId,
        deposit.amount,
        deposit.sender,
        new Date(time - DUPLICATE_WINDOW_MS).toISOString(),
        new Date(time + DUPLICATE_WINDOW_MS).toISOString(),
      ]
    );
    return row != null;
  }

  static async add(deposit: BankDeposit): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR IGNORE INTO bank_deposits (id, bank_id, sender, amount, date, text, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [deposit.id, deposit.bankId, deposit.sender, deposit.amount, deposit.date, deposit.text, deposit.status]
    );
  }

  static async setStatus(id: string, status: BankDeposit["status"]): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("UPDATE bank_deposits SET status = ? WHERE id = ?", [status, id]);
  }
}
