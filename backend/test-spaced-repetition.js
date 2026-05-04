/**
 * Test script for Spaced Repetition implementation
 * Run: node test-spaced-repetition.js
 */

const {
  calculateNextReview,
  getQualityFromRating,
  getStatus,
  calculateXpReward,
  getDailyQuota,
} = require('./services/spacedRepetition');

console.log('🧪 Testing Spaced Repetition Service\n');

// Test 1: calculateNextReview
console.log('Test 1: calculateNextReview()');
console.log('─────────────────────────────────');

// First review - quality 4 (good)
const review1 = calculateNextReview(4, 2.5, 1, 0);
console.log('First review (quality=4):', review1);
console.log('Expected: interval=1, repetitions=1\n');

// Second review - quality 4 (good)
const review2 = calculateNextReview(4, review1.nextEfFactor, review1.nextInterval, review1.nextRepetitions);
console.log('Second review (quality=4):', review2);
console.log('Expected: interval=6, repetitions=2\n');

// Third review - quality 5 (easy)
const review3 = calculateNextReview(5, review2.nextEfFactor, review2.nextInterval, review2.nextRepetitions);
console.log('Third review (quality=5):', review3);
console.log('Expected: interval=15-18 days, repetitions=3\n');

// Failed review - quality 2 (hard)
const reviewFail = calculateNextReview(2, review3.nextEfFactor, review3.nextInterval, review3.nextRepetitions);
console.log('Failed review (quality=2):', reviewFail);
console.log('Expected: interval=1, repetitions=0 (reset)\n');

// Test 2: getQualityFromRating
console.log('\nTest 2: getQualityFromRating()');
console.log('─────────────────────────────────');
console.log('forgot:', getQualityFromRating('forgot'), '(expected: 1)');
console.log('hard:', getQualityFromRating('hard'), '(expected: 2)');
console.log('good:', getQualityFromRating('good'), '(expected: 4)');
console.log('easy:', getQualityFromRating('easy'), '(expected: 5)');

// Test 3: getStatus
console.log('\nTest 3: getStatus()');
console.log('─────────────────────────────────');
console.log('New word (rep=0, q=2):', getStatus(0, 2), '(expected: in-progress)');
console.log('Learning (rep=1, q=4):', getStatus(1, 4), '(expected: in-progress)');
console.log('Completed (rep=2, q=4):', getStatus(2, 4), '(expected: completed)');
console.log('Mastered (rep=5, q=5):', getStatus(5, 5), '(expected: mastered)');

// Test 4: calculateXpReward
console.log('\nTest 4: calculateXpReward()');
console.log('─────────────────────────────────');
console.log('New word, quality=5:', calculateXpReward(5, 0, true), 'XP');
console.log('Review, quality=4, rep=2:', calculateXpReward(4, 2, false), 'XP');
console.log('Failed, quality=1:', calculateXpReward(1, 0, false), 'XP');
console.log('Perfect, quality=5, rep=5:', calculateXpReward(5, 5, false), 'XP');

// Test 5: getDailyQuota
console.log('\nTest 5: getDailyQuota()');
console.log('─────────────────────────────────');
const levels = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];
levels.forEach(level => {
  const quota = getDailyQuota(level);
  console.log(`${level}:`, quota);
});

// Test 6: SM-2 Algorithm Progression
console.log('\n\nTest 6: SM-2 Algorithm Progression (Perfect Reviews)');
console.log('─────────────────────────────────────────────────────');
let ef = 2.5;
let interval = 1;
let reps = 0;

for (let i = 1; i <= 10; i++) {
  const result = calculateNextReview(5, ef, interval, reps);
  console.log(`Review ${i}: interval=${result.nextInterval} days, EF=${result.nextEfFactor}, reps=${result.nextRepetitions}`);
  ef = result.nextEfFactor;
  interval = result.nextInterval;
  reps = result.nextRepetitions;
}

// Test 7: SM-2 Algorithm with Failures
console.log('\n\nTest 7: SM-2 Algorithm with Failures');
console.log('─────────────────────────────────────');
ef = 2.5;
interval = 1;
reps = 0;

const qualities = [4, 4, 2, 4, 5, 3, 5, 5]; // Mixed performance
qualities.forEach((quality, i) => {
  const result = calculateNextReview(quality, ef, interval, reps);
  console.log(`Review ${i + 1} (q=${quality}): interval=${result.nextInterval} days, EF=${result.nextEfFactor.toFixed(2)}, reps=${result.nextRepetitions}`);
  ef = result.nextEfFactor;
  interval = result.nextInterval;
  reps = result.nextRepetitions;
});

console.log('\n✅ All tests completed!\n');
