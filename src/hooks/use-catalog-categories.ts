import { useEffect, useState } from 'react';
import { categories as mockCategories, type Category } from '../data/catalog';
import { ApiError, apiFetch } from '../lib/api';
import type { ApiCategory } from '../types/api';

const demoMessage = 'Mode démonstration : le backend n’est pas disponible.';
const fallbackImage = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80';

function mapCategory(category: ApiCategory, index: number): Category {
  const mock = mockCategories.find((item) => item.id === category.id || item.id === category.slug);
  return {
    id: category.slug || category.id,
    name: category.name,
    label: category.label || category.name,
    image: category.imageUrl || mock?.image || fallbackImage,
    featured: mock?.featured ?? index === 0,
  };
}

function getCategoryErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.status >= 500 ? 'Le service catégories rencontre une erreur.' : error.message;
  }
  return 'Backend indisponible : démarrez le serveur API pour afficher les catégories réelles.';
}

export function useCatalogCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    apiFetch<ApiCategory[]>('/categories')
      .then((response) => {
        if (!isCurrent) return;
        setCategories(response.map(mapCategory));
        setIsUsingFallback(false);
        setMessage(null);
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        if (import.meta.env.DEV) {
          setCategories(mockCategories);
          setIsUsingFallback(true);
          setMessage(demoMessage);
        } else {
          setCategories([]);
          setIsUsingFallback(false);
          setMessage(getCategoryErrorMessage(error));
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return { categories, isLoading, isUsingFallback, message };
}
