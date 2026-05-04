# 🚀 Quick Start - AI Conversation Feature

## ⚡ Get Started in 3 Steps

### Step 1: Configure OpenAI API Key

Edit the backend `.env` file:

```bash
cd /home/khoa/EnglishMaster/backend
nano .env
```

Update the OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1500
OPENAI_TEMPERATURE=0.7
```

### Step 2: Install Dependencies & Start Servers

**Terminal 1 - Backend:**
```bash
cd /home/khoa/EnglishMaster/backend
npm install openai multer
npm start
```
✅ Backend running on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd /home/khoa/EnglishMaster/frontend
npm install lucide-react
npm start
```
✅ Frontend running on: http://localhost:3000

### Step 3: Use the Feature

1. Open http://localhost:3000
2. Login with your account
3. Click **"🤖 Học với AI"** in the navigation menu
4. Select a scenario (e.g., "Daily Conversation")
5. Start chatting!

---

## 🎯 Quick Feature Overview

### 7 Conversation Scenarios
- 💬 **Daily Conversation** - Casual everyday chat
- 💼 **Job Interview** - Practice interview skills
- 🍽️ **Ordering Food** - Restaurant conversations
- ✈️ **Travel** - Hotel and travel situations
- 🛍️ **Shopping** - Shopping and retail
- 📊 **Business Meeting** - Professional meetings
- 👋 **Making Friends** - Social interactions

### Key Features
- ✅ **Text Chat** - Type messages to AI
- ✅ **Voice Input** - Record and transcribe speech
- ✅ **Grammar Correction** - Get instant feedback
- ✅ **Vocabulary Learning** - Learn new words
- ✅ **Suggested Responses** - Quick reply options
- ✅ **Score Tracking** - Monitor your progress
- ✅ **XP & Badges** - Earn rewards

---

## 💬 How to Use

### Starting a Conversation

1. **Choose Scenario**
   - Click on a scenario card
   - Optionally enter a topic (e.g., "technology", "sports")

2. **AI Greets You**
   - AI sends opening message
   - 3 suggested responses appear

### Chatting with AI

**Text Message:**
- Type in the input box
- Press Enter or click Send button

**Voice Message:**
- Click microphone button 🎤
- Speak your message
- Click again to stop
- Audio transcribed automatically

**Quick Replies:**
- Click suggested response buttons
- Instantly sends that message

### Learning Features

**Grammar Correction:**
- Orange box shows corrections
- Explains the error

**Vocabulary:**
- Click purple word pills
- Popup shows meaning and example

**Audio Playback:**
- Click 🔊 to hear AI message
- Practice pronunciation

**Progress Tracking:**
- Turn score (0-100) after each message
- XP earned displayed
- Level up notifications

### Ending Conversation

1. Click **"Kết thúc"** button
2. View scorecard:
   - Overall score
   - Total turns and duration
   - Common errors
   - XP earned (+50 bonus)
   - New badges
3. Choose:
   - **"Bắt đầu mới"** - Start new conversation
   - **"Về Dashboard"** - Return home

---

## 🎮 Navigation Menu

### Desktop
- Horizontal menu bar at top
- Click any menu item to navigate
- Active page highlighted with gradient

### Mobile
- Hamburger menu (☰) in top-right
- Bottom navigation bar (5 main items)
- Tap to navigate

### Menu Items
- 🏠 **Trang chủ** - Home dashboard
- 📚 **Từ vựng** - Vocabulary management
- 🔄 **Ôn tập** - Flashcard review
- 🤖 **Học với AI** - AI conversation
- 🎥 **Video** - Video lessons
- ✅ **Kiểm tra** - Exercises
- 👤 **Profile** - User profile

---

## 🎨 UI Tips

### Chat Interface
- **Blue bubbles** = Your messages (right side)
- **White bubbles** = AI messages (left side)
- **3 dots** = AI is typing
- **Red mic** = Recording in progress

### Corrections
- **Orange box** = Grammar correction
- Hover for detailed explanation

### Vocabulary
- **Purple pills** = Clickable words
- Click to see definition

### Suggested Responses
- **Gray buttons** = Quick reply options
- Click to send instantly

---

## 🐛 Common Issues

### "OpenAI API rate limit exceeded"
**Solution**: Wait a few minutes and try again. OpenAI has usage limits.

### "Microphone access denied"
**Solution**: 
1. Check browser permissions
2. Allow microphone when prompted
3. Try using HTTPS

### "Failed to transcribe audio"
**Solution**:
1. Check audio format (webm, mp3, wav)
2. Ensure file size < 10MB
3. Speak clearly into microphone

### AI not responding
**Solution**:
1. Check OpenAI API key is correct
2. Verify backend is running
3. Check browser console for errors

---

## 📊 XP & Rewards

### XP Earning
- **Per Turn**: 10 XP
- **High Quality (≥80)**: +5 bonus XP
- **Completion**: +50 XP

### Level Progression
- **Beginner**: 0 XP
- **Elementary**: 500 XP
- **Intermediate**: 1,500 XP
- **Upper-intermediate**: 3,000 XP
- **Advanced**: 5,000 XP

### Badges
- Earned at conversation milestones
- Displayed in scorecard
- Adds to your profile

---

## 🔧 Advanced Tips

### Better Conversations
1. **Be specific** - Give detailed responses
2. **Ask questions** - Keep conversation flowing
3. **Use new vocabulary** - Practice what you learn
4. **Speak naturally** - Don't worry about mistakes

### Voice Recording
1. **Speak clearly** - Enunciate words
2. **Reduce noise** - Find quiet environment
3. **Short messages** - 1-2 sentences at a time
4. **Check transcription** - Verify accuracy

### Maximize Learning
1. **Review corrections** - Understand mistakes
2. **Save vocabulary** - Note new words
3. **Practice regularly** - Daily conversations
4. **Try all scenarios** - Diverse practice

---

## 📱 Mobile Usage

### Best Practices
- Use bottom navigation for quick access
- Tap and hold to record voice
- Swipe to dismiss popups
- Rotate for better view

### Performance
- Close other apps for smooth recording
- Use WiFi for faster responses
- Clear cache if slow

---

## 🎯 Example Conversation

**User**: "Hello! How are you?"

**AI**: "Hello! I'm doing great, thank you for asking! How about you? How has your day been?"

**Correction**: None (perfect!)

**Vocabulary**: 
- "doing great" - feeling very good

**Suggested Responses**:
- "I'm fine, thank you!"
- "I'm having a good day."
- "Not bad, thanks for asking."

**Score**: 95/100 | +15 XP

---

## ✅ Quick Checklist

Before starting:
- [ ] OpenAI API key configured
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Logged into the app
- [ ] Microphone permissions granted (for voice)

During conversation:
- [ ] Read AI messages carefully
- [ ] Check corrections
- [ ] Learn new vocabulary
- [ ] Track your score
- [ ] Use suggested responses

After conversation:
- [ ] Review scorecard
- [ ] Note common errors
- [ ] Celebrate XP earned
- [ ] Start new conversation or return home

---

## 🎉 You're Ready!

The AI Conversation feature is fully set up and ready to use. Start practicing English with AI today!

**Happy Learning! 🚀📚**

---

**Quick Links**:
- Full Documentation: `AI_CONVERSATION_IMPLEMENTATION.md`
- Troubleshooting: See "Common Issues" section above
- API Reference: See full documentation

**Version**: 1.0.0  
**Last Updated**: May 2, 2026
