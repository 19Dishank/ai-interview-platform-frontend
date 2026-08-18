import { clientApi } from "@/services/api/client-axios";
import type { AdminStats, InterviewChartData, AdminMockUser, Plan, Template } from "@/types";

export const fetchAdminDashboardStats = async (): Promise<AdminStats> => {
  const response = await clientApi.get("/admin/dashboard/stats");
  return response.data.data;
};

export const fetchAdminDashboardCharts = async (): Promise<InterviewChartData[]> => {
  const response = await clientApi.get("/admin/dashboard/charts");
  return response.data.data;
};

export const fetchAdminDomainBreakdown = async () => {
  const response = await clientApi.get("/admin/dashboard/domains");
  return response.data.data;
};

export const fetchAdminUsers = async (params: {
  query?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const urlParams = new URLSearchParams();
  if (params.query) urlParams.append("query", params.query);
  if (params.role && params.role !== "all") urlParams.append("role", params.role);
  if (params.status && params.status !== "all") urlParams.append("status", params.status);

  const queryStr = urlParams.toString() ? `?${urlParams.toString()}` : "";
  const response = await clientApi.get(`/admin/users${queryStr}`);
  return response.data.data;
};

export const updateAdminUserStatus = async (id: string, status: "active" | "suspended") => {
  const response = await clientApi.patch(`/admin/users/${id}/status`, { status });
  return response.data.data;
};

export const fetchAdminSubscriptions = async () => {
  const response = await clientApi.get("/admin/subscriptions");
  return response.data.data;
};

export const fetchAdminTemplates = async (): Promise<Template[]> => {
  const response = await clientApi.get("/admin/templates");
  return response.data.data;
};

export const createAdminTemplate = async (data: Partial<Template>) => {
  const response = await clientApi.post("/admin/templates", data);
  return response.data.data;
};

export const updateAdminTemplate = async (id: string, data: Partial<Template>) => {
  const response = await clientApi.put(`/admin/templates/${id}`, data);
  return response.data.data;
};

export const deleteAdminTemplate = async (id: string) => {
  const response = await clientApi.delete(`/admin/templates/${id}`);
  return response.data.data;
};
