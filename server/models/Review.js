const mongoose = require('mongoose');

// Keywords that earn bonus points
const BONUS_KEYWORDS = [
  'delicious', 'amazing', 'excellent', 'fresh', 'hot', 'fast', 'friendly',
  'tasty', 'great', 'perfect', 'wonderful', 'crispy', 'juicy', 'flavorful',
  'spicy', 'sweet', 'savory', 'prompt', 'professional', 'clean'
];

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  reviewText: { type: String, required: true, minlength: 10 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  pointsEarned: { type: Number, default: 0 },
  wordCount: { type: Number, default: 0 },
  bonusKeywordsFound: [String]
}, { timestamps: true });

// Scoring logic: base points from word count + keyword bonuses
reviewSchema.pre('save', function (next) {
  const words = this.reviewText.trim().split(/\s+/);
  this.wordCount = words.length;

  // Base: 1 point per word, max 50
  let points = Math.min(this.wordCount, 50);

  // Bonus: 5 points per keyword found
  const lowerText = this.reviewText.toLowerCase();
  const found = BONUS_KEYWORDS.filter(kw => lowerText.includes(kw));
  this.bonusKeywordsFound = found;
  points += found.length * 5;

  // Rating bonus
  if (this.rating === 5) points += 10;
  else if (this.rating === 4) points += 5;

  this.pointsEarned = points;
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
module.exports.BONUS_KEYWORDS = BONUS_KEYWORDS;
