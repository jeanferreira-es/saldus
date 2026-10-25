import * as SQLite from "expo-sqlite";
import { RecurrenceCalculator } from "@/models/RecurrenceCalculator";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("mymoney.db");
  }
  return dbPromise;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      recurrence TEXT NOT NULL,
      installments_total INTEGER,
      installments_current INTEGER
    );

    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      person TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      due_date TEXT,
      type TEXT NOT NULL DEFAULT 'loan',
      notes TEXT
    );
  `);

  // Migração: bancos criados antes da introdução do campo `type` (que substituiu `paid`).
  const loanColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(loans)");
  const hasType = loanColumns.some((c) => c.name === "type");
  if (!hasType) {
    await db.execAsync("ALTER TABLE loans ADD COLUMN type TEXT NOT NULL DEFAULT 'loan'");
  }
  const hasPaid = loanColumns.some((c) => c.name === "paid");
  if (hasPaid) {
    // A coluna antiga era NOT NULL sem default — INSERTs novos (que não a preenchem) quebrariam.
    await db.execAsync("ALTER TABLE loans DROP COLUMN paid");
  }

  await runMigrations(db);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Migrações versionadas via `PRAGMA user_version`: cada função roda uma única vez,
 * em ordem, dentro de uma transação. Para evoluir o schema, adicione ao final.
 */
const MIGRATIONS: ((db: SQLite.SQLiteDatabase) => Promise<void>)[] = [migrateToRecurrences, createBankDeposits];

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;
  for (let version = current; version < MIGRATIONS.length; version++) {
    await db.withTransactionAsync(async () => {
      await MIGRATIONS[version](db);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

type LegacyRow = {
  id: string;
  kind: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  recurrence: "recurring" | "installment";
  installments_total: number | null;
  installments_current: number | null;
};

/**
 * v1: compras recorrentes/parceladas passam a ser regras (tabela `recurrences`) que
 * geram um lançamento por mês. Os lançamentos antigos são agrupados por compra
 * (mesma categoria + descrição) e ligados a uma regra criada a partir do mais recente.
 * Não gera retroativamente: a próxima ocorrência automática é a do mês seguinte.
 */
async function migrateToRecurrences(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recurrences (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TEXT NOT NULL,
      installments_start INTEGER,
      installments_total INTEGER,
      generated_count INTEGER NOT NULL,
      canceled_at TEXT
    );
  `);

  const columns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(transactions)");
  if (!columns.some((c) => c.name === "recurrence_id")) {
    await db.execAsync("ALTER TABLE transactions ADD COLUMN recurrence_id TEXT");
  }

  const legacy = await db.getAllAsync<LegacyRow>(
    `SELECT * FROM transactions
      WHERE recurrence IN ('recurring', 'installment') AND recurrence_id IS NULL`
  );

  const groups = new Map<string, LegacyRow[]>();
  for (const row of legacy) {
    if (row.recurrence === "installment" && (row.installments_total == null || row.installments_current == null)) {
      continue;
    }
    const description = row.description.trim().toLowerCase();
    // Sem descrição, o valor ajuda a não juntar compras diferentes da mesma categoria.
    const key = [
      row.kind,
      row.recurrence,
      row.category,
      description,
      description ? "" : row.amount,
      row.recurrence === "installment" ? row.installments_total : "",
    ].join("|");
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  const now = new Date();
  for (const rows of groups.values()) {
    // Modelo da regra: a parcela mais avançada (parceladas) ou o lançamento mais recente.
    const template = rows.reduce((best, row) => {
      const rowCurrent = row.installments_current ?? 0;
      const bestCurrent = best.installments_current ?? 0;
      if (rowCurrent !== bestCurrent) return rowCurrent > bestCurrent ? row : best;
      return row.date > best.date ? row : best;
    });
    const id = generateId();
    await db.runAsync(
      `INSERT INTO recurrences
        (id, kind, type, amount, category, description, start_date,
         installments_start, installments_total, generated_count, canceled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        id,
        template.kind,
        template.recurrence,
        template.amount,
        template.category,
        template.description,
        template.date,
        template.recurrence === "installment" ? template.installments_current : null,
        template.recurrence === "installment" ? template.installments_total : null,
        Math.max(RecurrenceCalculator.monthsBetween(template.date, now) + 1, 1),
      ]
    );
    for (const row of rows) {
      await db.runAsync("UPDATE transactions SET recurrence_id = ? WHERE id = ?", [id, row.id]);
    }
  }
}

/** v2: depósitos detectados pelas notificações dos bancos (Android). */
async function createBankDeposits(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bank_deposits (
      id TEXT PRIMARY KEY,
      bank_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      text TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);
}
