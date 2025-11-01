export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const API_BASE_URL = "http://localhost:3000";

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
    credentials: "include", // ✅ important — send the refresh cookie
  });

  // If the access token expired
  if (response.status === 401) {
    console.warn("Access token expired, trying refresh...");

    // Try refreshing
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // ✅ also needed here
    });

    if (refreshResponse.ok) {
      const { token: newToken } = await refreshResponse.json();
      localStorage.setItem("token", newToken);

      // Retry original request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
        credentials: "include",
      });
    } else {
      console.error("Refresh token invalid or expired — logging out");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `HTTP error ${response.status}`);
  }

  return response.json();
}
