import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Volume2, BookOpen, Lightbulb, ExternalLink } from 'lucide-react';

const DictionaryPage = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem('dictionaryHistory') || '[]');
    setSearchHistory(history);

    // Get query from URL
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
  }, []);

  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Use Free Dictionary API
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query.trim())}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('Không tìm thấy từ này trong từ điển. Vui lòng kiểm tra lại chính tả.');
        } else {
          setError('Có lỗi xảy ra khi tra từ. Vui lòng thử lại.');
        }
        return;
      }

      const data = await response.json();
      setResult(data[0]); // Get first result

      // Save to search history
      saveToHistory(query);
    } catch (err) {
      console.error('Dictionary API error:', err);
      setError('Không thể kết nối đến từ điển. Vui lòng kiểm tra kết nối internet.');
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (query) => {
    let history = JSON.parse(localStorage.getItem('dictionaryHistory') || '[]');
    history = [query, ...history.filter((h) => h !== query)].slice(0, 10);
    localStorage.setItem('dictionaryHistory', JSON.stringify(history));
    setSearchHistory(history);
  };

  const handleSearch = () => {
    if (searchQuery.trim().length >= 2) {
      performSearch(searchQuery);
    }
  };

  const handleSpeak = (text, audioUrl = null) => {
    if (audioUrl) {
      // Play audio from API if available
      const audio = new Audio(audioUrl);
      audio.play();
    } else if ('speechSynthesis' in window) {
      // Fallback to Web Speech API
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt không hỗ trợ phát âm');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Từ điển Anh-Anh</h1>
          <p className="text-gray-600">Tra cứu nghĩa, phát âm và ví dụ của từ tiếng Anh</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nhập từ tiếng Anh cần tra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tra...' : 'Tra từ'}
            </button>
          </div>

          {/* Search History */}
          {!searchQuery && searchHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Tra cứu gần đây
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(query);
                      performSearch(query);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tra từ...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.hash = 'vocabulary/search'}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tìm trong từ vựng của bạn
            </button>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Word Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-bold text-white">{result.word}</h2>
                {result.phonetics && result.phonetics.length > 0 && (
                  <button
                    onClick={() =>
                      handleSpeak(
                        result.word,
                        result.phonetics.find((p) => p.audio)?.audio
                      )
                    }
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <Volume2 className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
              {result.phonetic && (
                <p className="text-xl text-blue-100">{result.phonetic}</p>
              )}
            </div>

            {/* Meanings */}
            <div className="p-6 space-y-6">
              {result.meanings && result.meanings.map((meaning, idx) => (
                <div key={idx} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                  {/* Part of Speech */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      {meaning.partOfSpeech}
                    </span>
                  </div>

                  {/* Definitions */}
                  <div className="space-y-4">
                    {meaning.definitions && meaning.definitions.slice(0, 3).map((def, defIdx) => (
                      <div key={defIdx} className="ml-4">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">{defIdx + 1}.</span>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium mb-1">
                              {def.definition}
                            </p>
                            {def.example && (
                              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                                <p className="text-gray-700 italic">
                                  "{def.example}"
                                </p>
                              </div>
                            )}
                            {def.synonyms && def.synonyms.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Synonyms: </span>
                                <div className="inline-flex flex-wrap gap-1 mt-1">
                                  {def.synonyms.slice(0, 5).map((syn, synIdx) => (
                                    <span
                                      key={synIdx}
                                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                    >
                                      {syn}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {def.antonyms && def.antonyms.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Antonyms: </span>
                                <div className="inline-flex flex-wrap gap-1 mt-1">
                                  {def.antonyms.slice(0, 5).map((ant, antIdx) => (
                                    <span
                                      key={antIdx}
                                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                                    >
                                      {ant}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Synonyms & Antonyms */}
                  {meaning.synonyms && meaning.synonyms.length > 0 && (
                    <div className="mt-4 ml-4">
                      <span className="text-sm font-semibold text-gray-700">
                        More synonyms:{' '}
                      </span>
                      <span className="text-sm text-gray-600">
                        {meaning.synonyms.slice(0, 10).join(', ')}
                      </span>
                    </div>
                  )}
                  {meaning.antonyms && meaning.antonyms.length > 0 && (
                    <div className="mt-2 ml-4">
                      <span className="text-sm font-semibold text-gray-700">
                        Antonyms:{' '}
                      </span>
                      <span className="text-sm text-gray-600">
                        {meaning.antonyms.slice(0, 10).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Source Links */}
              {result.sourceUrls && result.sourceUrls.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ExternalLink className="w-4 h-4" />
                    <span>Source:</span>
                    <a
                      href={result.sourceUrls[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {result.sourceUrls[0].replace('https://', '')}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Tip */}
            <div className="bg-yellow-50 p-4 border-t border-yellow-100">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Mẹo:</strong> Bạn có thể thêm từ này vào danh sách học của mình bằng cách tìm kiếm trong{' '}
                    <button
                      onClick={() => window.location.hash = `vocabulary/search?q=${result.word}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      trang từ vựng
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !result && !error && (
          <div className="text-center py-12 bg-white rounded-xl">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Tra cứu từ điển Anh-Anh
            </h3>
            <p className="text-gray-500 mb-4">
              Nhập từ tiếng Anh bạn muốn tra cứu nghĩa, phát âm và ví dụ
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('hello');
                  performSearch('hello');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Thử: hello
              </button>
              <button
                onClick={() => {
                  setSearchQuery('beautiful');
                  performSearch('beautiful');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Thử: beautiful
              </button>
              <button
                onClick={() => {
                  setSearchQuery('knowledge');
                  performSearch('knowledge');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Thử: knowledge
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DictionaryPage;
