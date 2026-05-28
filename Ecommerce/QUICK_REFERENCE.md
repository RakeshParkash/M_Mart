# Quick Reference: Using Price Formatter

## One-Liner Solutions

### Display Product Price
```jsx
import { getPriceDisplay } from "../utils/priceFormatter";
<div className="price">{getPriceDisplay(product)}</div>
// Output: ₹1,500 / kg
```

### Calculate Total Price
```jsx
import { toSafeNumber } from "../utils/priceFormatter";
const total = items.reduce((sum, item) => 
  sum + (item.quantity * toSafeNumber(item.product?.price)), 0
);
```

### Format a Number to Price
```jsx
import { formatPrice } from "../utils/priceFormatter";
<span>{formatPrice(1500)}</span>
// Output: ₹1,500
```

## Import Template

Copy this to the top of any component displaying products:

```javascript
import { 
  getPriceDisplay,     // For display: "₹1,500 / kg"
  getPrice,            // For raw price value: 1500
  getUnit,             // For unit: "kg"
  formatPrice,         // For formatting: "₹1,500"
  toSafeNumber         // For calculations
} from "../utils/priceFormatter";
```

## Common Patterns

### Product Card
```jsx
<div className="product-card">
  <img src={product.image} alt={product.name} />
  <h3>{product.name}</h3>
  <p>{product.description}</p>
  <div className="price-section">
    <span className="price">{getPriceDisplay(product)}</span>
    {product.stock > 0 && <span className="stock">In Stock</span>}
  </div>
</div>
```

### Cart Item
```jsx
<div className="cart-item">
  <span className="name">{product.name}</span>
  <span className="price">{getPriceDisplay(product)}</span>
  <input type="number" value={quantity} />
  <span className="total">{formatPrice(toSafeNumber(product.price) * quantity)}</span>
</div>
```

### Price Calculation
```jsx
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const price = toSafeNumber(item.product?.price);
    return total + (price * item.quantity);
  }, 0);
};

<div className="total">
  Total: {formatPrice(calculateTotal(cartItems))}
</div>
```

## API Response Format

**All product endpoints return:**
```javascript
{
  _id: "60d5ec49c1234567890abc12",
  name: "Tomato",
  description: "Fresh red tomatoes",
  desc: "Fresh red tomatoes",                 // Short description
  image: "https://example.com/tomato.jpg",
  img: "https://example.com/tomato.jpg",     // Fallback image
  price: 50,                                  // Direct access
  selling_Price: { price: 50, unit: "kg" },  // Full structure
  quantity_Unit: "kg",
  stock: 100,
  totalSold: 500
}
```

## Troubleshooting

**Problem: "getPriceDisplay is not a function"**
- Solution: Make sure import path is correct: `from "../utils/priceFormatter"`

**Problem: Price shows as "₹0 / undefined"**
- Solution: Check product object has `price` or `selling_Price` fields
- Use: `console.log(product)` to inspect structure

**Problem: Cart total is wrong**
- Solution: Use `toSafeNumber()` on price before multiplying
- Wrong: `sum + item.price * quantity`
- Right: `sum + toSafeNumber(item.price) * quantity`

**Problem: "undefined / undefined"**
- Solution: Product data structure missing fields. Check backend response.

## Testing Your Component

```javascript
// Test data
const testProduct = {
  _id: "test-123",
  name: "Test Product",
  description: "Test description",
  price: 1500,
  selling_Price: { price: 1500, unit: "kg" },
  stock: 50
};

console.log(getPriceDisplay(testProduct));    // ₹1,500 / kg
console.log(getPrice(testProduct));           // 1500
console.log(getUnit(testProduct));            // kg
console.log(formatPrice(1500));               // ₹1,500
console.log(toSafeNumber("1500"));            // 1500
console.log(toSafeNumber("₹1,500"));          // 1500
```

## Files to Check

- ✅ Backend: `Backend/routes/product.js` - Ensure all endpoints return correct format
- ✅ Utils: `Ecommerce/src/utils/priceFormatter.js` - The utility file
- ✅ Examples: `Ecommerce/src/pages/Categories.jsx`, `Cart.jsx`, `Wishlist.jsx`
- ✅ Docs: `PRICE_DISPLAY_STANDARDS.md` - Full documentation

## When to Use Each Function

| Function | Use When | Returns | Example |
|----------|----------|---------|---------|
| `getPriceDisplay()` | Displaying price in UI | String | "₹1,500 / kg" |
| `getPrice()` | Need just the number | Number | 1500 |
| `getUnit()` | Need just the unit | String | "kg" |
| `formatPrice()` | Formatting a number | String | "₹1,500" |
| `toSafeNumber()` | Doing calculations | Number | 1500 |

---

**Last Updated**: May 29, 2026
**Created for**: Preventing price display issues across the application
