import { createBrowserRouter } from "react-router-dom";
import AppError from "@/pages/AppError";
import PageNotFound from "@/pages/PageNotFound";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Diary from "@/pages/Diary";
import PublicLayout from "@/components/PublicLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />, // Layout for public pages
    errorElement: <AppError />,
    children: [
      { index: true, element: <Home /> },
      { path: "*", element: <PageNotFound /> },
    ],
  },
  {
    path: "/a",
    element: <ProtectedRoute />, // Protect the whole block
    errorElement: <AppError />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "diary", element: <Diary /> },
        ],
      },
    ],
  },
]);
