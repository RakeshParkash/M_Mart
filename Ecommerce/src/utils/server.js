// helpers.js

// Uses localStorage for token, keep in sync with where you actually store it!
const getToken = () => localStorage.getItem('accessToken');

const handleErrorResponse = async (response) => {
  
  const responseClone = response.clone();
  
  try {
    const errorData = await responseClone.json();
    return errorData.message || `HTTP error! status: ${response.status}`;
  } catch {
    const errorText = await response.text();
    return errorText || `HTTP error! status: ${response.status}`;
  }
};

export const makeUnauthenticatedPOSTRequest = async (route, body) => {
  try {
    const API_BASE = import.meta.env.VITE_API || "https://m-mart-ad2q.onrender.com";
    const response = await fetch(`${API_BASE}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMessage = await handleErrorResponse(response);
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error("POST request failed:", { route, error: error.message });
    throw error;
  }
};

export const makeAuthenticatedPOSTRequest = async (route, body) => {
  const token = getToken();
  const response = await fetch(import.meta.env.VITE_API + route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return await response.json();
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
