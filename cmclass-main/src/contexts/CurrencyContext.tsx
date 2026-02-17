import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { publicApi } from '../services/publicApi';
import {
  DEFAULT_STOREFRONT_CURRENCY,
  formatStorePrice,
  formatStorePriceFromCents,
  normalizeStorefrontCurrency,
  type StorefrontCurrency,
} from '../utils/currency';

type CurrencyContextValue = {
  currency: StorefrontCurrency;
  setCurrency: (next: StorefrontCurrency) => void;
  formatPrice: (value: unknown, options?: { maximumFractionDigits?: number }) => string;
  formatPriceFromCents: (value: unknown) => string;
  loading: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<StorefrontCurrency>(DEFAULT_STOREFRONT_CURRENCY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const brand = await publicApi.getBrand();
        if (!mounted) return;
        setCurrencyState(normalizeStorefrontCurrency(brand?.storefrontCurrency));
      } catch {
        if (!mounted) return;
        setCurrencyState(DEFAULT_STOREFRONT_CURRENCY);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const setCurrency = (next: StorefrontCurrency) => {
    setCurrencyState(normalizeStorefrontCurrency(next));
  };

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      formatPrice: (amount, options) => formatStorePrice(amount, currency, options),
      formatPriceFromCents: (amount) => formatStorePriceFromCents(amount, currency),
      loading,
    }),
    [currency, loading],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
