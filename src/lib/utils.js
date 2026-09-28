import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge the custom display sizes (tailwind.config.js), otherwise it
// treats `text-display-lg` as a colour and drops it next to e.g. `text-gray-900`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display-2xl", "display-xl", "display-lg", "display-md"] }],
    },
  },
})

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Database numerics can arrive as strings ("1509.00"); always format as $1,509.
export function formatCurrency(value) {
  return usd.format(Number(value) || 0);
}
