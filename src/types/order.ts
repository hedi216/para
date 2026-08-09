export type SalesChannel = 'WEB' | 'STORE';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'IN_STORE' | 'CASH' | 'CARD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export type OrderLine = {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  unitPrice: number;
  quantity: number;
  discountTotal: number;
  lineTotal: number;
};

export type OrderSummary = {
  id: string;
  documentNumber: string;
  channel: SalesChannel;
  status: OrderStatus;
  customerId?: string | null;
  customerName: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: OrderLine[];
};
