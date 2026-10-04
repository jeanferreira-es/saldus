import * as SQLite from "expo-sqlite";

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
}
