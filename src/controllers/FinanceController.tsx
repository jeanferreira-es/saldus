/**
 * CONTROLLER LAYER
 * Faz a ponte entre o Model (repositórios + regras de negócio) e a View.
 * As telas nunca acessam AsyncStorage nem os repositórios diretamente —
 * sempre passam por aqui através do hook `useFinanceController`.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Transaction, Loan } from "@/models/types";
import { TransactionRepository } from "@/models/TransactionRepository";
import { LoanRepository } from "@/models/LoanRepository";
import { FinanceCalculator } from "@/models/FinanceCalculator";

interface FinanceControllerValue {
  loaded: boolean;
  transactions: Transaction[];
  loans: Loan[];
  balance: number;
  commitment: number;
  receivable: number;
  addTransaction: (data: Omit<Transaction, "id">) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addLoan: (data: Omit<Loan, "id">) => Promise<void>;
  removeLoan: (id: string) => Promise<void>;
  toggleLoanPaid: (id: string) => Promise<void>;
}

const FinanceControllerContext = createContext<FinanceControllerValue | undefined>(undefined);

export function FinanceControllerProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [tx, ln] = await Promise.all([TransactionRepository.getAll(), LoanRepository.getAll()]);
      setTransactions(tx);
      setLoans(ln);
      setLoaded(true);
    })();
  }, []);

  const addTransaction = async (data: Omit<Transaction, "id">) => {
    const updated = await TransactionRepository.add(data);
    setTransactions(updated);
  };

  const removeTransaction = async (id: string) => {
    const updated = await TransactionRepository.remove(id);
    setTransactions(updated);
  };

  const addLoan = async (data: Omit<Loan, "id">) => {
    const updated = await LoanRepository.add(data);
    setLoans(updated);
  };

  const removeLoan = async (id: string) => {
    const updated = await LoanRepository.remove(id);
    setLoans(updated);
  };

  const toggleLoanPaid = async (id: string) => {
    const updated = await LoanRepository.togglePaid(id);
    setLoans(updated);
  };

  const balance = useMemo(() => FinanceCalculator.balance(transactions, loans), [transactions, loans]);
  const commitment = useMemo(
    () => FinanceCalculator.nextMonthCommitment(transactions, loans),
    [transactions, loans]
  );
  const receivable = useMemo(() => FinanceCalculator.nextMonthReceivable(loans), [loans]);

  const value: FinanceControllerValue = {
    loaded,
    transactions,
    loans,
    balance,
    commitment,
    receivable,
    addTransaction,
    removeTransaction,
    addLoan,
    removeLoan,
    toggleLoanPaid,
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
