🚀 QUICK START - GET IT RUNNING IN 2 MINUTES

═══════════════════════════════════════════════════════════════════

STEP 1: MongoDB Setup (1 minute)
─────────────────────────────────────────────────────────────────

Open MongoDB shell or Compass and run:

    db.restaurants.createIndex({ location: "2dsphere" })

Verify it worked:

    db.restaurants.getIndexes()

You should see: { "key": { "location": "2dsphere" } }

═══════════════════════════════════════════════════════════════════

STEP 2: Start the Application (1 minute)
─────────────────────────────────────────────────────────────────

Terminal 1 - Start Backend:
    cd server
    npm start

Terminal 2 - Start Frontend:
    cd client
    npm run dev

Wait for both to show "running on..." messages.

═══════════════════════════════════════════════════════════════════

STEP 3: Test the Feature (1 minute)
─────────────────────────────────────────────────────────────────

1. Open browser: http://localhost:5173
2. Click: "Find Nearby Food" button on home page
3. Browser prompt: "Allow location access?" → Click "Allow"
4. See: Nearby restaurants with distances!
5. Verify: Sorted by distance (nearest first)

✅ DONE! Feature is working!

═══════════════════════════════════════════════════════════════════

WHAT JUST HAPPENED?
─────────────────────────────────────────────────────────────────

1. Browser detected your location
2. Frontend cached it (5 min expiry)
3. Sent coordinates to backend
4. MongoDB found nearby restaurants using 2dsphere index
5. Results sorted by distance
6. Displayed with distance badges

User sees: "📍 0.5 km", "📍 1.2 km", etc.

═══════════════════════════════════════════════════════════════════

THAT'S IT! ✨

Your app now has live location detection like Swiggy/Zomato!

For more details, read: LOCATION_FEATURE.md

═══════════════════════════════════════════════════════════════════
