const FALLBACK_IMAGE_SVG = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" role="img" aria-label="No image">
    <rect width="100%" height="100%" fill="#f3f4f6" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="20">No Image</text>
  </svg>
`);

export const FALLBACK_IMAGE = `data:image/svg+xml;charset=UTF-8,${FALLBACK_IMAGE_SVG}`;

export function getSafeImageUrl(rawUrl) {
  if (typeof rawUrl !== "string") return FALLBACK_IMAGE;

  const value = rawUrl.trim();
  if (!value) return FALLBACK_IMAGE;

  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return value;

  // Prevent invalid host lookups such as https://_cow%20milk/
  return FALLBACK_IMAGE;
}
