/**
 * CONTROLLER LAYER
 * Faz a ponte entre o Model (repositórios + regras de negócio) e a View.
 * As telas nunca acessam AsyncStorage nem os repositórios diretamente —
 * sempre passam por aqui através do hook `useFinanceController`.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Transaction, Loan, LoanGroup } from "@/models/types";
import { TransactionRepository } from "@/models/TransactionRepository";
import { LoanRepository } from "@/models/LoanRepository";
import { FinanceCalculator } from "@/models/FinanceCalculator";
import { LoanCalculator } from "@/models/LoanCalculator";

interface FinanceControllerValue {
  loaded: boolean;
  transactions: Transaction[];
  loans: Loan[];
  loanGroups: LoanGroup[];
  balance: number;
  commitment: number;
  totalReceivable: number;
  totalPayable: number;
  addTransaction: (data: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, data: Omit<Transaction, "id">) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addLoan: (data: Omit<Loan, "id">) => Promise<void>;
  updateLoan: (id: string, data: Omit<Loan, "id">) => Promise<void>;
  removeLoan: (id: string) => Promise<void>;
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

  const updateTransaction = async (id: string, data: Omit<Transaction, "id">) => {
    const updated = await TransactionRepository.update(id, data);
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

  const updateLoan = async (id: string, data: Omit<Loan, "id">) => {
    const updated = await LoanRepository.update(id, data);
    setLoans(updated);
  };

  const removeLoan = async (id: string) => {
    const updated = await LoanRepository.remove(id);
    setLoans(updated);
  };

  const balance = useMemo(() => FinanceCalculator.balance(transactions), [transactions]);
  const commitment = useMemo(() => FinanceCalculator.nextMonthCommitment(transactions), [transactions]);
  const loanGroups = useMemo(() => LoanCalculator.groupByPerson(loans), [loans]);
  const totalReceivable = useMemo(() => LoanCalculator.totalReceivable(loans), [loans]);
  const totalPayable = useMemo(() => LoanCalculator.totalPayable(loans), [loans]);

  const value: FinanceControllerValue = {
    loaded,
    transactions,
    loans,
    loanGroups,
    balance,
    commitment,
    totalReceivable,
    totalPayable,
    addTransaction,
    updateTransaction,
    removeTransaction,
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
