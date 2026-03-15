const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

let refreshPromise: Promise<boolean> | null = null;
let sessionExpired = false;

async function refreshOnce(): Promise<boolean> {
  if (sessionExpired) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          sessionExpired = true;
        }
        return res.ok;
      })
      .catch(() => {
        sessionExpired = true;
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export function resetSessionExpiredFlag() {
  sessionExpired = false;
}

export async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (sessionExpired) {
    throw new Error("Session expirée, veuillez vous reconnecter.");
  }

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
    const refreshed = await refreshOnce();

    if (!refreshed) {
      window.location.replace("https://vegibec-portail.com/");
      throw new Error("Session expirée, veuillez vous reconnecter.");
    }

    response = await makeRequest();
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

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return null as T;
}
