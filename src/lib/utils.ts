
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  };

  const formatted = new Intl.NumberFormat('es-AR', options).format(price);
  return `ARS ${formatted}`;
}
