import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute() {
  const { user } = useAuthStore();
  console.log(user);

  return user ? <Outlet /> : <Navigate to='/' />;
}
