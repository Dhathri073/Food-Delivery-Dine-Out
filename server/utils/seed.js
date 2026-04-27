require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Restaurant.deleteMany({});

  // Create users
  const customer = await User.create({ name: 'Alice Customer', email: 'customer@demo.com', password: 'password123', role: 'customer' });
  const owner = await User.create({ name: 'Bob Owner', email: 'owner@demo.com', password: 'password123', role: 'restaurant_owner' });
  const courier = await User.create({ name: 'Charlie Courier', email: 'courier@demo.com', password: 'password123', role: 'courier' });

  // Create restaurants (NYC coordinates)
  await Restaurant.create([
    {
      name: 'Bella Italia',
      owner: owner._id,
      description: 'Authentic Italian cuisine with fresh ingredients',
      cuisine: ['Italian', 'Pizza', 'Pasta'],
      address: '123 Main St, New York, NY',
      location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
      rating: 4.5, ratingCount: 120,
      deliveryTime: 25, deliveryFee: 2.99, minOrder: 15,
      menuItems: [
        { name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', price: 14.99, category: 'Pizza', isAvailable: true },
        { name: 'Spaghetti Carbonara', description: 'Creamy pasta with pancetta', price: 16.99, category: 'Pasta', isAvailable: true },
        { name: 'Tiramisu', description: 'Classic Italian dessert', price: 7.99, category: 'Dessert', isAvailable: true },
        { name: 'Caesar Salad', description: 'Fresh romaine with caesar dressing', price: 10.99, category: 'Salad', isAvailable: true }
      ]
    },
    {
      name: 'Spice Garden',
      owner: owner._id,
      description: 'Authentic Indian spicy cuisine',
      cuisine: ['Indian', 'Curry', 'Vegetarian'],
      address: '456 Broadway, New York, NY',
      location: { type: 'Point', coordinates: [-73.9901, 40.7505] },
      rating: 4.3, ratingCount: 89,
      deliveryTime: 35, deliveryFee: 1.99, minOrder: 12,
      menuItems: [
        { name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken', price: 15.99, category: 'Curry', isAvailable: true },
        { name: 'Paneer Tikka', description: 'Grilled spicy cottage cheese', price: 13.99, category: 'Vegetarian', isAvailable: true },
        { name: 'Garlic Naan', description: 'Freshly baked garlic bread', price: 3.99, category: 'Bread', isAvailable: true },
        { name: 'Mango Lassi', description: 'Sweet mango yogurt drink', price: 4.99, category: 'Drinks', isAvailable: true }
      ]
    },
    {
      name: 'Burger Barn',
      owner: owner._id,
      description: 'Juicy burgers and crispy fries',
      cuisine: ['American', 'Burgers', 'Fast Food'],
      address: '789 5th Ave, New York, NY',
      location: { type: 'Point', coordinates: [-73.9772, 40.7614] },
      rating: 4.1, ratingCount: 200,
      deliveryTime: 20, deliveryFee: 0.99, minOrder: 8,
      menuItems: [
        { name: 'Classic Cheeseburger', description: 'Beef patty with cheddar and veggies', price: 11.99, category: 'Burgers', isAvailable: true },
        { name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce with crispy bacon', price: 13.99, category: 'Burgers', isAvailable: true },
        { name: 'Crispy Fries', description: 'Golden crispy french fries', price: 4.99, category: 'Sides', isAvailable: true },
        { name: 'Chocolate Milkshake', description: 'Thick creamy chocolate shake', price: 5.99, category: 'Drinks', isAvailable: true }
      ]
    }
  ]);

  console.log('Seed data created:');
  console.log('  customer@demo.com / password123');
  console.log('  owner@demo.com / password123');
  console.log('  courier@demo.com / password123');
  await mongoose.disconnect();
};

seed().catch(console.error);
