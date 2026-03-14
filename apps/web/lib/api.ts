const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  token?: string
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Something went wrong");
  }

  return res.json();
}

export { API_URL };