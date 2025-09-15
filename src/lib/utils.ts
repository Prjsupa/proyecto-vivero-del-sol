
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
  // ARS is not a standard currency symbol, so we add it manually. The space is correct for AR locale.
  return `ARS ${formatted.replace('ARS', '').trim()}`;
}

export function formatInputValue(value: string) {
  // Clean the value: remove anything that is not a digit or a comma
  const cleanedValue = value.replace(/[^0-9,]/g, '');

  const parts = cleanedValue.split(',');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? `,${parts[1]}` : '';

  // Add thousand separators to the integer part
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return formattedIntegerPart + decimalPart;
}
