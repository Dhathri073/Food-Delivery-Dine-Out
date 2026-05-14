/**
 * MongoDB Geospatial Setup Instructions
 * 
 * This file documents the setup required for the geolocation feature to work correctly.
 * Run these commands in MongoDB to ensure proper indexing.
 */

// ========================================
// 1. CREATE 2DSPHERE INDEX ON RESTAURANT
// ========================================
// In MongoDB shell or Compass:

db.restaurants.createIndex({ location: "2dsphere" })

// Verify index was created:
db.restaurants.getIndexes()

// Expected output should include:
// {
//   "v": 2,
//   "key": { "location": "2dsphere" },
//   "name": "location_2dsphere"
// }

// ========================================
// 2. VERIFY EXISTING DOCUMENTS HAVE LOCATION DATA
// ========================================

// Check restaurants with location data:
db.restaurants.find({ location: { $exists: true } }).count()

// View sample restaurant with location:
db.restaurants.findOne({ location: { $exists: true } })

// Sample output should look like:
// {
//   "_id": ObjectId("..."),
//   "name": "Bella Italia",
//   "location": {
//     "type": "Point",
//     "coordinates": [-73.9857, 40.7484]  // [longitude, latitude]
//   },
//   ...
// }

// ========================================
// 3. FIX EXISTING RESTAURANTS (If needed)
// ========================================

// If restaurants don't have location data, update them:
db.restaurants.updateMany(
  { location: { $exists: false } },
  [{
    $set: {
      location: {
        type: "Point",
        coordinates: [-73.9857, 40.7484]  // Default to NYC coordinates
      }
    }
  }]
)

// ========================================
// 4. TEST GEOSPATIAL QUERY
// ========================================

// Find restaurants within 5km of coordinates:
db.restaurants.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [-73.9857, 40.7484] },
      distanceField: "distance",
      maxDistance: 5000,  // 5 km in meters
      spherical: true
    }
  }
])

// ========================================
// 5. ENVIRONMENT CONFIGURATION
// ========================================

// For local development (localhost):
// - Geolocation API requires HTTPS or localhost
// - http://localhost:3000 works fine
// - http://localhost:5000 works fine

// For production:
// - Ensure HTTPS is enabled
// - Browser will prompt for location permission
// - Location service must be accessible via HTTPS

// ========================================
// 6. TROUBLESHOOTING
// ========================================

// If geospatial queries return empty results:
// 1. Verify 2dsphere index exists: db.restaurants.getIndexes()
// 2. Verify documents have location field: db.restaurants.find().pretty()
// 3. Check coordinates are in [longitude, latitude] format (not reversed)
// 4. Ensure maxDistance is in meters, not km

// If browser location permission doesn't work:
// 1. Check if running on HTTPS or localhost
// 2. Check browser privacy/security settings
// 3. Check if user has already blocked location access

// ========================================
// 7. GEOSPATIAL QUERY PERFORMANCE TIPS
// ========================================

// - 2dsphere index is required for $geoNear queries
// - Compound indexes: location + other fields for better performance
// - Example: db.restaurants.createIndex({ location: "2dsphere", cuisine: 1 })
// - For high-volume queries, consider sharding on coordinates

db.restaurants.createIndex({ location: "2dsphere", cuisine: 1 })
