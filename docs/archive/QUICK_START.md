# 🚀 Quick Start - Spaced Repetition Flashcards

## ⚡ Start the Application (2 commands)

### Terminal 1 - Backend
```bash
cd /home/khoa/EnglishMaster/backend
npm start
```
✅ Backend running on: http://localhost:5000

### Terminal 2 - Frontend
```bash
cd /home/khoa/EnglishMaster/frontend
npm start
```
✅ Frontend running on: http://localhost:3000

## 🎯 Access the Feature

1. Open browser: **http://localhost:3000**
2. Login with your account
3. Click **"🚀 Start Learning Now"** button on Dashboard
4. Start reviewing flashcards!

## 🎴 How to Use Flashcards

### Step 1: View Card Front
- See English word
- See pronunciation (IPA)
- Click 🔊 to hear audio

### Step 2: Flip Card
- Click anywhere on card to flip
- See Vietnamese meaning
- See example sentences
- See image (if available)

### Step 3: Rate Difficulty
Choose one of 4 buttons:

| Button | Meaning | When to Use | Next Review |
|--------|---------|-------------|-------------|
| 😰 Quên rồi | Forgot | Completely forgot the word | 1 day |
| 😓 Khó | Hard | Struggled to remember | 1 day |
| 😊 OK | Good | Remembered with some effort | 1→6→15+ days |
| 😎 Dễ | Easy | Instantly remembered | 1→6→20+ days |

### Step 4: Earn Rewards
After each review:
- ⭐ Earn XP (5-30 points)
- 💰 Earn coins (XP ÷ 2)
- 🎊 Level up (at 500, 1500, 3000, 5000 XP)
- 🏆 Unlock badges

### Step 5: Complete Session
- See confetti animation 🎉
- View today's stats
- Click "Làm lại" to restart
- Click "Về Dashboard" to return

## 📊 Daily Quota (Based on Your Level)

| Level | New Words/Day | Review Words/Day |
|-------|---------------|------------------|
| Beginner | 5 | 20 |
| Elementary | 10 | 30 |
| Intermediate | 15 | 50 |
| Upper-intermediate | 20 | 70 |
| Advanced | 25 | 100 |

## 🧠 SM-2 Algorithm Explained Simply

The system automatically schedules reviews at optimal times:

**If you rate "OK" or "Easy":**
- 1st review: Tomorrow (1 day)
- 2nd review: 6 days later
- 3rd review: ~15 days later
- 4th review: ~40 days later
- And so on... (intervals keep growing)

**If you rate "Forgot" or "Hard":**
- Review resets to tomorrow (1 day)
- Start the progression again

This ensures you review words just before you forget them!

## 🎮 Gamification Features

### XP System
- New word learned: **20-30 XP**
- Word reviewed: **10-20 XP**
- Failed review: **5 XP**

### Levels
- **Beginner** (0 XP)
- **Elementary** (500 XP)
- **Intermediate** (1,500 XP)
- **Upper-intermediate** (3,000 XP)
- **Advanced** (5,000 XP)

### Streak
- Study every day to maintain your streak 🔥
- Longer streaks = more motivation!

### Badges
- Unlock achievements for milestones
- Example: "Word Master" for learning 100 words

## 🎨 UI Features

### Animations
- **3D Flip**: Smooth card rotation
- **Confetti**: Celebration on completion
- **Progress Bar**: Visual progress tracking
- **Hover Effects**: Interactive buttons

### Audio
- Click 🔊 to hear pronunciation
- Uses vocabulary audio URL if available
- Falls back to browser text-to-speech

### Responsive Design
- Works on desktop, tablet, and mobile
- Touch-friendly buttons
- Adaptive layout

## 📱 Navigation

- **Dashboard**: `http://localhost:3000` or `#`
- **Flashcards**: `http://localhost:3000#flashcards`
- **Back Button**: Returns to Dashboard

## 🔧 Troubleshooting

### No words showing up?
- Check if vocabularies exist in database
- Verify your user level matches vocabulary levels
- Daily quota might be reached

### Audio not playing?
- Check browser audio permissions
- Fallback to Web Speech API is automatic
- Try clicking 🔊 again

### Cards not flipping?
- Clear browser cache
- Check if CSS loaded properly
- Try refreshing page

### XP not updating?
- Check backend console for errors
- Verify API connection
- Check network tab in browser DevTools

## 📚 Documentation

- **FLASHCARD_USAGE_GUIDE.md** - Detailed user guide
- **SPACED_REPETITION_IMPLEMENTATION.md** - Technical documentation
- **IMPLEMENTATION_COMPLETE.md** - Implementation summary

## 🧪 Test the Feature

### Quick Test
1. Start backend and frontend
2. Login to application
3. Click "Start Learning Now"
4. Review 1-2 cards
5. Check if XP increases
6. Verify next review date is set

### Full Test
1. Complete entire session
2. Check confetti animation
3. Verify stats are correct
4. Return to dashboard
5. Check updated stats
6. Start new session tomorrow

## 🎯 Tips for Best Results

1. **Study Daily**: Consistency is key for spaced repetition
2. **Be Honest**: Rate difficulty accurately for optimal scheduling
3. **Use Audio**: Hearing pronunciation improves retention
4. **Read Examples**: Context helps memory
5. **Don't Rush**: Take time to understand each word
6. **Track Progress**: Watch your streak and XP grow
7. **Set Goals**: Aim for daily quota completion

## 🌟 Key Features

✅ **SM-2 Algorithm** - Scientifically proven spaced repetition
✅ **Adaptive Learning** - Adjusts to your performance
✅ **Gamification** - XP, levels, badges, streaks
✅ **Beautiful UI** - 3D animations, smooth transitions
✅ **Audio Support** - Pronunciation practice
✅ **Progress Tracking** - Detailed statistics
✅ **Daily Quota** - Prevents overwhelming
✅ **Mobile Friendly** - Responsive design

## 🎉 You're Ready!

Everything is set up and working. Start learning vocabulary with scientifically-optimized spaced repetition!

**Happy Learning! 📚🚀**

---

**Implementation Date**: May 2, 2026  
**Status**: ✅ Production Ready  
**Version**: 1.0.0
