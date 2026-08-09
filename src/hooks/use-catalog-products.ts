import { useEffect, useState } from 'react';
import type { Product } from '../data/catalog';
import { apiFetch } from '../lib/api';
import { filterMockProducts, mapApiProduct } from '../lib/catalog';
import type { ApiProduct } from '../types/api';

export function useCatalogProducts(search = '', category?: string) {
  const [products, setProducts] = useState<Product[]>(() => filterMockProducts(search, category));
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

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
      })
      .catch(() => {
        if (!isCurrent) return;
        setProducts(filterMockProducts(search, category));
        setIsUsingFallback(true);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [category, search]);

  return { products, isLoading, isUsingFallback };
}
