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
}

/**
 * "lent": dinheiro que EU emprestei para outra pessoa (a receber)
 * "borrowed": dinheiro que EU peguei emprestado de outra pessoa (a pagar)
 */
export type LoanKind = "lent" | "borrowed";

export interface Loan {
  id: string;
  kind: LoanKind;
  person: string;
  amount: number;
  date: string; // ISO string
  dueDate?: string; // ISO string
  paid: boolean;
  notes?: string;
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
