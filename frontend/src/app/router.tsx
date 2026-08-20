import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute, PublicRoute } from "@/components/layout/ProtectedRoute";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";

const LandingPage = lazy(() => import("@/features/landing/pages/LandingPage").then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => import("@/features/customers/pages/CustomersPage").then((m) => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() => import("@/features/customers/pages/CustomerDetailPage").then((m) => ({ default: m.CustomerDetailPage })));
const JourneyExplorerPage = lazy(() => import("@/features/journeys/pages/JourneyExplorerPage").then((m) => ({ default: m.JourneyExplorerPage })));
const SegmentsPage = lazy(() => import("@/features/segments/pages/SegmentsPage").then((m) => ({ default: m.SegmentsPage })));
const PredictionsPage = lazy(() => import("@/features/intelligence/pages/PredictionsPage").then((m) => ({ default: m.PredictionsPage })));
const NextBestActionsPage = lazy(() => import("@/features/next-best-actions/pages/NextBestActionsPage").then((m) => ({ default: m.NextBestActionsPage })));
const AnalyticsPage = lazy(() => import("@/features/analytics/pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const FunnelAnalyticsPage = lazy(() => import("@/features/analytics/pages/FunnelAnalyticsPage").then((m) => ({ default: m.FunnelAnalyticsPage })));
const SegmentAnalyticsPage = lazy(() => import("@/features/analytics/pages/SegmentAnalyticsPage").then((m) => ({ default: m.SegmentAnalyticsPage })));
const ProductAnalyticsPage = lazy(() => import("@/features/analytics/pages/ProductAnalyticsPage").then((m) => ({ default: m.ProductAnalyticsPage })));
const DatasetsPage = lazy(() => import("@/features/admin/pages/DatasetsPage").then((m) => ({ default: m.DatasetsPage })));
const DatasetUploadPage = lazy(() => import("@/features/admin/pages/DatasetUploadPage").then((m) => ({ default: m.DatasetUploadPage })));
const ModelsPage = lazy(() => import("@/features/admin/pages/ModelsPage").then((m) => ({ default: m.ModelsPage })));
const SystemDemoPage = lazy(() => import("@/features/admin/pages/SystemDemoPage").then((m) => ({ default: m.SystemDemoPage })));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingState rows={5} />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Lazy><LandingPage /></Lazy>,
  },
  {
    path: "/login",
    element: <PublicRoute><Lazy><LoginPage /></Lazy></PublicRoute>,
  },
  {
    path: "/register",
    element: <PublicRoute><Lazy><RegisterPage /></Lazy></PublicRoute>,
  },
  {
    path: "/forgot-password",
    element: <PublicRoute><Lazy><ForgotPasswordPage /></Lazy></PublicRoute>,
  },
  {
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: "dashboard", element: <Lazy><DashboardPage /></Lazy> },
      { path: "customers", element: <Lazy><CustomersPage /></Lazy> },
      { path: "customers/:id", element: <Lazy><CustomerDetailPage /></Lazy> },
      { path: "journeys", element: <Lazy><JourneyExplorerPage /></Lazy> },
      { path: "journeys/stages", element: <PlaceholderPage title="Journey Stages" /> },
      { path: "journeys/paths", element: <PlaceholderPage title="Common Paths" /> },
      { path: "journeys/dropoffs", element: <PlaceholderPage title="Drop-Off Analysis" /> },
      { path: "segments", element: <Lazy><SegmentsPage /></Lazy> },
      { path: "segments/rfm", element: <PlaceholderPage title="RFM / Behavioral Segments" /> },
      { path: "segments/clusters", element: <PlaceholderPage title="ML Clusters" /> },
      { path: "intelligence/predictions", element: <Lazy><PredictionsPage /></Lazy> },
      { path: "intelligence/propensity", element: <PlaceholderPage title="Purchase Propensity" /> },
      { path: "intelligence/risk", element: <PlaceholderPage title="Risk Analysis" /> },
      { path: "intelligence/explanations", element: <PlaceholderPage title="Model Explanation" /> },
      { path: "next-best-actions", element: <Lazy><NextBestActionsPage /></Lazy> },
      { path: "next-best-actions/rules", element: <PlaceholderPage title="Action Rules" /> },
      { path: "next-best-actions/suppression", element: <PlaceholderPage title="Suppression / Wait" /> },
      { path: "recommendations/products", element: <PlaceholderPage title="Product Recommendations" /> },
      { path: "recommendations/personalization", element: <PlaceholderPage title="Personalization" /> },
      { path: "analytics", element: <Lazy><AnalyticsPage /></Lazy> },
      { path: "analytics/funnel", element: <Lazy><FunnelAnalyticsPage /></Lazy> },
      { path: "analytics/segments", element: <Lazy><SegmentAnalyticsPage /></Lazy> },
      { path: "analytics/products", element: <Lazy><ProductAnalyticsPage /></Lazy> },
      { path: "experiments", element: <PlaceholderPage title="Experiments" /> },
      { path: "experiments/strategies", element: <PlaceholderPage title="Strategy Comparison" /> },
      { path: "experiments/models", element: <PlaceholderPage title="Model Evaluation" /> },
      { path: "admin/demo", element: <Lazy><SystemDemoPage /></Lazy> },
      { path: "admin/datasets", element: <Lazy><DatasetsPage /></Lazy> },
      { path: "admin/datasets/upload", element: <Lazy><DatasetUploadPage /></Lazy> },
      { path: "admin/models", element: <Lazy><ModelsPage /></Lazy> },
      { path: "admin/users", element: <PlaceholderPage title="User Management" /> },
      { path: "admin/configuration", element: <PlaceholderPage title="Configuration" /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
