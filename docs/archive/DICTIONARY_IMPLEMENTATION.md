# Dictionary Page Implementation

## Overview
Added a Dictionary page that allows users to look up any English word using the Free Dictionary API. This complements the vocabulary learning system by providing instant access to word definitions, pronunciations, examples, and synonyms/antonyms.

## Features

### 1. **Free Dictionary API Integration**
- Uses `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- No API key required
- Returns comprehensive word data including:
  - Phonetic transcription
  - Audio pronunciation URLs
  - Multiple meanings by part of speech
  - Definitions with examples
  - Synonyms and antonyms
  - Source links

### 2. **Search Functionality**
- Real-time search input
- Enter key support for quick search
- Search history stored in localStorage (last 10 searches)
- URL parameter support: `#dictionary?q=word`
- Auto-search from URL on page load

### 3. **Audio Pronunciation**
- Primary: Uses audio URLs from Dictionary API
- Fallback: Web Speech API (speechSynthesis)
- Click speaker icon to hear pronunciation

### 4. **Rich Word Display**
- Gradient header with word and phonetic
- Grouped by part of speech (noun, verb, adjective, etc.)
- Up to 3 definitions per part of speech
- Example sentences in highlighted boxes
- Synonyms and antonyms as colored badges
- Source attribution with external links

### 5. **User Experience**
- Loading state with spinner
- Error handling for:
  - Word not found (404)
  - Network errors
  - API failures
- Empty state with example word suggestions
- Quick link to add word to vocabulary learning list
- Back button to return to vocabulary page

### 6. **Integration with Vocabulary System**
- Link from VocabSearchPage when no results found
- Link from VocabularyPage toolbar (purple "Từ điển" button)
- Suggestion to search in vocabulary system after lookup
- Passes search query via URL parameters

## File Structure

```
frontend/src/components/
├── DictionaryPage.jsx          # Main dictionary component (new)
├── VocabularyPage.jsx          # Added dictionary button
└── VocabSearchPage.jsx         # Updated empty state link
```

## API Response Structure

```javascript
[
  {
    word: "hello",
    phonetic: "/həˈloʊ/",
    phonetics: [
      {
        text: "/həˈloʊ/",
        audio: "https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3"
      }
    ],
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: "A greeting (salutation) said when meeting someone...",
            example: "She greeted me with a warm hello.",
            synonyms: ["greeting", "salutation"],
            antonyms: ["goodbye"]
          }
        ],
        synonyms: ["greeting", "hi"],
        antonyms: ["goodbye", "farewell"]
      }
    ],
    sourceUrls: ["https://en.wiktionary.org/wiki/hello"]
  }
]
```

## Usage Flow

### 1. Access Dictionary
```
User clicks "Từ điển" button on VocabularyPage
→ Navigate to #dictionary
→ DictionaryPage renders with empty state
```

### 2. Search Word
```
User types "beautiful" and clicks "Tra từ"
→ Fetch from Dictionary API
→ Display results with pronunciation, meanings, examples
→ Save "beautiful" to search history
```

### 3. From Search Results
```
User searches "xyz" in VocabSearchPage
→ No results found
→ Click "Thử tra từ điển Anh-Anh"
→ Navigate to #dictionary?q=xyz
→ Auto-search "xyz" in dictionary
```

### 4. Add to Vocabulary
```
User looks up "knowledge" in dictionary
→ Click "trang từ vựng" link in footer tip
→ Navigate to #vocabulary/search?q=knowledge
→ Search in user's vocabulary database
```

## Component Props

### DictionaryPage
```javascript
{
  onBack: () => void  // Callback to navigate back to vocabulary page
}
```

## State Management

```javascript
const [searchQuery, setSearchQuery] = useState('');        // Current search input
const [result, setResult] = useState(null);                // API response data
const [loading, setLoading] = useState(false);             // Loading state
const [error, setError] = useState(null);                  // Error message
const [searchHistory, setSearchHistory] = useState([]);    // Last 10 searches
```

## LocalStorage Keys

```javascript
'dictionaryHistory'  // Array of last 10 searched words
```

## Styling Features

1. **Gradient Header**: Blue to purple gradient for word display
2. **Part of Speech Badges**: Purple rounded badges
3. **Example Boxes**: Light blue background with rounded corners
4. **Synonym/Antonym Badges**: Green for synonyms, red for antonyms
5. **Yellow Tip Box**: Footer with lightbulb icon and helpful tip
6. **Responsive Design**: Works on mobile and desktop

## Error Handling

```javascript
// 404 - Word not found
"Không tìm thấy từ này trong từ điển. Vui lòng kiểm tra lại chính tả."

// Network error
"Không thể kết nối đến từ điển. Vui lòng kiểm tra kết nối internet."

// Other errors
"Có lỗi xảy ra khi tra từ. Vui lòng thử lại."
```

## Navigation Routes

```javascript
#dictionary                    // Empty dictionary page
#dictionary?q=word            // Dictionary with auto-search
#vocabulary                   // Back to vocabulary topics
#vocabulary/search?q=word     // Search in user's vocabulary
```

## Integration Points

### 1. VocabularyPage.jsx
```javascript
// Added dictionary button in search bar
<button
  onClick={() => window.location.hash = 'dictionary'}
  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
>
  <BookOpen className="w-5 h-5" />
  Từ điển
</button>
```

### 2. VocabSearchPage.jsx
```javascript
// Updated empty state button
<button
  onClick={() => window.location.hash = `dictionary?q=${encodeURIComponent(searchQuery)}`}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  Thử tra từ điển Anh-Anh
</button>
```

### 3. index.js
```javascript
// Added dictionary route
if (currentPage === 'dictionary') {
  return <DictionaryPage onBack={() => handleNavigate('vocabulary')} />;
}
```

## Benefits

1. **Instant Lookup**: No need to add words to database first
2. **Comprehensive Data**: Full definitions, examples, synonyms from trusted source
3. **Audio Pronunciation**: Native speaker audio when available
4. **Free Service**: No API key or rate limits
5. **Offline Fallback**: Web Speech API for pronunciation
6. **Seamless Integration**: Links between dictionary and vocabulary system
7. **Search History**: Quick access to recently looked up words

## Future Enhancements

1. Add "Save to Vocabulary" button to create new vocab entries
2. Show related words from user's vocabulary database
3. Add word frequency/difficulty indicators
4. Support multiple dictionaries (Cambridge, Oxford, etc.)
5. Add translation to Vietnamese
6. Implement favorites/bookmarks
7. Add word of the day feature
8. Show etymology and word origin

## Testing

### Test Cases
1. Search common word (e.g., "hello") → Should show results
2. Search rare word (e.g., "serendipity") → Should show results
3. Search invalid word (e.g., "asdfgh") → Should show error
4. Click audio icon → Should play pronunciation
5. Click search history item → Should search that word
6. Navigate with URL parameter → Should auto-search
7. Click "trang từ vựng" link → Should navigate to vocab search
8. Test offline → Should show network error

### Manual Testing
```bash
# Start frontend
cd frontend
npm start

# Navigate to dictionary
http://localhost:3000/#dictionary

# Test searches
- hello
- beautiful
- knowledge
- asdfgh (invalid)
```

## API Documentation

**Free Dictionary API**
- Endpoint: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- Method: GET
- No authentication required
- Rate limit: None
- Response: JSON array of word entries
- Documentation: https://dictionaryapi.dev/

## Conclusion

The Dictionary page provides a powerful tool for users to look up any English word instantly, complementing the structured vocabulary learning system. It uses a free, reliable API and integrates seamlessly with the existing vocabulary features.
