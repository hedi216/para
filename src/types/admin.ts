import type { OrderSummary, SalesChannel } from './order';

export type DateRange = {
  from: string;
  to: string;
  timezone: string;
};

export type RevenuePoint = {
  date: string;
  amount: number;
};

export type SalesChannelBreakdown = {
  channel: SalesChannel;
  amount: number;
  percent: number;
};

export type StockAlerts = {
  outOfStock: number;
  lowStock: number;
};

export type AdminDashboard = {
  period: DateRange;
  revenue: {
    total: number;
    previousPeriod: number;
    changePercent: number;
  };
  channels: SalesChannelBreakdown[];
  averageBasket: number;
  revenueSeries: RevenuePoint[];
  stockAlerts: StockAlerts;
  recentOrders: OrderSummary[];
};
