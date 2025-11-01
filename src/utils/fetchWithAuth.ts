export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let token = localStorage.getItem("token");

  // First request
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include", // send refresh cookie
  });

  // If access token expired
  if (response.status === 401) {
    console.warn("Access token expired, trying refresh...");

    const refreshResponse = await fetch(`${new URL(url).origin}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      token = data.token;
      localStorage.setItem("token", token);

      // Retry original request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } else {
      console.error("Refresh token invalid or expired — logging out");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired"));
    }
  }

  if (!response.ok) {
    const errText = await response.text();
    return Promise.reject(
      new Error(errText || `HTTP error ${response.status}`)
    );
  }

  return response.json();
}
