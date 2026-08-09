export type UserRole = 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';

export type Permission =
  | 'POS_SELL'
  | 'POS_REFUND'
  | 'CUSTOMER_LOOKUP'
  | 'INVENTORY_VIEW'
  | 'INVENTORY_ADJUST'
  | 'PRODUCT_EDIT'
  | 'ORDER_MANAGE'
  | 'REPORT_VIEW'
  | 'STAFF_MANAGE';

export type AppUser = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string | null;
  permissions: Permission[];
  isActive: boolean;
};

export type CustomerSummary = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  loyaltyPoints: number;
  availableLoyaltyDiscount?: number;
};

export type StaffMember = AppUser & {
  employeeNo: string;
  jobTitle?: string | null;
  storeIds: string[];
  registerIds: string[];
};
