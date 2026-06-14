import { formatAdminURL } from "payload/shared";

export type DashboardUser = {
  email?: string;
  name?: string;
};

export type DashboardMetricTone = "brass" | "olive" | "rose" | "sage";
export type DashboardSeverity = "critical" | "low" | "stable";
export type DashboardIconName =
  | "arrow-up-right"
  | "box"
  | "clock-3"
  | "shopping-bag"
  | "sparkles"
  | "triangle-alert"
  | "trending-up"
  | "truck"
  | "users";

export type RevenuePoint = {
  accessoryRevenue: number;
  capsulesRevenue: number;
  coffeeRevenue: number;
  giftSetRevenue: number;
  label: string;
  matchaRevenue: number;
  revenue: number;
};

export type DashboardMetric = {
  detail: string;
  href: string;
  icon: DashboardIconName;
  label: string;
  tone: DashboardMetricTone;
  value: string;
};

export type DashboardOrderState = {
  count: number;
  detail: string;
  icon: DashboardIconName;
  label: string;
};

export type DashboardSupplyItem = {
  detail: string;
  href: string;
  name: string;
  quantity: string;
  severity: DashboardSeverity;
};

export type DashboardActivityItem = {
  detail: string;
  href: string;
  icon: DashboardIconName;
  label: string;
  meta: string;
  tone: DashboardMetricTone;
};

export type DashboardRecentOrder = {
  amount: string;
  date: string;
  email: string;
  href: string;
  id: string;
  status: string;
  tone: DashboardMetricTone;
};

export type PlaceholderDashboardData = {
  activity: DashboardActivityItem[];
  metrics: DashboardMetric[];
  orders: {
    ctaHref: string;
    ctaLabel: string;
    description: string;
    states: DashboardOrderState[];
    title: string;
  };
  recentOrders: {
    ctaHref: string;
    ctaLabel: string;
    rows: DashboardRecentOrder[];
    title: string;
  };
  revenue: {
    change: string;
    changeLabel: string;
    description: string;
    points: RevenuePoint[];
    title: string;
    total: string;
  };
  supply: {
    ctaHref: string;
    ctaLabel: string;
    description: string;
    items: DashboardSupplyItem[];
    title: string;
    warning: string;
  };
};

const formatCurrencyCompact = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    currency: "EUR",
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(value);

export const getDashboardGreetingName = (user: DashboardUser | null | undefined): string => {
  if (typeof user?.name === "string" && user.name.trim().length > 0) {
    return user.name.trim().split(/\s+/)[0] ?? user.name.trim();
  }

  if (typeof user?.email === "string" && user.email.includes("@")) {
    return user.email.split("@")[0] ?? "admin";
  }

  return "admin";
};

