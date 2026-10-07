/**
 * MODEL LAYER
 * Tipos e entidades puras do domínio. Não sabem nada sobre telas,
 * navegação ou estilo — apenas descrevem os dados da aplicação.
 */

export type TransactionKind = "income" | "expense";

/**
 * Como a transação se comporta ao longo do tempo:
 * - "none": à vista — paga agora, não compromete meses futuros
 * - "recurring": recorrente — repete todo mês (assinatura, aluguel, etc.)
 * - "installment": parcelada — tem N parcelas, cada parcela compromete um mês futuro
 */
export type RecurrenceType = "none" | "recurring" | "installment";

export interface Installments {
  total: number;
  current: number; // qual parcela esta transação representa (1-indexed)
}

export interface Transaction {
  id: string;
  kind: TransactionKind;
  amount: number; // valor desta entrada (ou valor da parcela, se parcelado)
  category: string;
  description: string;
  date: string; // ISO string
  recurrence: RecurrenceType;
  installments?: Installments;
  recurrenceId?: string; // lançamento gerado a partir de uma Recurrence
}

/**
 * Regra de uma compra recorrente ou parcelada. Cada mês vira um lançamento
 * (Transaction) próprio, gerado automaticamente a partir desta regra.
 * - "recurring": gera um lançamento por mês até ser cancelada
 * - "installment": gera um lançamento por parcela até a última
 * Cancelar só interrompe as gerações futuras — os lançamentos já gerados ficam no histórico.
 */
export interface Recurrence {
  id: string;
  kind: TransactionKind;
  type: Exclude<RecurrenceType, "none">;
  amount: number;
  category: string;
  description: string;
  startDate: string; // ISO string — data da primeira ocorrência
  installments?: { start: number; total: number }; // parcela da primeira ocorrência e total
  generatedCount: number; // quantas ocorrências (a partir de startDate) já viraram lançamento
  canceledAt?: string; // ISO string
}

/**
 * "lent": dinheiro que EU emprestei para outra pessoa (a receber)
 * "borrowed": dinheiro que EU peguei emprestado de outra pessoa (a pagar)
 */
export type LoanKind = "lent" | "borrowed";

/**
 * Cada empréstimo é um lançamento num "extrato" por pessoa:
 * - "loan": aumenta o valor em aberto (um novo empréstimo)
 * - "payment": reduz o valor em aberto (um pagamento/recebimento)
 */
export type LoanEntryType = "loan" | "payment";

export interface Loan {
  id: string;
  kind: LoanKind;
  person: string;
  amount: number;
  date: string; // ISO string
  dueDate?: string; // ISO string — só relevante para lançamentos do tipo "loan"
  type: LoanEntryType;
  notes?: string;
}

/** Agregado de todos os lançamentos de uma mesma pessoa/instituição + direção. */
export interface LoanGroup {
  key: string;
  kind: LoanKind;
  person: string;
  total: number; // > 0 ainda em aberto; <= 0 quitado (ou com crédito a favor)
  entries: Loan[];
  lastDate: string; // ISO string do lançamento mais recente
}

export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Assinaturas",
  "Compras",
  "Contas",
  "Outros",
] as const;

export const INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Presente",
  "Outros",
] as const;

export type ThemeMode = "light" | "dark" | "system";
