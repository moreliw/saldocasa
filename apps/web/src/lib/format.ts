import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatMoney(value: number | string, currency = 'BRL') {
  const num = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(num) ? num : 0);
}

export function formatDate(value: string | Date, pattern = 'dd/MM/yyyy') {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, pattern, { locale: ptBR });
}

export function formatDateLong(value: string | Date) {
  return formatDate(value, "dd 'de' MMMM 'de' yyyy");
}

export function monthLabel(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

/** YYYY-MM-DD para inputs type=date */
export function toDateInput(value: string | Date): string {
  const d = typeof value === 'string' ? parseISO(value) : value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
