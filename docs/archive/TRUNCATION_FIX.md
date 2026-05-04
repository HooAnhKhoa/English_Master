# 🔧 Fix: Gemini Response Truncated Issue

**Date**: 2026-05-02 at 17:43 UTC  
**Issue**: Response bị cắt ngang, JSON không đầy đủ

---

## ⚠️ VẤN ĐỀ

### Triệu chứng:
```json
{
  "vocabulary": [
    {
      "word": "strike up a conversation",
      "meaning": "To start a conversation with mot so tu khong.can thiet"
    }
  ]
}
```

- Vocabulary meaning bị cắt ngang
- Text lỗi xuất hiện: "mot so tu khong.can thiet"
- JSON không đầy đủ

### Nguyên nhân:
1. **maxOutputTokens quá thấp** (1500 tokens)
2. **System prompt không rõ ràng** về format
3. **Rate limit** có thể ảnh hưởng quality

---

## ✅ GIẢI PHÁP

### 1. Tăng maxOutputTokens

**Before:**
```javascript
maxOutputTokens: 1500
```

**After:**
```javascript
maxOutputTokens: 2500
```

**File**: `backend/services/geminiService.js` và `backend/.env`

### 2. Cải thiện System Prompt

**Thêm các rules:**
- "You MUST respond with VALID JSON only"
- "Keep reply concise (2-3 sentences max)"
- "Provide 2-3 vocabulary items max"
- "Ensure all JSON strings are properly closed"

**Giới hạn rõ ràng:**
- Reply: 2-3 sentences
- Vocabulary: 2-3 items max
- Always include 3 suggestedResponses
- Score: number from 0-100

**File**: `backend/services/geminiService.js` - `generateSystemPrompt()`

---

## 🧪 TESTING

### Test sau khi fix:

```bash
# Đợi 60 giây để rate limit reset
sleep 60

# Test conversation mới
curl -X POST http://localhost:5000/api/v1/ai/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scenario":"making_friends","topic":"social dynamics"}'
```

### Expected result:
```json
{
  "reply": "Complete sentence without truncation...",
  "vocabulary": [
    {
      "word": "strike up a conversation",
      "meaning": "To start a conversation with someone you don't know",
      "example": "I tried to strike up a conversation with my neighbor."
    }
  ],
  "suggestedResponses": ["...", "...", "..."],
  "score": 85
}
```

---

## 📊 SO SÁNH

| Aspect | Before | After |
|--------|--------|-------|
| maxOutputTokens | 1500 | 2500 |
| Reply length | Unlimited | 2-3 sentences |
| Vocabulary items | Unlimited | 2-3 max |
| JSON validation | Weak | Strong |
| Truncation risk | High | Low |

---

## 💡 KHUYẾN NGHỊ

### Nếu vẫn gặp vấn đề:

1. **Đợi rate limit reset** (60 giây)
2. **Kiểm tra response trong console**:
   ```javascript
   console.log('Raw response:', rawResponse);
   ```
3. **Thử với scenario đơn giản hơn**
4. **Consider upgrade paid tier** nếu dùng nhiều

### Best practices:

1. **Luôn giới hạn output length** trong prompt
2. **Validate JSON** trước khi parse
3. **Implement retry logic** cho failed requests
4. **Monitor token usage** để tránh vượt limit

---

## 🔍 DEBUG

Nếu cần debug thêm, thêm logging:

```javascript
// backend/services/geminiService.js
async function sendMessage(...) {
  try {
    const result = await model.generateContent(...);
    const response = result.response;
    const text = response.text();
    
    // Debug logging
    console.log('Response length:', text.length);
    console.log('First 100 chars:', text.substring(0, 100));
    console.log('Last 100 chars:', text.substring(text.length - 100));
    
    return text;
  } catch (error) {
    // ...
  }
}
```

---

## ✅ STATUS

**Fixed**: 2026-05-02 at 17:43 UTC

- ✅ Increased maxOutputTokens to 2500
- ✅ Improved system prompt with clear rules
- ✅ Added length limits for reply and vocabulary
- ✅ Better JSON format instructions

**Next steps**: Test với conversation mới sau khi đợi rate limit reset.

---

**Note**: Rate limit free tier là 15 requests/minute. Nếu test nhiều, cần đợi 60 giây giữa các lần test.
