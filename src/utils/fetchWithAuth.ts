export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let token = localStorage.getItem("token");
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  if (response.status === 401) {
    // try refresh
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      const { token: newToken } = await refreshResponse.json();
      token = newToken;
      localStorage.setItem("token", token as string);

      // retry original request
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
        credentials: "include",
      });
    } else {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired"));
    }
  }

  if (!response.ok) {
    const text = await response.text();
    return Promise.reject(new Error(text || `HTTP error ${response.status}`));
  }

  return response.json();
}
