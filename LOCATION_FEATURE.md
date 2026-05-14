# 🚀 Live Location Detection Feature - Integration Guide

## Overview
Your food delivery app now includes a complete **"Detect User Live Location"** feature that displays nearby restaurants within 5km radius, similar to Swiggy/Zomato.

## ✅ Feature Components

### Frontend
- **Geolocation Utilities** (`client/src/lib/geolocation.js`)
  - `requestLocation()` - Request user location with Promise API
  - `getCachedLocation()` - Get cached location from localStorage
  - `calculateDistance()` - Calculate distance between coordinates
  - `formatDistance()` - Format distance for UI display
  - `checkLocationPermission()` - Check permission status

- **Custom Hook** (`client/src/hooks/useLocation.js`)
  - `useLocation()` - React hook for geolocation management
  - Handles requesting, caching, and error states

- **Enhanced RestaurantList.jsx**
  - Integrates geolocation with caching
  - Shows location accuracy indicator
  - Handles permission denied gracefully
  - Falls back to profile location or all restaurants

- **Enhanced RestaurantCard.jsx**
  - Displays formatted distance (0.5 km, 250 m, etc.)
  - Shows distance accuracy

### Backend
- **Enhanced RestaurantController.js** (`server/controllers/restaurantController.js`)
  - `getNearby()` - Geospatial query using MongoDB $geoNear
  - Returns restaurants sorted by distance (nearest first)
  - Validates coordinates and parameters
  - Returns distance metadata

- **MongoDB 2dsphere Index** (`server/models/Restaurant.js`)
  - Already configured for geospatial queries
  - Supports efficient nearest-neighbor searches

## 🔧 Setup Instructions

### Step 1: Verify MongoDB 2dsphere Index
Run in MongoDB shell or Compass:
```javascript
// Create 2dsphere index
db.restaurants.createIndex({ location: "2dsphere" })

// Verify
db.restaurants.getIndexes()
```

### Step 2: Ensure Seed Data Has Locations
Check if restaurants have location data:
```javascript
db.restaurants.find({ location: { $exists: true } }).count()
```

If missing, update seed data with coordinates.

### Step 3: Frontend Dependencies (Already Installed)
Your project already includes:
- `react` - For React hooks
- `axios` - For API calls (wrapped in `api.js`)
- `@tanstack/react-query` - For data fetching

**No new npm packages needed!**

### Step 4: Backend Dependencies (Already Installed)
Your project already includes:
- `express` - API server
- `mongoose` - MongoDB ORM with $geoNear support
- `dotenv` - Environment variables

## 🎯 Usage

### For Users
1. Go to Home page
2. Click **"Find Nearby Food"** button
3. Browser will request location permission
4. Nearby restaurants appear automatically (within 5km)
5. Restaurants sorted by distance (nearest first)

### Alternative Flow
1. Use search to filter by cuisine
2. Click location button on restaurant listing page
3. Enable location if denied previously

## 📍 API Endpoints

### Get Nearby Restaurants
```
GET /api/restaurants/nearby?lat=40.7128&lng=-74.0060&radius=5000&limit=20&cuisine=Italian
```

**Parameters:**
- `lat` (required) - User latitude (-90 to 90)
- `lng` (required) - User longitude (-180 to 180)
- `radius` (optional) - Search radius in meters (default: 5000)
- `limit` (optional) - Max restaurants to return (default: 20)
- `cuisine` (optional) - Filter by cuisine type

**Response:**
```json
{
  "restaurants": [
    {
      "_id": "...",
      "name": "Bella Italia",
      "distance": 500,
      "rating": 4.5,
      "deliveryTime": 25,
      "deliveryFee": 2.99,
      ...
    }
  ],
  "count": 5,
  "meta": {
    "center": { "lat": 40.7128, "lng": -74.0060 },
    "radius": 5000,
    "accuracy": "meters"
  }
}
```

## 🧪 Testing

### Test on Localhost
```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend
cd client
npm run dev
```

Access: `http://localhost:5173`
- Geolocation API works on `localhost`
- Browser will ask for location permission

### Test on Production/HTTPS
```bash
# Ensure HTTPS is enabled on your deployment
# Geolocation API only works on:
# - HTTPS URLs
# - localhost (http://localhost)
```

### Manual Testing

**Test 1: Grant Location Permission**
1. Navigate to `/restaurants?near=1`
2. Click "Enable Location" when prompted
3. Browser should detect your location
4. Nearby restaurants should appear

**Test 2: Deny Location Permission**
1. Browser settings → Block location for this site
2. Navigate to `/restaurants?near=1`
3. Should show "Location access disabled" message
4. Users can retry or show all restaurants

**Test 3: Cached Location**
1. Grant location once
2. Location is cached for 5 minutes
3. Revisit within 5 minutes → instant results
4. After 5 minutes → request fresh location

