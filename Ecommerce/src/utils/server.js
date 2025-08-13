// helpers.js

// Uses localStorage for token, keep in sync with where you actually store it!
const getToken = () => localStorage.getItem('accessToken');

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = new Error(data.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

export const makeUnauthenticatedPOSTRequest = async (route, body) => {
  try {
    const response = await fetch(`${API_BASE}${route}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
      credentials: 'include' // Crucial for cookies/JWT
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("POST request failed:", { route, error });
    throw error;
  }
};

// For authenticated requests
export const makeAuthenticatedRequest = async (route, { method = 'GET', body }) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_BASE}${route}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });

  return await handleResponse(response);
};

export const makeAuthenticatedGETRequest = async (route) => {
  const token = getToken();
  const response = await fetch(import.meta.env.VITE_API + route, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};
