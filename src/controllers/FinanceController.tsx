/**
 * CONTROLLER LAYER
 * Faz a ponte entre o Model (repositórios + regras de negócio) e a View.
 * As telas nunca acessam o banco nem os repositórios diretamente —
 * sempre passam por aqui através do hook `useFinanceController`.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { Transaction, Loan, LoanGroup, Recurrence } from "@/models/types";
import { TransactionRepository } from "@/models/TransactionRepository";
import { LoanRepository } from "@/models/LoanRepository";
import { RecurrenceRepository } from "@/models/RecurrenceRepository";
import { FinanceCalculator } from "@/models/FinanceCalculator";
import { LoanCalculator } from "@/models/LoanCalculator";
import { RecurrenceCalculator } from "@/models/RecurrenceCalculator";

interface FinanceControllerValue {
  loaded: boolean;
  transactions: Transaction[];
  loans: Loan[];
  recurrences: Recurrence[];
  loanGroups: LoanGroup[];
  balance: number;
  commitment: number;
  totalReceivable: number;
  totalPayable: number;
  addTransaction: (data: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, data: Omit<Transaction, "id">) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addRecurrence: (data: Omit<Recurrence, "id" | "generatedCount" | "canceledAt">) => Promise<void>;
  cancelRecurrence: (id: string) => Promise<void>;
  addLoan: (data: Omit<Loan, "id">) => Promise<void>;
  updateLoan: (id: string, data: Omit<Loan, "id">) => Promise<void>;
  removeLoan: (id: string) => Promise<void>;
}

const FinanceControllerContext = createContext<FinanceControllerValue | undefined>(undefined);

export function FinanceControllerProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reloadTransactionsAndRecurrences = async () => {
    const [tx, rec] = await Promise.all([TransactionRepository.getAll(), RecurrenceRepository.getAll()]);
    setTransactions(tx);
    setRecurrences(rec);
  };

  useEffect(() => {
    (async () => {
      await RecurrenceRepository.generateDue(new Date());
      const [ln] = await Promise.all([LoanRepository.getAll(), reloadTransactionsAndRecurrences()]);
      setLoans(ln);
      setLoaded(true);
    })();

    // O mês pode virar com o app em segundo plano: ao voltar, lança o que venceu.
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state !== "active") return;
      const created = await RecurrenceRepository.generateDue(new Date());
      if (created > 0) await reloadTransactionsAndRecurrences();
    });
    return () => subscription.remove();
  }, []);

  const addTransaction = async (data: Omit<Transaction, "id">) => {
    const updated = await TransactionRepository.add(data);
    setTransactions(updated);
  };

  const updateTransaction = async (id: string, data: Omit<Transaction, "id">) => {
    const updated = await TransactionRepository.update(id, data);
    setTransactions(updated);
  };

  const removeTransaction = async (id: string) => {
    const recurrenceId = transactions.find((t) => t.id === id)?.recurrenceId;
    await TransactionRepository.remove(id);
    // Excluir o único lançamento de uma recorrência desfaz o cadastro dela por inteiro.
    if (recurrenceId) await RecurrenceRepository.removeIfEmpty(recurrenceId);
    await reloadTransactionsAndRecurrences();
  };

  const addRecurrence = async (data: Omit<Recurrence, "id" | "generatedCount" | "canceledAt">) => {
    await RecurrenceRepository.add(data);
    await reloadTransactionsAndRecurrences();
  };

  const cancelRecurrence = async (id: string) => {
    await RecurrenceRepository.cancel(id);
    await reloadTransactionsAndRecurrences();
  };

  const addLoan = async (data: Omit<Loan, "id">) => {
    const updated = await LoanRepository.add(data);
    setLoans(updated);
  };

  const updateLoan = async (id: string, data: Omit<Loan, "id">) => {
    const updated = await LoanRepository.update(id, data);
    setLoans(updated);
  };

  const removeLoan = async (id: string) => {
    const updated = await LoanRepository.remove(id);
    setLoans(updated);
  };

  const balance = useMemo(() => FinanceCalculator.balance(transactions), [transactions]);
  const commitment = useMemo(() => RecurrenceCalculator.nextMonthCommitment(recurrences, new Date()), [recurrences]);
  const loanGroups = useMemo(() => LoanCalculator.groupByPerson(loans), [loans]);
  const totalReceivable = useMemo(() => LoanCalculator.totalReceivable(loans), [loans]);
  const totalPayable = useMemo(() => LoanCalculator.totalPayable(loans), [loans]);

  const value: FinanceControllerValue = {
    loaded,
    transactions,
    loans,
    recurrences,
    loanGroups,
    balance,
    commitment,
    totalReceivable,
    totalPayable,
    addTransaction,
    updateTransaction,
    removeTransaction,
    addRecurrence,
    cancelRecurrence,
    addLoan,
    updateLoan,
    removeLoan,
  };

  return (
    <FinanceControllerContext.Provider value={value}>{children}</FinanceControllerContext.Provider>
  );
}

export function useFinanceController() {
  const ctx = useContext(FinanceControllerContext);
  if (!ctx) throw new Error("useFinanceController deve ser usado dentro de FinanceControllerProvider");
  return ctx;
}
