import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { brandAPI } from '../../services/api';
import {
  formatStorePrice,
  normalizeStorefrontCurrency,
  type StorefrontCurrency,
} from '../../../src/utils/currency';

type CurrencyOption = {
  code: StorefrontCurrency;
  label: string;
  description: string;
};

const CURRENCY_OPTIONS: CurrencyOption[] = [
  {
    code: 'FC',
    label: 'Franc congolais (FC)',
    description: 'Affiche les prix de la boutique en franc congolais.',
  },
  {
    code: 'USD',
    label: 'Dollar américain (USD)',
    description: 'Affiche les prix de la boutique en dollars américains.',
  },
];

export function Currency() {
  const [currency, setCurrency] = useState<StorefrontCurrency>('FC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const brand = await brandAPI.get();
        if (!mounted) return;
        setCurrency(normalizeStorefrontCurrency(brand?.storefrontCurrency));
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Impossible de charger la devise actuelle.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const preview = useMemo(() => formatStorePrice(125000, currency), [currency]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await brandAPI.update({ storefrontCurrency: currency });
      setMessage('Devise storefront mise à jour.');
    } catch (err: any) {
      setError(err?.message || 'Échec de la mise à jour de la devise.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <h3>Devise des produits</h3>
          <p className="text-sm text-gray-500 mt-1">
            Choisissez la devise utilisée pour afficher les prix sur le storefront.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CURRENCY_OPTIONS.map((option) => {
                  const active = currency === option.code;
                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => setCurrency(option.code)}
                      className={`text-left border rounded p-4 transition-colors ${
                        active ? 'border-[#007B8A] bg-[#e6f4f6]' : 'border-gray-200 hover:border-[#007B8A]'
                      }`}
                    >
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-600">Aperçu prix produit:</p>
                <p className="text-lg font-medium mt-1">{preview}</p>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
