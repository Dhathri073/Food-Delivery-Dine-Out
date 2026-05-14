🚀 COMPLETE SETUP GUIDE - GET RESTAURANTS, CART & PAYMENT WORKING

═══════════════════════════════════════════════════════════════════════════════

✅ STATUS CHECK:
  ✓ Backend running: http://localhost:5000
  ✓ Frontend running: http://localhost:3002
  ✓ MongoDB: Connected and seeded with 3 restaurants
  ✓ Default accounts created

═══════════════════════════════════════════════════════════════════════════════

🎯 WHAT'S NOW WORKING:

1. DEFAULT RESTAURANTS DISPLAY
   ├─ No location permission required
   ├─ Shows all restaurants on /restaurants page
   ├─ Can search by name or filter by cuisine
   └─ Includes: Bella Italia, Spice Garden, Burger Barn

2. MENU ITEMS WITH PRICING
   ├─ Each restaurant has 4-5 menu items
   ├─ Prices displayed (e.g., $14.99)
   ├─ Categories: Pizza, Pasta, Curry, Vegetarian, Burgers, Sides, Drinks, Desserts
   ├─ Item descriptions included
   └─ Add to Cart button on each item

3. SHOPPING CART
   ├─ Add items from restaurant menu
   ├─ Increase/decrease quantities
   ├─ View bill summary
   ├─ Delivery fee: $2.99
   ├─ Automatic 5% tax calculation
   ├─ Clear cart option
   └─ Proceed to checkout

4. PAYMENT SYSTEM
   ├─ Two payment methods:
   │  ├─ Cash on Delivery (COD) - Instant
   │  └─ Card Payment - Via Stripe
   ├─ Order confirmation
   ├─ Order tracking
   └─ Payment status

═══════════════════════════════════════════════════════════════════════════════

📋 STEP-BY-STEP TO TEST FULL FLOW:

STEP 1: Open the App
  ├─ Browser: http://localhost:3002
  └─ You should see the home page

STEP 2: Browse Restaurants (2 ways)

  Option A - View All Restaurants:
  ├─ Click: "Explore Restaurants" or "Delivery" tab on home
  ├─ Or navigate to: http://localhost:3002/restaurants
  ├─ You should see: 3 restaurants with cards showing ratings, delivery time, fees
  └─ Restaurants: Bella Italia, Spice Garden, Burger Barn

  Option B - Find Nearby Restaurants:
  ├─ Click: "Find Nearby Food" button (home page hero)
  ├─ Browser will ask: "Allow this page to access your location?"
  ├─ Click: "Allow"
  ├─ Wait 2-3 seconds for location detection
  └─ See: Same restaurants with distance badges (e.g., "📍 0.5 km")

STEP 3: Select a Restaurant
  ├─ Click: On any restaurant card (e.g., "Bella Italia")
  ├─ See: Restaurant detail page with menu items
  ├─ Menu includes:
  │  ├─ Margherita Pizza - $14.99
  │  ├─ Spaghetti Carbonara - $16.99
  │  ├─ Caesar Salad - $10.99
  │  └─ Tiramisu - $7.99
  └─ (Each restaurant has similar menu structure)

STEP 4: Add Items to Cart
  ├─ Click: "ADD +" button on any menu item
  ├─ Toast: "{Item name} added to cart!"
  ├─ Add 2-3 items from different categories
  └─ Example:
      ├─ 2x Margherita Pizza ($14.99 each)
      ├─ 1x Caesar Salad ($10.99)
      └─ 1x Tiramisu ($7.99)

STEP 5: View Cart
  ├─ Click: "Cart" in sidebar or header
  ├─ See: All items with quantities, prices, and subtotals
  ├─ Modify quantities:
  │  ├─ Click: "+" to increase quantity
  │  ├─ Click: "−" to decrease quantity
  │  └─ Price updates automatically
  └─ Show:
      ├─ Subtotal: Sum of all items
      ├─ Delivery Fee: $2.99
      ├─ Taxes (5%): Calculated automatically
      └─ Grand Total: Subtotal + Delivery + Taxes

