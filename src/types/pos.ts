import type { OrderLine, PaymentMethod, PaymentStatus } from './order';
import type { CustomerSummary } from './user';

export type CashRegister = {
  id: string;
  code: string;
  storeId: string;
  label: string;
  isActive: boolean;
};

export type PosCartLine = OrderLine & {
  availableQuantity: number;
};

export type PosSaleDraft = {
  registerId: string;
  customer?: CustomerSummary | null;
  items: PosCartLine[];
  subtotal: number;
  loyaltyDiscount: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  paymentMethod?: Extract<PaymentMethod, 'CASH' | 'CARD'>;
};

export type PosSale = {
  id: string;
  receiptNumber: string;
  register: CashRegister;
  employeeId: string;
  customer?: CustomerSummary | null;
  items: PosCartLine[];
  subtotal: number;
  loyaltyDiscount: number;
  taxRate: number;
  taxTotal: number;
  total: number;
  paymentMethod: Extract<PaymentMethod, 'CASH' | 'CARD'>;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type PosRefundRequest = {
  items: Array<{ posSaleItemId: string; quantity: number }>;
  reason: string;
  paymentMethod: Extract<PaymentMethod, 'CASH' | 'CARD'>;
};
