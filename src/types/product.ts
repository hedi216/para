export type ProductStockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
};

export type ProductBrand = {
  id: string;
  slug: string;
  name: string;
};

export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
  category: ProductCategory;
  brand: ProductBrand;
  availableQuantity: number;
  reorderLevel: number;
  stockStatus: ProductStockStatus;
};

export type ProductSearchParams = {
  search?: string;
  categoryId?: string;
  brandId?: string;
  barcode?: string;
  storeId?: string;
};
