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
