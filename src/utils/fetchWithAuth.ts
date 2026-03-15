const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

export async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const makeRequest = () =>
    fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
      },
    });

  let response = await makeRequest();

  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      response = await makeRequest();
    } else {
      window.location.href = "/login";
      throw new Error("Session expirée, veuillez vous reconnecter.");
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;

    try {
      const data = await response.json();
      errorMessage = data.error || data.message || errorMessage;
    } catch {
      const text = await response.text();
      if (text) errorMessage = text;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
