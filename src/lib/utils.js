import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Database numerics can arrive as strings ("1509.00"); always format as $1,509.
export function formatCurrency(value) {
  return usd.format(Number(value) || 0);
}
