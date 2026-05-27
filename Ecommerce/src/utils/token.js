const TOKEN_KEY = "accessToken";
const COOKIE_KEY = "token";

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function readCookie(name) {
  if (!isBrowser()) return null;
  const encoded = encodeURIComponent(name);
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${encoded}=`));
  if (!match) return null;
  return decodeURIComponent(match.substring(encoded.length + 1));
}

function writeCookie(name, value, days = 30) {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax${secure}`;
}

function removeCookie(name) {
  if (!isBrowser()) return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function getAuthToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY) || readCookie(COOKIE_KEY) || null;
}

export function persistAuthToken(token) {
  if (!isBrowser() || !token) return;
  localStorage.setItem(TOKEN_KEY, token);
  writeCookie(COOKIE_KEY, token, 30);
}

export function clearAuthToken() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  removeCookie(COOKIE_KEY);
}
