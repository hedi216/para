import { useEffect, useState } from 'react';
import type { Product } from '../data/catalog';
import { ApiError, apiFetch } from '../lib/api';
import { filterMockProducts, mapApiProduct } from '../lib/catalog';
import type { ApiProduct } from '../types/api';

const demoMessage = 'Mode démonstration : le backend n’est pas disponible.';

function getCatalogErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.status >= 500 ? 'Le service catalogue rencontre une erreur.' : error.message;
  }
  return 'Backend indisponible : démarrez le serveur API pour afficher le vrai stock.';
}

export function useCatalogProducts(search = '', category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category && category !== 'all') params.set('category', category);
    const suffix = params.size ? `?${params.toString()}` : '';

    apiFetch<ApiProduct[]>(`/products${suffix}`)
      .then((response) => {
        if (!isCurrent) return;
        setProducts(response.map(mapApiProduct));
        setIsUsingFallback(false);
        setMessage(null);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        if (import.meta.env.DEV) {
          setProducts(filterMockProducts(search, category));
          setIsUsingFallback(true);
          setMessage(demoMessage);
        } else {
          setProducts([]);
          setIsUsingFallback(false);
          setMessage(getCatalogErrorMessage(error));
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [category, search]);

  return { products, isLoading, isUsingFallback, message };
}
