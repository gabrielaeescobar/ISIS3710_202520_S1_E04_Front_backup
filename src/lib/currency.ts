export type CurrencyCode = 'USD' | 'EUR' | 'COP' | 'GBP' | string;

// Tasas de conversión a USD (cuántos USD vale 1 unidad de cada moneda)
// Si en algún momento se quiere conectar a un API real, este
// objeto se puede reemplazar por valores dinámicos.
const FX_RATES_TO_USD: Record<string, number> = {
  USD: 1,           // 1 USD = 1 USD
  EUR: 1.1,        // 1 EUR = 1.1 USD
  GBP: 1.25,       // 1 GBP = 1.25 USD
  COP: 0.00025,    // 1 COP = 0.00025 USD (≈ 4000 COP = 1 USD)
};

export function normalizeCurrency(code: CurrencyCode): CurrencyCode {
  return (code || 'USD').toString().toUpperCase();
}

/**
 * Convierte un monto de una moneda a otra.
 * 
 * Lógica:
 * 1. Si from y to son iguales, retorna el monto sin cambios
 * 2. Convierte from -> USD: amount * fromRate
 * 3. Convierte USD -> to: (amount * fromRate) / toRate
 * 
 * Ejemplo: 100 EUR a USD
 * - fromRate (EUR) = 1.1
 * - toRate (USD) = 1
 * - Resultado: 100 * 1.1 / 1 = 110 USD
 * 
 * Ejemplo: 100 USD a EUR
 * - fromRate (USD) = 1
 * - toRate (EUR) = 1.1
 * - Resultado: 100 * 1 / 1.1 = 90.91 EUR
 */
export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (!amount || amount === 0) return amount;
  
  const fromNorm = normalizeCurrency(from);
  const toNorm = normalizeCurrency(to);
  
  if (fromNorm === toNorm) return amount;

  const fromRate = FX_RATES_TO_USD[fromNorm] ?? 1;
  const toRate = FX_RATES_TO_USD[toNorm] ?? 1;

  // Convertir: from -> USD -> to
  // amount_in_from * (USD_per_from) / (USD_per_to) = amount_in_to
  return amount * (fromRate / toRate);
}

export function getCurrencySymbol(code: CurrencyCode): string {
  const norm = normalizeCurrency(code);
  switch (norm) {
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'COP':
      return '$';
    case 'GBP':
      return '£';
    default:
      return norm;
  }
}

export function formatAmount(amount: number, currency: CurrencyCode): string {
  const norm = normalizeCurrency(currency);
  const symbol = getCurrencySymbol(norm);
  return `${symbol} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


