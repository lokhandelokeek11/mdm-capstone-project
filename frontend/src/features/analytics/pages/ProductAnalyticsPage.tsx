import { PageHeader } from "@/components/common/PageHeader";
import { ChartCard } from "@/components/charts/ChartCard";
import { StatCard } from "@/components/common/StatCard";
import { DataTable } from "@/components/common/DataTable";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Package, CheckCircle, Tag } from "lucide-react";

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

interface ProductDetail {
  id: string;
  itemId: string;
  categoryNode: string;
  views: number;
  carts: number;
  orders: number;
  conversionRate: string;
  stockStatus: string;
  recommendedAction: string;
}

const topCategoryData = [
  { category: "Category #1338 (Audio)", views: 421000, carts: 14200, orders: 4800 },
  { category: "Category #289 (Phones)", views: 312000, carts: 9800, orders: 3100 },
  { category: "Category #512 (Cameras)", views: 245000, carts: 7100, orders: 2400 },
  { category: "Category #1014 (Laptops)", views: 198000, carts: 5400, orders: 1900 },
  { category: "Category #780 (Accessories)", views: 165000, carts: 4200, orders: 1200 },
];

const productList: ProductDetail[] = [
  {
    id: "prod_1",
    itemId: "Item #460429",
    categoryNode: "Node #1338 (Electronics / Audio)",
    views: 14210,
    carts: 1180,
    orders: 412,
    conversionRate: "34.9%",
    stockStatus: "✓ In Stock (available: 1)",
    recommendedAction: "CART_REMINDER",
  },
  {
    id: "prod_2",
    itemId: "Item #289104",
    categoryNode: "Node #289 (Mobile Accessories)",
    views: 9850,
    carts: 840,
    orders: 298,
    conversionRate: "35.4%",
    stockStatus: "✓ In Stock (available: 1)",
    recommendedAction: "DISCOUNT",
  },
  {
    id: "prod_3",
    itemId: "Item #512901",
    categoryNode: "Node #512 (Digital Photography)",
    views: 7420,
    carts: 610,
    orders: 185,
    conversionRate: "30.3%",
    stockStatus: "✓ In Stock (available: 1)",
    recommendedAction: "PERSONALIZED_EMAIL",
  },
  {
    id: "prod_4",
    itemId: "Item #101488",
    categoryNode: "Node #1014 (Computers & Laptops)",
    views: 6190,
    carts: 490,
    orders: 142,
    conversionRate: "28.9%",
    stockStatus: "⚠ Low Stock (available: 1)",
    recommendedAction: "STOCK_ALERT",
  },
  {
    id: "prod_5",
    itemId: "Item #780211",
    categoryNode: "Node #780 (Gaming Accessories)",
    views: 5120,
    carts: 380,
    orders: 98,
    conversionRate: "25.7%",
    stockStatus: "✓ In Stock (available: 1)",
    recommendedAction: "DISCOUNT",
  },
];

export function ProductAnalyticsPage() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Product & Category Taxonomy Analytics"
        description="Catalog view counts, cart additions, inventory availability checks (available == 1), and category conversion rates."
      />

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard metric={{ label: "Total Catalog Items Tracked", value: 36890, change: 4.1 }} />
        <StatCard metric={{ label: "Active Category Nodes", value: 1669, change: 1.2 }} />
        <StatCard metric={{ label: "Catalog In-Stock Ratio", value: 94.2, format: "percent", change: 0.5 }} />
        <StatCard metric={{ label: "Top Product Views (#460429)", value: 14210, change: 18.5 }} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-1">
        <ChartCard title="Top Product Categories by Interaction Velocity (Views vs Carts vs Orders)">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }} />
              <Bar dataKey="views" name="Product Views" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="carts" name="Cart Additions" fill="#EC4899" radius={[6, 6, 0, 0]} />
              <Bar dataKey="orders" name="Orders Completed" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Product Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Package className="h-4 w-4 text-purple-600" />
          Top Performing Catalog Items & Stock Verification
        </h3>

        <DataTable<ProductDetail>
          data={productList}
          keyExtractor={(p) => p.id}
          columns={[
            {
              key: "itemId",
              header: "Product Item ID",
              render: (p) => (
                <span className="font-bold text-slate-900 font-mono text-xs flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-purple-600" />
                  {p.itemId}
                </span>
              ),
            },
            {
              key: "categoryNode",
              header: "Category Node Hierarchy",
              render: (p) => <span className="text-xs font-semibold text-slate-700">{p.categoryNode}</span>,
            },
            {
              key: "views",
              header: "Views Logged",
              render: (p) => <span className="font-mono text-xs font-bold text-slate-800">{formatNumber(p.views)}</span>,
            },
            {
              key: "carts",
              header: "Cart Additions",
              render: (p) => <span className="font-mono text-xs font-bold text-purple-700">{formatNumber(p.carts)}</span>,
            },
            {
              key: "orders",
              header: "Completed Orders",
              render: (p) => <span className="font-mono text-xs font-extrabold text-emerald-700">{formatNumber(p.orders)}</span>,
            },
            {
              key: "stockStatus",
              header: "Catalog Stock Check",
              render: (p) => (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle className="h-3 w-3" />
                  {p.stockStatus}
                </span>
              ),
            },
            {
              key: "recommendedAction",
              header: "Target Action",
              render: (p) => (
                <span className="inline-flex items-center rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
                  {p.recommendedAction}
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
