export const AUTH_COOKIE_NAME = 'sc_session';
export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export const DEFAULT_EXPENSE_CATEGORIES: Array<{ name: string; color: string }> = [
  { name: 'Alimentação', color: '#f97316' },
  { name: 'Moradia', color: '#0ea5e9' },
  { name: 'Transporte', color: '#a855f7' },
  { name: 'Saúde', color: '#ef4444' },
  { name: 'Educação', color: '#22c55e' },
  { name: 'Lazer', color: '#eab308' },
  { name: 'Contas fixas', color: '#64748b' },
  { name: 'Cartão de crédito', color: '#ec4899' },
  { name: 'Outros', color: '#94a3b8' },
];

export const DEFAULT_INCOME_CATEGORIES: Array<{ name: string; color: string }> = [
  { name: 'Salário', color: '#16a34a' },
  { name: 'Freelance', color: '#0891b2' },
  { name: 'Investimentos', color: '#7c3aed' },
  { name: 'Reembolso', color: '#0284c7' },
  { name: 'Outros', color: '#475569' },
];

export const DEFAULT_PAYMENT_METHODS: string[] = [
  'Dinheiro',
  'Pix',
  'Cartão de débito',
  'Cartão de crédito',
  'Boleto',
  'Transferência',
];