**Test 4: Fallback to Profile Location**
1. Save location in user profile
2. Deny browser geolocation
3. System should use profile location
4. Show nearby restaurants from profile

**Test 5: Distance Accuracy**
1. Check if distance is displayed correctly
2. Verify sorting (nearest first)
3. Check distance formatting (0.5 km, 250 m, etc.)

## 📊 Distance Calculation

### MongoDB $geoNear
- Returns distance in **meters** from MongoDB
- Sorted by nearest first
- Uses spherical Earth model

### Frontend Display
- Converts meters to km/m format
- Examples:
  - 500m → "500 m"
  - 1500m → "1.5 km"
  - 5000m → "5.0 km"

### Formula (Client-side Haversine)
```javascript
// Haversine formula for accurate distance
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  // ... calculation ...
}
```

## 🔐 Privacy & Permissions

### Location Permission States
1. **Granted** - User allowed location access
2. **Denied** - User blocked location
3. **Prompt** - First time, asking permission
4. **Unavailable** - Geolocation not supported
5. **Profile** - Using saved profile location

### User Controls
- Users can re-enable location anytime
- Can switch between location and profile
- Can see all restaurants without location
- Location cached locally (5 minutes)

### Data Privacy
- Location is temporary (not saved)
- Only sent to backend for nearest restaurant query
- Cached in browser localStorage only
- No tracking or persistent storage

## 🌍 Environment Support

### Development
```
http://localhost:3000 ✅ Works
http://localhost:5000 ✅ Works
https://localhost:3443 ✅ Works
```

### Production
```
https://yourdomain.com ✅ Works
http://yourdomain.com ❌ Blocked (use HTTPS)
```

## 📱 Browser Support

| Browser | Geolocation | Notes |
|---------|------------|-------|
| Chrome | ✅ | Works on localhost & HTTPS |
| Firefox | ✅ | Works on localhost & HTTPS |
| Safari | ✅ | Works on localhost & HTTPS |
| Edge | ✅ | Works on localhost & HTTPS |
| IE11 | ❌ | Not supported |

## ⚠️ Troubleshooting

### Issue: "Location permission denied"
**Solution:**
1. Check browser settings
2. Go to Site Settings → Location
3. Change from "Block" to "Allow"
4. Refresh page and retry

### Issue: "Geolocation not supported"
**Solution:**
1. Use modern browser (Chrome, Firefox, Safari, Edge)
2. Ensure running on localhost or HTTPS
3. Check if browser geolocation is enabled globally

### Issue: "Nearby restaurants not found"
**Solution:**
1. Verify MongoDB 2dsphere index exists
2. Check if restaurants have location data
3. Increase search radius (currently 5km)
4. Check if restaurants are marked as isOpen: true

### Issue: "Incorrect distance values"
**Solution:**
1. Verify coordinates format: [longitude, latitude]
2. Check if coordinates are in valid range
3. Ensure 2dsphere index is properly created
4. Use $geoNear aggregation (not $near)

### Issue: "Slow geospatial queries"
**Solution:**
1. Add compound index: `location + cuisine`
2. Limit result set with `$limit`
3. Use appropriate `maxDistance`
4. Consider caching frequent queries

## 🚀 Performance Tips

1. **Caching** - Location cached for 5 minutes (configurable)
2. **Index** - 2dsphere index for O(log n) queries
3. **Limit** - Default 20 restaurants returned
4. **Radius** - Default 5km radius (5000m)

## 📝 Files Modified/Created

### Created Files
- `client/src/lib/geolocation.js` - Geolocation utilities
- `client/src/hooks/useLocation.js` - Custom React hook
- `server/config/GEOSPATIAL_SETUP.js` - Setup instructions
- `LOCATION_FEATURE.md` - This documentation

### Modified Files
- `client/src/pages/RestaurantList.jsx` - Enhanced with caching
- `client/src/components/RestaurantCard.jsx` - Better distance display
- `server/controllers/restaurantController.js` - Enhanced validation

### Unchanged Core Files
- `server/models/Restaurant.js` - Already has 2dsphere index ✅
- `server/routes/restaurants.js` - Already has /nearby route ✅
- `client/src/pages/Home.jsx` - Already has "Find Nearby Food" button ✅

## 🎓 Next Steps

1. **Test the feature** - Follow testing section above
2. **Deploy** - Ensure HTTPS on production
3. **Monitor** - Check location query performance
4. **Gather feedback** - User experience improvements
5. **Scale** - Add more seed data with varied locations

## 📞 Support

For issues or questions:
1. Check MongoDB 2dsphere index exists
2. Verify coordinates are [longitude, latitude]
3. Ensure running on localhost or HTTPS
4. Check browser console for errors
5. Review backend logs for API errors
