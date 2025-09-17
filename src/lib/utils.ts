
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currencyCode: string = 'ARS') {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  };
  
  // Intl.NumberFormat might not support all codes as symbols, especially ARS.
  // We handle ARS manually for consistency.
  if (currencyCode === 'ARS') {
      const formatted = new Intl.NumberFormat('es-AR', {
        style: 'decimal',
        minimumFractionDigits: options.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits,
      }).format(price);
      return `$ ${formatted}`;
  }

  try {
    // For other currencies, try to use the standard formatter.
    return new Intl.NumberFormat(undefined, options).format(price);
  } catch (e) {
    // Fallback for unsupported currency codes
    const formatted = new Intl.NumberFormat('es-AR', {
        style: 'decimal',
        minimumFractionDigits: options.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits,
      }).format(price);
    return `${currencyCode} ${formatted}`;
  }
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