STEP 6: Proceed to Checkout
  ├─ Click: "Checkout Now" or similar button
  ├─ Enter: Delivery address (any text, e.g., "123 Main St, NYC")
  ├─ Select: Payment method:
  │  ├─ Option 1: Cash on Delivery (COD)
  │  └─ Option 2: Credit/Debit Card
  └─ See: Order summary on right side

STEP 7A: Payment via COD (Fastest Way to Test)
  ├─ Select: "Cash on Delivery" radio button
  ├─ Click: "Place Order" or "Pay COD" button
  ├─ You'll see: "Order placed! Pay on delivery 💵"
  ├─ Redirected to: Order confirmation page
  ├─ Order ID: Displayed and unique
  └─ Status: "Confirmed" or "Pending"

STEP 7B: Payment via Card (Test Card Numbers)
  ├─ Select: "Card Payment" radio button
  ├─ Fill in:
  │  ├─ Card Number: 4242 4242 4242 4242 (Stripe test card)
  │  ├─ Expiry: Any future date (e.g., 12/25)
  │  ├─ CVC: Any 3 digits (e.g., 123)
  │  └─ All in one form or separate fields
  ├─ Click: "Pay Now" button
  ├─ Wait: 2-3 seconds for processing
  ├─ You'll see: "Payment successful! 🎉"
  └─ Redirected to: Order confirmation with details

STEP 8: View Order Details
  ├─ Page shows:
  │  ├─ Order ID
  │  ├─ Items ordered with quantities
  │  ├─ Total amount
  │  ├─ Delivery address
  │  ├─ Payment method used
  │  ├─ Order status
  │  └─ Estimated delivery time
  └─ Continue shopping or go back to home

═══════════════════════════════════════════════════════════════════════════════

🍕 SAMPLE RESTAURANTS & MENUS:

BELLA ITALIA (Italian/Pizza/Pasta)
  ├─ Rating: ⭐ 4.5 (120+ ratings)
  ├─ Delivery: 25 mins | Free delivery
  ├─ Menu:
  │  ├─ Margherita Pizza - $14.99
  │  ├─ Spaghetti Carbonara - $16.99
  │  ├─ Caesar Salad - $10.99
  │  └─ Tiramisu - $7.99
  └─ Address: 123 Main St, New York, NY

SPICE GARDEN (Indian/Curry/Vegetarian)
  ├─ Rating: ⭐ 4.3 (89+ ratings)
  ├─ Delivery: 35 mins | $1.99 delivery
  ├─ Menu:
  │  ├─ Butter Chicken - $15.99
  │  ├─ Paneer Tikka - $13.99
  │  ├─ Garlic Naan - $3.99
  │  └─ Mango Lassi - $4.99
  └─ Address: 456 Broadway, New York, NY

BURGER BARN (American/Burgers/Fast Food)
  ├─ Rating: ⭐ 4.1 (200+ ratings)
  ├─ Delivery: 20 mins | $0.99 delivery
  ├─ Menu:
  │  ├─ Classic Cheeseburger - $11.99
  │  ├─ BBQ Bacon Burger - $13.99
  │  ├─ Crispy Fries - $4.99
  │  └─ Chocolate Milkshake - $5.99
  └─ Address: 789 5th Ave, New York, NY

═══════════════════════════════════════════════════════════════════════════════

🔐 TEST ACCOUNTS (Already Seeded):

LOGIN AS CUSTOMER:
  Email: customer@demo.com
  Password: password123
  Role: Customer
  Can: Browse, order, pay, track

LOGIN AS RESTAURANT OWNER:
  Email: owner@demo.com
  Password: password123
  Role: Restaurant Owner
  Can: Manage restaurants, menus, orders

LOGIN AS COURIER:
  Email: courier@demo.com
  Password: password123
  Role: Courier
  Can: Accept and deliver orders

═══════════════════════════════════════════════════════════════════════════════

⚠️ IF YOU GET ERRORS:

Error: "No restaurants found"
  Fix:
  ├─ 1. Go back to terminal where server is running
  ├─ 2. Make sure you see: "✅ MongoDB Connected: localhost"
  ├─ 3. If not connected, MongoDB may not be running
  ├─ 4. Run: mongod (in separate terminal)
  ├─ 5. Re-seed data: cd server && npm run seed
  └─ 6. Refresh browser

