# Rate Limiting Guide - Gemini API

## Current Limits (Free Tier)

- **15 requests per minute**
- **1,500 requests per day**
- **32,000 tokens per minute**

## Solutions

### 1. Wait and Retry (Immediate)
Đợi 60 giây trước khi gửi request tiếp theo.

### 2. Frontend Rate Limiting (Recommended)

Add to frontend to prevent too many requests:

```javascript
// frontend/src/utils/rateLimiter.js
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getWaitTime() {
    if (this.requests.length < this.maxRequests) return 0;
    
    const oldestRequest = this.requests[0];
    const waitTime = this.timeWindow - (Date.now() - oldestRequest);
    return Math.max(0, waitTime);
  }
}

export const aiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
```

Usage in AI conversation component:
```javascript
const sendMessage = async (content) => {
  if (!aiRateLimiter.canMakeRequest()) {
    const waitTime = Math.ceil(aiRateLimiter.getWaitTime() / 1000);
    toast.error(`Please wait ${waitTime} seconds before sending another message`);
    return;
  }
  
  // Send message...
};
```

### 3. Backend Caching (Advanced)

Cache common responses to reduce API calls:

```javascript
// backend/services/geminiCache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

function getCacheKey(prompt, options) {
  return `${prompt}_${JSON.stringify(options)}`;
}

async function sendMessageWithCache(prompt, options) {
  const key = getCacheKey(prompt, options);
  
  // Check cache
  const cached = cache.get(key);
  if (cached) return cached;
  
  // Call API
  const response = await sendMessage(prompt, options);
  
  // Store in cache
  cache.set(key, response);
  
  return response;
}
```

### 4. Upgrade to Paid Tier

**Gemini API Pricing:**
- Free: 15 RPM, 1,500 RPD
- Paid: 60 RPM, 10,000 RPD
- Cost: ~$0.075 per 1M input tokens

Visit: https://ai.google.dev/pricing

### 5. Add Loading States

Show users when rate limit is reached:

```javascript
if (error.message.includes('rate limit')) {
  setError('Too many requests. Please wait a moment and try again.');
  setRetryAfter(60); // Show countdown
}
```

## Current Backend Rate Limiting

Already implemented in `backend/middleware/rateLimiter.js`:
- AI endpoints: Limited by Express rate limiter
- But doesn't prevent Gemini API rate limits

## Recommendations

1. **Immediate**: Wait 60 seconds between requests
2. **Short-term**: Add frontend rate limiter (10 req/min)
3. **Long-term**: Consider paid tier if usage grows

## Monitoring

Check current usage:
```bash
# Count requests in last minute
grep "Gemini API" backend/server.log | tail -20
```

---

**Note**: Rate limits reset every minute, so waiting 60 seconds will allow new requests.
