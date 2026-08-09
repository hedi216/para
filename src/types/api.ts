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

export type ApiPosSaleItem = {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  unitPrice: number | string;
  quantity: number;
  lineTotal: number | string;
};

export type ApiPayment = {
  id: string;
  method: string;
  status: string;
  amount: number | string;
  reference?: string | null;
  createdAt: string;
};

export type ApiPosSale = {
  id: string;
  receiptNumber: string;
  status: string;
  subtotal: number | string;
  total: number | string;
  paymentMethod: string;
  createdAt: string;
  refundedAt?: string | null;
  employee: { firstName: string; lastName: string; email?: string };
  register?: { id: string; code: string; label: string };
  customer?: {
    id: string;
    loyaltyPoints?: number;
    user?: ApiUser;
  } | null;
  items: ApiPosSaleItem[];
  payments: ApiPayment[];
  invoice?: { id: string; invoiceNumber: string } | null;
};

export type ApiPosCustomer = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  loyaltyPoints: number;
  defaultAddress?: string | null;
  city?: string | null;
  birthDate?: string | null;
  marketingEmailConsent: boolean;
  marketingSmsConsent: boolean;
  notes?: string | null;
  source: 'CUSTOMER_SELF_SIGNUP' | 'POS_CREATED';
};

export type ApiPosInvoiceItem = {
  id: string;
  invoiceId: string;
  productName: string;
  brandName: string;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
};

export type ApiPosInvoice = {
  id: string;
  invoiceNumber: string;
  posSaleId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  taxIdentifier?: string | null;
  subtotal: number | string;
  taxTotal?: number | string | null;
  total: number | string;
  notes?: string | null;
  createdAt: string;
  items: ApiPosInvoiceItem[];
  posSale: {
    id: string;
    receiptNumber: string;
    paymentMethod: string;
    createdAt: string;
    employee: { firstName: string; lastName: string; email?: string };
    register?: { id: string; code: string; label: string };
    payments: ApiPayment[];
  };
};
