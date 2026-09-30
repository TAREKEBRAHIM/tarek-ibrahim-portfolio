const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("saas_token");
}

function setSession(token, user) {
  localStorage.setItem("saas_token", token);
  localStorage.setItem("saas_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("saas_token");
  localStorage.removeItem("saas_user");
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("saas_user") || "null");
  } catch {
    return null;
  }
}

async function apiRequest(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearSession();
    if (!location.pathname.endsWith("login.html") && location.pathname !== "/") {
      window.location.href = "/login.html";
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

const api = {
  get: (path) => apiRequest("GET", path),
  post: (path, body) => apiRequest("POST", path, body),
  put: (path, body) => apiRequest("PUT", path, body),
  delete: (path) => apiRequest("DELETE", path),
};
