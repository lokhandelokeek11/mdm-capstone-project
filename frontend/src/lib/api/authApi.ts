import { apiClient } from "./client";
import type { ApiResponse, User } from "@/types";
import type { LoginFormData, RegisterFormData } from "@/schemas";

interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (data: LoginFormData) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return res.data;
  },
  register: async (data: RegisterFormData) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post<ApiResponse<null>>("/auth/logout");
    return res.data;
  },
  me: async () => {
    const res = await apiClient.get<ApiResponse<User>>("/auth/me");
    return res.data;
  },
};
