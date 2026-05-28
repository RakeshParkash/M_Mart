# Price Display Standards - M. Mart E-Commerce

## Overview

This document ensures consistent price handling across all components to prevent display issues.

## Problem Solved

Previously, price and product information was displayed inconsistently across different pages (Categories, Cart, Wishlist), causing missing or misformatted data.

## Solution: Use `priceFormatter.js` Utility

### Import

```javascript
import {
  getPriceDisplay,
  getPrice,
  getUnit,
  formatPrice,
  toSafeNumber,
} from "../utils/priceFormatter";
```

### Available Functions

#### 1. **getPriceDisplay(product)**

Returns formatted price string with unit (e.g., "₹100 / pcs")

```javascript
<div>{getPriceDisplay(product)}</div>
// Output: ₹1,500 / kg
```

#### 2. **getPrice(product)**

Extracts price as a number (handles multiple product formats)

```javascript
const price = getPrice(product); // Returns: 1500
```

#### 3. **getUnit(product)**

Extracts unit (handles multiple product formats)

```javascript
const unit = getUnit(product); // Returns: "kg"
```

#### 4. **formatPrice(price)**

Formats number with rupee symbol and thousand separators

```javascript
const formatted = formatPrice(1500); // Returns: "₹1,500"
```

#### 5. **toSafeNumber(value)**

Safely converts any value to a number (use for calculations)

```javascript
const num = toSafeNumber("₹1,500/-"); // Returns: 1500
const total = cartItems.reduce(
  (sum, item) => sum + toSafeNumber(item.price),
  0,
);
```

## Backend API Format

All product endpoints return data in this standardized format:

```javascript
{
  _id: "product-id",
  name: "Product Name",
  description: "Product description",
  desc: "Short description",
  image: "image-url",
  img: "image-url",
  price: 1500,
  selling_Price: {
    price: 1500,
    unit: "kg"
  },
  quantity_Unit: "kg",
  stock: 50,
  totalSold: 100
}
```

## Component Examples

### Categories Page

```javascript
import { getPriceDisplay } from "../utils/priceFormatter";

<div className="text-green-700 font-bold text-xl">
  {getPriceDisplay(product)}
</div>;
```

### Cart/Wishlist

```javascript
import { getPriceDisplay } from "../utils/priceFormatter";

<div className="text-green-700 font-semibold">{getPriceDisplay(product)}</div>;
```

### Price Calculations

```javascript
import { toSafeNumber } from "../utils/priceFormatter";

const total = cart.reduce((sum, item) => {
  const unitPrice = toSafeNumber(item.product?.price);
  return sum + item.quantity * unitPrice;
}, 0);
```

## What NOT to Do ❌

```javascript
// ❌ Don't access price directly - may not exist
product.price?.toLocaleString()

// ❌ Don't assume selling_Price structure
`₹${product.selling_Price.price}`

// ❌ Don't mix formatting logic in components
const formatted = `₹${price.toLocaleString()}`

// ❌ Don't ignore safe number conversion for calculations
const total = sum + item.price // Could be string!
```

## Checklist for New Components

When displaying products:

- [ ] Import `getPriceDisplay` from `priceFormatter.js`
- [ ] Use `getPriceDisplay(product)` for display
- [ ] Use `toSafeNumber()` for calculations
- [ ] Test with different product data formats
- [ ] Verify price shows correctly across all pages

## Files Using Price Formatter

- `src/pages/Categories.jsx`
- `src/pages/Cart.jsx`
- `src/pages/Wishlist.jsx`
- `src/pages/MyAccount.jsx`
- `Backend/routes/product.js`

## Testing

Always test with:

1. Products with prices (e.g., ₹100)
2. Products without prices (should show ₹0)
3. Different units (kg, pcs, liter, etc.)
4. Cart calculations
5. Multiple items in cart

## Future Improvements

- Add currency selector (currently hardcoded to ₹)
- Add price range display
- Add discount price handling
