const API_BASE_URL = "http://127.0.0.1:8000";

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Something went wrong");
  }

  return response.json();
}

export const api = {
  onboard: (data: {
    name: string;
    phone: string;
    location: string;
    platform: string;
    shift: string;
    weekly_income: number;
    days_per_week: number;
  }) => apiRequest<any>("POST", "/onboard", data),

  login: (phone: string) => apiRequest<any>("POST", "/login", { phone }),

  selectPlan: (data: { user_id: number; selected_plan: string }) =>
    apiRequest<any>("POST", "/select-plan", data),

  pay: (data: { user_id: number }) => apiRequest<any>("POST", "/pay", data),

  getDashboard: (userId: number) =>
    apiRequest<any>("GET", `/dashboard/${userId}`),

  triggerRain: (data: { location: string; rainfall_mm: number }) =>
    apiRequest<any>("POST", "/trigger/rain", data),
};
