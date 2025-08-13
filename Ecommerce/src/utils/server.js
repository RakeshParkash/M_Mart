// helpers.js

// Uses localStorage for token, keep in sync with where you actually store it!
const getToken = () => localStorage.getItem('accessToken');

export const makeUnauthenticatedPOSTRequest = async (route, body) => {
  try {
    if (!route) throw new Error("Route is required");
    if (!body) throw new Error("Request body is required");

    const response = await fetch(import.meta.env.VITE_API + route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("POST request failed:", { route, error: error.message });
    return { success: false, error: error.message };
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