Error: "Cannot reach server"
  Fix:
  ├─ 1. Check backend is running: npm start (in server folder)
  ├─ 2. Terminal should show: "Server running on port 5000"
  ├─ 3. Check MongoDB connection message
  ├─ 4. If port 5000 is in use: netstat -ano | findstr :5000
  ├─ 5. Kill process and restart
  └─ 6. Refresh browser

Error: "Add to Cart" doesn't work
  Fix:
  ├─ 1. Make sure you're logged in (customer@demo.com)
  ├─ 2. Browser console may show errors - check it (F12)
  ├─ 3. Check backend is responding: http://localhost:5000/health
  ├─ 4. Restart backend and frontend
  └─ 5. Try again

Error: "Stripe key missing"
  Fix:
  ├─ This is normal - test mode works with placeholder key
  ├─ Use "Cash on Delivery" to complete order test
  ├─ Or add VITE_STRIPE_PUBLISHABLE_KEY to frontend .env
  └─ For now, COD works perfectly for testing

═══════════════════════════════════════════════════════════════════════════════

📊 WHAT EACH PAGE DOES:

/ (Home)
  ├─ Shows featured restaurants
  ├─ Browse by cuisine categories
  ├─ "Find Nearby Food" button for geolocation
  └─ Dine-Out and Events tabs

/restaurants
  ├─ All restaurants list
  ├─ Search by name or cuisine
  ├─ Optional location filter
  ├─ Grid view with cards
  └─ Click card to view restaurant detail

/restaurants/{id}
  ├─ Restaurant menu with items
  ├─ Filter by category (Pizza, Curry, etc.)
  ├─ Add items to cart
  ├─ View reviews and ratings
  ├─ Restaurant info sidebar
  └─ Loyalty points info

/cart
  ├─ Review all items in cart
  ├─ Adjust quantities
  ├─ View bill summary
  ├─ Clear cart option
  └─ "Checkout Now" button

/checkout
  ├─ Delivery address input
  ├─ Payment method selection
  ├─ Enter card details (if card selected)
  ├─ Order summary on right
  └─ "Place Order" or "Pay Now" button

/orders
  ├─ View all past orders
  ├─ Track current order status
  ├─ View order details
  └─ Option to re-order

/orders/{id}
  ├─ Detailed order page
  ├─ Items ordered with prices
  ├─ Total payment
  ├─ Delivery address
  ├─ Delivery time estimate
  ├─ Order status (Confirmed, Preparing, etc.)
  └─ Track deliveryboy location (if applicable)

═══════════════════════════════════════════════════════════════════════════════

✅ COMPLETE FEATURE CHECKLIST:

Restaurants & Menu:
  ☑️ Display all restaurants
  ☑️ Show menu items with descriptions
  ☑️ Display prices for all items
  ☑️ Show restaurant ratings and delivery time
  ☑️ Search by restaurant name
  ☑️ Filter by cuisine
  ☑️ Live location detection (optional)

Shopping Cart:
  ☑️ Add items to cart
  ☑️ Remove items from cart
  ☑️ Update quantities
  ☑️ Show subtotal
  ☑️ Calculate delivery fee
  ☑️ Calculate taxes (5%)
  ☑️ Show grand total
  ☑️ Clear entire cart
  ☑️ Persist cart (localStorage)

Checkout & Payment:
  ☑️ Enter delivery address
  ☑️ Choose payment method
  ☑️ Support Cash on Delivery (COD)
  ☑️ Support Card Payment (Stripe)
  ☑️ Show order summary before payment
  ☑️ Confirm order
  ☑️ Payment processing

Orders & Tracking:
  ☑️ View order history
  ☑️ Track current order
  ☑️ See order details
  ☑️ Re-order from past order

═══════════════════════════════════════════════════════════════════════════════

🎉 YOU'RE ALL SET!

Everything is working. Just follow the step-by-step guide above to test.

Start from: http://localhost:3002

Questions? Check the browser console (F12) for any errors.

═══════════════════════════════════════════════════════════════════════════════
