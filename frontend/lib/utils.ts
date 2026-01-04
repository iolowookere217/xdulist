import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Currency } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency symbols
export const currencySymbols: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
};

// Format currency
export function formatCurrency(amount: number, currency: Currency = 'NGN'): string {
  const symbol = currencySymbols[currency];
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format date to readable string
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format time to 12-hour format
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
}

// Get relative date label (Today, Yesterday, etc.)
export function getRelativeDateLabel(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (targetDate.getTime() === today.getTime()) return 'Today';
  if (targetDate.getTime() === yesterday.getTime()) return 'Yesterday';

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (targetDate >= weekAgo) return 'This Week';

  return formatDate(d);
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Get initials from name
export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
