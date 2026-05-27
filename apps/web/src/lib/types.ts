export type CategoryType = 'INCOME' | 'EXPENSE';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string | null;
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: string;
  transactionDate: string;
  dueDate: string | null;
  status: TransactionStatus;
  notes: string | null;
  category: { id: string; name: string; color: string; type: CategoryType };
  paymentMethod: { id: string; name: string } | null;
}

export interface TransactionListResponse {
  items: Transaction[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type RecurringFrequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: string;
  frequency: RecurringFrequency;
  dueDay: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  category: { id: string; name: string; color: string; type: CategoryType };
  paymentMethod: { id: string; name: string } | null;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  category: { id: string; name: string; color: string; type: CategoryType };
  plannedAmount: number;
  spent: number;
  remaining: number;
  percent: number;
  status: 'ok' | 'warning' | 'over';
}

export interface BudgetsResponse {
  period: { year: number; month: number };
  items: BudgetItem[];
}

export interface CashFlowPoint {
  ym: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryReportItem {
  categoryId: string;
  name: string;
  color: string;
  type: CategoryType;
  amount: number;
  count: number;
}

export interface PaymentMethodReportItem {
  paymentMethodId: string | null;
  name: string;
  amount: number;
  count: number;
}

export interface DashboardSummary {
  period: { year: number; month: number };
  totals: {
    balance: number;
    income: number;
    expense: number;
    incomePending: number;
    expensePending: number;
    forecastBalance: number;
    txCount: number;
  };
  byCategory: Array<{ categoryId: string; name: string; color: string; amount: number }>;
  latestTransactions: Array<{
    id: string;
    type: TransactionType;
    description: string;
    amount: string;
    transactionDate: string;
    status: TransactionStatus;
    category: { id: string; name: string; color: string; type: CategoryType };
  }>;
}
