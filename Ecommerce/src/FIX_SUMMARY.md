# M_Mart App Improvements Implementation Plan

This document outlines the implementation plan for the large set of features, UI fixes, and bug fixes requested for the M_Mart application. The focus is on maintaining a mobile-first, highly functional experience for both web and mobile users.

> [!WARNING]
> This plan involves extensive changes across the frontend (React) and backend (Express/MongoDB). Please review the Open Questions carefully before approving.

## User Review Required

### Open Questions

1. **Fingerprint Login:** Adding fingerprint login typically involves WebAuthn (for web browsers) or a React Native wrapper bridge (if this is compiled to a native mobile app). Should we implement WebAuthn for modern browsers, or are you using a specific wrapper (like Capacitor/Cordova) where we should use a native plugin?
2. **Sound Box API:** You mentioned a sound box API for payments. Do you have a specific provider in mind (e.g., Paytm, PhonePe), or should we simulate this using the browser's Text-to-Speech API (which plays audio confirmation from the phone/computer speakers)?
3. **Caching:** For the "Redis cache or something" request, since you are hosted on Render, do you want to provision a Redis instance, or should we implement an efficient **in-memory cache** (using `node-cache`) directly in the Node.js backend to save costs and complexity while still speeding up load times significantly?
4. **Variants (Smaller/Bigger products):** We plan to add a `variants` array to the Product schema to allow different sizes/weights (e.g., 500g, 1kg) with different prices under the same product. Is this approach acceptable?

## Proposed Changes

---

### UI & Layout Enhancements
Enhance the user interface to fix scrolling issues, accidental closes, and add new views.

#### [NEW] `Ecommerce/src/components/ScrollToTop.jsx`
- Create a component that listens to route changes and automatically scrolls the window to the top. This will be added inside `App.jsx`.

#### [MODIFY] `Ecommerce/src/App.jsx`
- Integrate `<ScrollToTop />`.

#### [MODIFY] `Ecommerce/src/pages/AdminProduct.jsx`
- **Modal Stability:** Update the modal backdrop `onClick` to only close if the target is exactly the backdrop, preventing unintended closures when clicking near the form.
- **Scrollable Overlays:** Ensure the modal form has `max-h-[90vh]` and `overflow-y-auto` so it scrolls properly on small mobile screens.
- **List View Toggle:** Add a toggle button (Grid/List). Implement a compact single-line table view for products to allow quick scanning.
- **Dynamic Categories & Names:** Convert the Category and Name text inputs into `<datalist>` or a custom autocomplete. We will extract unique categories and existing product names from the `products` state to populate suggestions.
- **Optional Image:** Make the Image URL field optional.
- **Variant Support:** Add UI to dynamically add/remove "Sizes/Rates" (variants) for a product.

---

### Form Controls & UX
Improve data entry speed and accuracy.

#### [MODIFY] `Ecommerce/src/pages/AdminUser.jsx`
- **Zero Ignore:** Update input `onFocus` handlers to clear the input if the value is `0` (so admins don't have to backspace). On blur, if left empty, default back to `0`.
- **Increment/Decrement (+/-):** Add small `+` and `-` button controls next to `dueAmount` and `totalPrice` in the purchase/due forms to quickly adjust amounts.
- **User Search:** Add a search bar above the user list to filter users by name or phone number.
- **Guest/Unregistered Phone:** When an admin adds a user, make `firstName` optional or auto-fill as "Guest" if only a phone number is provided.

---

### Backend Updates
Update models and routes to support variants, caching, and token expiration.

#### [MODIFY] `Backend/models/Product.js`
- Add a `variants` field: `[{ name: String, selling_Price: priceSchema, buying_Price: priceSchema, stock: stockSchema }]` to handle smaller and bigger products seamlessly.

#### [MODIFY] `Backend/index.js`
- Implement `node-cache` middleware for the `/admin/products` and `/admin/users` routes to significantly improve loading speed (cache invalidated on POST/PUT/DELETE).

#### [MODIFY] `Ecommerce/src/utils/api.js`
- **Token Expiry Fix:** Ensure the Axios interceptor correctly handles 401/403 responses. If the token refresh fails, it must explicitly clear local storage and redirect to `/admin/login` using `window.location.href`.

---

### Payments Integration
Basic support for QR codes and audio feedback.

#### [MODIFY] `Ecommerce/src/pages/PaymentPage.jsx` (or relevant checkout/admin flow)
- Integrate a UPI QR code generator (using `qrcode.react`) that generates a scanable code containing the payment amount.
- Add browser Text-to-Speech (TTS) integration that says "Payment of [amount] rupees received" upon manual admin confirmation (or API webhook if provided).

## Verification Plan

### Automated Tests
- No existing automated test suite detected. We will rely on manual verification.

### Manual Verification
1. **Forms:** Verify that clicking into a `0` value clears it. Test adding/removing dues using the new `+`/`-` buttons.
2. **Categories:** Type a new category and ensure it saves; type an existing category and ensure the autocomplete works.
3. **Scrolling:** Verify the "Add Product" modal is fully scrollable on a simulated mobile screen and does not close when clicking inside the form.
4. **Auth Expiry:** Manually delete the `refreshToken` cookie and verify that the app kicks the admin out to the login screen instead of showing empty lists.
5. **Caching:** Verify network request times for products are significantly reduced on subsequent reloads.
