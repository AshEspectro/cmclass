export type StorefrontCurrency = 'FC' | 'USD';

export const DEFAULT_STOREFRONT_CURRENCY: StorefrontCurrency = 'FC';

export const normalizeStorefrontCurrency = (value: unknown): StorefrontCurrency =>
  value === 'USD' ? 'USD' : 'FC';

export const currencyDisplayLabel = (currency: StorefrontCurrency) =>
  currency === 'USD' ? 'USD' : 'FC';

const normalizeNumericString = (value: string) => {
  const sanitized = value.replace(/\s+/g, '').replace(/[^0-9,.-]/g, '');
  if (!sanitized) return '0';

  const hasComma = sanitized.includes(',');
  const hasDot = sanitized.includes('.');

  if (hasComma && hasDot) {
    const lastComma = sanitized.lastIndexOf(',');
    const lastDot = sanitized.lastIndexOf('.');
    if (lastComma > lastDot) {
      return sanitized.replace(/\./g, '').replace(',', '.');
    }
    return sanitized.replace(/,/g, '');
  }

  if (hasComma) {
    return sanitized.replace(',', '.');
  }

  return sanitized;
};

export const parsePriceValue = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(normalizeNumericString(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const formatStorePrice = (
  value: unknown,
  currency: StorefrontCurrency,
  options?: { maximumFractionDigits?: number },
) => {
  const amount = parsePriceValue(value);

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(amount)} FC`;
};

export const formatStorePriceFromCents = (value: unknown, currency: StorefrontCurrency) =>
  formatStorePrice(parsePriceValue(value) / 100, currency);
