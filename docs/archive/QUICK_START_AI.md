# 🚀 Quick Start Guide - AI Conversation Feature

## ⚡ Get Started in 5 Minutes

### Step 1: Get Gemini API Key (2 minutes)

1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 2: Configure Backend (1 minute)

```bash
# Edit backend/.env
nano backend/.env

# Update this line:
GEMINI_API_KEY=paste_your_key_here

# Save and exit (Ctrl+X, Y, Enter)
```

### Step 3: Restart Backend (1 minute)

```bash
# Kill old processes
pkill -f "node server.js"

# Start backend
cd backend
npm run dev
```

### Step 4: Test It! (1 minute)

```bash
# Run automated test
cd backend
node test-ai-conversation.js
```

**Expected Output:**
```
✅ Login successful
✅ Conversation started
📝 First message: Hello! I'd love to chat...
💬 Sending message: "Hello! I'm interested in..."
✅ Message sent
🤖 AI Reply: That's great! AI is fascinating...
📚 Vocabulary: fascinating - extremely interesting
⭐ Turn Score: 85
🎯 XP Earned: 15
🏁 Ending conversation...
📊 SCORECARD:
  Overall Score: 82
  Total Turns: 10
✅ All tests passed!
```

### Step 5: Use in Browser

1. **Open:** http://localhost:3000
2. **Login:** john@example.com / password123
3. **Navigate:** Click "Học với AI"
4. **Select Scenario:** Choose any scenario (e.g., Daily Conversation)
5. **Start Chatting!** 🎉

---

## 🎯 What You Can Do

### Chat with AI
- Type messages and get instant feedback
- See grammar corrections in orange
- Learn new vocabulary (purple pills)
- Get turn scores (0-100)
- Earn XP for each message

### Use Voice
- Click microphone button 🎤
- Speak your message
- AI transcribes and responds
- See transcribed text

### Get Feedback
- Grammar errors with explanations
- Vocabulary suggestions
- Suggested responses (click to send)
- Turn-by-turn scoring

### View Progress
- End conversation to see scorecard
- Overall score
- Total turns and duration
- Common errors breakdown
- XP earned

---

## 📱 7 Scenarios Available

1. **💬 Daily Conversation** - Casual chat
2. **💼 Job Interview** - Practice interviews
3. **🍽️ Ordering Food** - Restaurant talk
4. **✈️ Travel** - Hotel & tourism
5. **🛍️ Shopping** - Retail conversations
6. **📊 Business Meeting** - Professional talk
7. **👋 Making Friends** - Social interactions

---

## 🎮 Gamification

- **10 XP** per conversation turn
- **+5 XP** bonus for scores ≥80
- **+50 XP** for completing conversation
- **Badges** for milestones
- **Level up** as you progress

---

## 🐛 Troubleshooting

### "API quota exceeded"
→ Get new API key from https://aistudio.google.com/app/apikey

### "Invalid API key"
→ Check GEMINI_API_KEY in backend/.env

### "Server not running"
→ Run: `cd backend && npm run dev`

### "Login failed"
→ Use: john@example.com / password123

### "Microphone not working"
→ Allow microphone permissions in browser

---

## 📚 Documentation

- **AI_FEATURE_COMPLETE.md** - Complete overview
- **AI_CONVERSATION_GUIDE.md** - Detailed guide
- **AI_IMPLEMENTATION_STATUS.md** - Status & config

---

## ✅ Checklist

- [ ] Get Gemini API key
- [ ] Update backend/.env
- [ ] Restart backend server
- [ ] Run test script
- [ ] Test in browser
- [ ] Try all 7 scenarios
- [ ] Test voice recording
- [ ] Complete a conversation
- [ ] View scorecard

---

## 🎉 You're Ready!

The AI Conversation feature is fully implemented and ready to use.

**Enjoy learning English with AI!** 🚀

---

**Need Help?**
- Check documentation files
- Review test scripts
- Verify API key and quota

**Last Updated:** 2026-05-02
