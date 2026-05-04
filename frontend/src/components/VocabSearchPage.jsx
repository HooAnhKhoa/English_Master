import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ArrowLeft, Filter, BookOpen } from 'lucide-react';
import VocabDetailModal from './VocabDetailModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const VocabSearchPage = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  useEffect(() => {
    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem('vocabSearchHistory') || '[]');
    setSearchHistory(history);

    // Get query from URL
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [searchQuery, selectedLevel, pagination.page]);

  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const levelParam = selectedLevel ? `&level=${selectedLevel}` : '';
      const response = await axios.get(
        `${API_URL}/vocab/search?q=${encodeURIComponent(query)}&page=${pagination.page}&limit=${pagination.limit}${levelParam}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.data.success) {
        setResults(response.data.data.results);
        setPagination(response.data.data.pagination);

        // Save to search history
        saveToHistory(query);
      }
    } catch (error) {
      console.error('Error searching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (query) => {
    let history = JSON.parse(localStorage.getItem('vocabSearchHistory') || '[]');
    history = [query, ...history.filter((h) => h !== query)].slice(0, 10);
    localStorage.setItem('vocabSearchHistory', JSON.stringify(history));
    setSearchHistory(history);
  };

  const highlightText = (text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 font-semibold">$1</mark>');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'not-started': { label: 'Chưa học', color: 'bg-gray-200 text-gray-700' },
      'in-progress': { label: 'Đang học', color: 'bg-yellow-200 text-yellow-800' },
      'completed': { label: 'Hoàn thành', color: 'bg-blue-200 text-blue-800' },
      'mastered': { label: 'Đã thuộc', color: 'bg-green-200 text-green-800' },
    };
    const badge = badges[status] || badges['not-started'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tìm kiếm từ vựng</h1>
          <p className="text-gray-600">Tìm kiếm và học từ vựng mới</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Nhập từ vựng cần tìm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Cấp độ:</span>
            <button
              onClick={() => setSelectedLevel('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedLevel === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedLevel === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Search History */}
        {!searchQuery && searchHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Tìm kiếm gần đây
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(query)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Tìm thấy {pagination.total} kết quả
            </div>

            <div className="space-y-3 mb-6">
              {results.filter(vocab => vocab.is_active !== false).map((vocab) => (
                <div
                  key={vocab.id}
                  onClick={() => setSelectedWord(vocab)}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    {vocab.image_url && (
                      <img
                        src={vocab.image_url}
                        alt={vocab.word}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3
                            className="text-xl font-bold text-gray-900"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(vocab.word, searchQuery),
                            }}
                          />
                          {vocab.pronunciation && (
                            <p className="text-sm text-gray-500">{vocab.pronunciation}</p>
                          )}
                        </div>
                        {getStatusBadge(vocab.userProgress?.status || 'not-started')}
                      </div>

                      <p
                        className="text-gray-700 mb-2"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(vocab.meaning, searchQuery),
                        }}
                      />

                      <div className="flex items-center gap-3 text-sm">
                        {vocab.part_of_speech && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            {vocab.part_of_speech}
                          </span>
                        )}
                        {vocab.level && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {vocab.level}
                          </span>
                        )}
                        {vocab.topic && (
                          <span className="text-gray-600">
                            {vocab.topic.icon} {vocab.topic.name_vi}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Trước
                </button>
                <span className="px-4 py-2 bg-white rounded-lg">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && searchQuery.length >= 2 && results.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-500 mb-4">
              Không tìm thấy từ vựng nào phù hợp với "{searchQuery}"
            </p>
            <button
              onClick={() => window.location.hash = `dictionary?q=${encodeURIComponent(searchQuery)}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử tra từ điển Anh-Anh
            </button>
          </div>
        )}
      </div>

      {/* Vocab Detail Modal */}
      {selectedWord && (
        <VocabDetailModal
          vocab={selectedWord}
          onClose={() => setSelectedWord(null)}
          onRefresh={() => performSearch(searchQuery)}
        />
      )}
    </div>
  );
};

export default VocabSearchPage;