export const getPlaceholderDashboardData = (adminRoute: string): PlaceholderDashboardData => ({
  activity: [
    {
      detail: "Homepage hero and product grid were updated for the weekend campaign.",
      href: formatAdminURL({ adminRoute, path: "/globals/home-page" }),
      icon: "sparkles",
      label: "Homepage refreshed",
      meta: "18 min ago",
      tone: "brass",
    },
    {
      detail: "Order queue moved from payment follow-up into dispatch preparation.",
      href: formatAdminURL({ adminRoute, path: "/collections/orders" }),
      icon: "truck",
      label: "Dispatch batch prepared",
      meta: "46 min ago",
      tone: "sage",
    },
    {
      detail: "Three customer records were updated after manual account support.",
      href: formatAdminURL({ adminRoute, path: "/collections/customers" }),
      icon: "users",
      label: "Customer records reviewed",
      meta: "1 hr ago",
      tone: "olive",
    },
    {
      detail: "Two SKUs dropped below the preferred buffer and need a stock check.",
      href: formatAdminURL({ adminRoute, path: "/collections/products" }),
      icon: "triangle-alert",
      label: "Inventory warning raised",
      meta: "2 hr ago",
      tone: "rose",
    },
  ],
  metrics: [
    {
      detail: "12% above the previous placeholder week",
      href: formatAdminURL({ adminRoute, path: "/collections/orders" }),
      icon: "trending-up",
      label: "Weekly revenue",
      tone: "brass",
      value: formatCurrencyCompact(18420),
    },
    {
      detail: "6 waiting on payment confirmation",
      href: formatAdminURL({ adminRoute, path: "/collections/orders" }),
      icon: "shopping-bag",
      label: "Open orders",
      tone: "sage",
      value: "18",
    },
    {
      detail: "2 critical and 2 low-stock components",
      href: formatAdminURL({ adminRoute, path: "/collections/products" }),
      icon: "triangle-alert",
      label: "Supply alerts",
      tone: "rose",
      value: "4",
    },
    {
      detail: "3 repeat buyers reactivated this week",
      href: formatAdminURL({ adminRoute, path: "/collections/customers" }),
      icon: "users",
      label: "New customers",
      tone: "olive",
      value: "11",
    },
  ],
  orders: {
    ctaHref: formatAdminURL({ adminRoute, path: "/collections/orders" }),
    ctaLabel: "Open orders",
    description: "A concise queue view that keeps payment, processing, and dispatch work visible without turning the dashboard into a reporting screen.",
    states: [
      {
        count: 6,
        detail: "Customer follow-up and payment confirmation",
        icon: "clock-3",
        label: "Awaiting payment",
      },
      {
        count: 8,
        detail: "Packed or being prepared for dispatch",
        icon: "shopping-bag",
        label: "Processing",
      },
      {
        count: 4,
        detail: "Ready for labels, courier booking, or pickup",
        icon: "truck",
        label: "Ready to dispatch",
      },
    ],
    title: "Orders pulse",
  },
  recentOrders: {
    ctaHref: formatAdminURL({ adminRoute, path: "/collections/orders" }),
    ctaLabel: "View all",
    rows: [
      {
        amount: "€1.240",
        date: "14 Apr",
        email: "atelier@ritual.hr",
        href: formatAdminURL({ adminRoute, path: "/collections/orders" }),
        id: "recent-order-1",
        status: "Paid",
        tone: "sage",
      },
      {
        amount: "€320",
        date: "13 Apr",
        email: "studio@vellum.co",
        href: formatAdminURL({ adminRoute, path: "/collections/orders" }),
        id: "recent-order-2",
        status: "Pending",
        tone: "rose",
      },
      {
        amount: "€880",
        date: "13 Apr",
        email: "hello@northfield.design",
        href: formatAdminURL({ adminRoute, path: "/collections/orders" }),
        id: "recent-order-3",
        status: "Paid",
        tone: "sage",
      },
      {
        amount: "€460",
        date: "12 Apr",
        email: "orders@copperlane.eu",
        href: formatAdminURL({ adminRoute, path: "/collections/orders" }),
        id: "recent-order-4",
        status: "Pending",
        tone: "rose",
      },
      {
        amount: "€1.060",
        date: "12 Apr",
        email: "procurement@elmhouse.studio",
        href: formatAdminURL({ adminRoute, path: "/collections/orders" }),
        id: "recent-order-5",
        status: "Paid",
        tone: "sage",
      },
    ],
    title: "Recent orders",
  },
  revenue: {
    change: "+12%",
    changeLabel: "vs previous week",
    description: "Placeholder revenue trend split by product mix so each day shows what is actually carrying the week.",
    points: [
      {
        accessoryRevenue: 150,
        capsulesRevenue: 260,
        coffeeRevenue: 880,
        giftSetRevenue: 190,
        label: "Mon",
        matchaRevenue: 340,
        revenue: 1820,
      },
      {
        accessoryRevenue: 180,
        capsulesRevenue: 310,
        coffeeRevenue: 970,
        giftSetRevenue: 240,
        label: "Tue",
        matchaRevenue: 440,
        revenue: 2140,
      },
      {
        accessoryRevenue: 210,
        capsulesRevenue: 360,
        coffeeRevenue: 1040,
        giftSetRevenue: 280,
        label: "Wed",
        matchaRevenue: 520,
        revenue: 2410,
      },
      {
        accessoryRevenue: 170,
        capsulesRevenue: 340,
        coffeeRevenue: 980,
        giftSetRevenue: 230,
        label: "Thu",
        matchaRevenue: 540,
        revenue: 2260,
      },
      {
        accessoryRevenue: 220,
        capsulesRevenue: 470,
        coffeeRevenue: 1210,
        giftSetRevenue: 320,
        label: "Fri",
        matchaRevenue: 670,
        revenue: 2890,
      },
      {
        accessoryRevenue: 240,
        capsulesRevenue: 520,
        coffeeRevenue: 1260,
        giftSetRevenue: 410,
        label: "Sat",
        matchaRevenue: 720,
        revenue: 3150,
      },
      {
        accessoryRevenue: 280,
        capsulesRevenue: 590,
        coffeeRevenue: 1440,
        giftSetRevenue: 470,
        label: "Sun",
        matchaRevenue: 970,
        revenue: 3750,
      },
    ],
    title: "Revenue overview",
    total: formatCurrencyCompact(18420),
  },
  supply: {
    ctaHref: formatAdminURL({ adminRoute, path: "/collections/products" }),
    ctaLabel: "Inspect inventory",
    description: "Placeholder supply logic for now. Later this can be driven by real Moralis quantities and an agreed low-stock threshold.",
    items: [
      {
        detail: "Blend base is running below the desired weekend buffer.",
        href: formatAdminURL({ adminRoute, path: "/collections/products" }),
        name: "House blend concentrate",
        quantity: "2 units",
        severity: "critical",
      },
      {
        detail: "Packaging count should be topped up before the next dispatch cycle.",
        href: formatAdminURL({ adminRoute, path: "/collections/products" }),
        name: "Gift carton sleeves",
        quantity: "4 units",
        severity: "low",
      },
      {
        detail: "Stock is holding comfortably for the current queue.",
        href: formatAdminURL({ adminRoute, path: "/collections/products" }),
        name: "Signature candles",
        quantity: "18 units",
        severity: "stable",
      },
    ],
    title: "Supply status",
    warning: "4 components need attention across storage and dispatch readiness.",
  },
});
