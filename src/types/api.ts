import type { UserRole } from './user';

export type { UserRole } from './user';

export type ApiUser = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string | null;
};

export type AuthSession = {
  accessToken: string;
  user: ApiUser;
};

export type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  label?: string | null;
  imageUrl?: string | null;
};

export type ApiBrand = {
  id: string;
  slug: string;
  name: string;
};

export type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  price: number;
  oldPrice?: number | null;
  badge?: string | null;
  image?: string | null;
  isActive: boolean;
  stock: number;
  category: ApiCategory;
  brand: ApiBrand;
};

export type ApiOrderItem = {
  id: string;
  productName: string;
  brandName: string;
  unitPrice: number | string;
  quantity: number;
  lineTotal: number | string;
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  paymentMethod: string;
  paymentStatus: string;
  recipientName: string;
  createdAt: string;
  items: ApiOrderItem[];
};

export type ApiInventoryItem = {
  id: string;
  quantity: number;
  reserved: number;
  reorderLevel: number;
  product: ApiProduct;
};

export type ApiDashboardStockAlertItem = {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  quantity: number;
  reserved: number;
  available: number;
  reorderLevel: number;
};

export type ApiDashboardActivity = {
  id: string;
  type: 'WEB_ORDER' | 'POS_SALE';
  reference: string;
  channel: 'WEB' | 'STORE';
  customerName?: string;
  employeeName?: string;
  registerCode?: string;
  status: string;
  total: number;
  createdAt: string;
};

export type ApiAdminDashboard = {
  generatedAt: string;
  store: { id: string; code: string; name: string };
  revenue: { total: number; web: number; store: number };
  channels: Array<{ channel: 'WEB' | 'STORE'; amount: number; count: number; percent: number }>;
  averageBasket: number;
  stockAlerts: {
    outOfStock: number;
    lowStock: number;
    items: ApiDashboardStockAlertItem[];
  };
  recentActivity: ApiDashboardActivity[];
};
