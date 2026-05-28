/**
 * Price Formatter Utility - Centralized price handling to prevent display issues
 * This ensures consistent price formatting across all components
 */

/**
 * Get price from product object (handles multiple formats)
 * @param {Object} product - Product object
 * @returns {number} Price value
 */
export const getPrice = (product) => {
  if (!product) return 0;

  // Try different possible price locations
  if (typeof product.price === "number") return product.price;
  if (product.selling_Price?.price) return product.selling_Price.price;
  if (product.price) return parseFloat(product.price) || 0;

  return 0;
};

/**
 * Get unit from product object (handles multiple formats)
 * @param {Object} product - Product object
 * @returns {string} Unit value
 */
export const getUnit = (product) => {
  if (!product) return "pcs";

  // Try different possible unit locations
  if (product.selling_Price?.unit) return product.selling_Price.unit;
  if (product.quantity_Unit) return product.quantity_Unit;
  if (product.unit) return product.unit;

  return "pcs";
};

/**
 * Format price for display with rupee symbol and thousand separator
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  const numPrice = parseFloat(price) || 0;
  return `₹${numPrice.toLocaleString("en-IN")}`;
};

/**
 * Get formatted price display from product
 * @param {Object} product - Product object
 * @returns {string} Formatted price with unit
 */
export const getPriceDisplay = (product) => {
  const price = getPrice(product);
  const unit = getUnit(product);
  return `${formatPrice(price)} / ${unit}`;
};

/**
 * Convert product price to a safe number for calculations
 * @param {*} value - Value to convert
 * @returns {number} Safe numeric value
 */
export const toSafeNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export default {
  getPrice,
  getUnit,
  formatPrice,
  getPriceDisplay,
  toSafeNumber,
};
