/**
 * Currency rates relative to USD (baseline)
 */
const FX_RATES = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  INR: { symbol: '₹', rate: 86.5 },
  JPY: { symbol: '¥', rate: 154.0 },
};

/**
 * Format integer prize pool cents or formatted strings to localized currency
 */
export function formatPrize(amountInUSD, targetCurrency = 'USD') {
  const currency = FX_RATES[targetCurrency] || FX_RATES.USD;
  const converted = amountInUSD * currency.rate;

  if (targetCurrency === 'INR' || targetCurrency === 'JPY') {
    return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
  }

  return `${currency.symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Convert UTC date string to viewer's local timezone or UTC
 */
export function formatDeadline(dateString, isUTC = false) {
  if (!dateString) return '';
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString; // return original if not a standard date
  }

  if (isUTC) {
    return `${date.toUTCString().slice(0, 22)} UTC`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}
