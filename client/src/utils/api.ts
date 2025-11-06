// API utility functions for making authenticated requests

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Helper function to make authenticated API calls
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add existing headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // Add Authorization header if token is provided
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Request failed",
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

// GET request
export async function apiGet<T = any>(
  endpoint: string,
  token?: string | null
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: "GET" }, token);
}

// POST request
export async function apiPost<T = any>(
  endpoint: string,
  body: any,
  token?: string | null
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    endpoint,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    token
  );
}

// PUT request
export async function apiPut<T = any>(
  endpoint: string,
  body: any,
  token?: string | null
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
    token
  );
}

// DELETE request
export async function apiDelete<T = any>(
  endpoint: string,
  token?: string | null
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: "DELETE" }, token);
}
