import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, TrendingUp, Award } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const VocabularyPage = ({ onNavigate }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const levels = [
    { key: 'all', label: 'Tất cả' },
    { key: 'A1', label: 'A1 - Beginner' },
    { key: 'A2', label: 'A2 - Elementary' },
    { key: 'B1', label: 'B1 - Intermediate' },
    { key: 'B2', label: 'B2 - Upper-Intermediate' },
    { key: 'C1', label: 'C1 - Advanced' },
    { key: 'C2', label: 'C2 - Proficiency' },
  ];

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/vocab/topics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success) {
        setTopics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (slug) => {
    window.location.hash = `vocabulary/${slug}`;
  };

  const handleSearch = () => {
    if (searchQuery.trim().length >= 2) {
      window.location.hash = `vocabulary/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.name_vi.toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = topic.is_active !== false;
    return matchesSearch && isActive;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Học Từ Vựng</h1>
          </div>
          <p className="text-gray-600">Khám phá và học từ vựng theo chủ đề</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm chủ đề hoặc từ vựng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
            <button
              onClick={() => window.location.hash = 'dictionary'}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Từ điển
            </button>
          </div>
        </div>

        {/* Level Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {levels.map((level) => (
            <button
              key={level.key}
              onClick={() => setSelectedLevel(level.key)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedLevel === level.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải chủ đề...</p>
          </div>
        )}

        {/* Topics Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleTopicClick(topic.slug)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
              >
                {/* Topic Icon */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-center">
                  <div className="text-6xl mb-2">{topic.icon || '📚'}</div>
                  <h3 className="text-xl font-bold text-white">{topic.name_vi}</h3>
                  <p className="text-blue-100 text-sm">{topic.name}</p>
                </div>

                {/* Topic Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm">{topic.word_count} từ</span>
                    </div>
                    {topic.learnedCount > 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">{topic.learnedCount} đã học</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Tiến độ</span>
                      <span>{topic.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  {topic.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                      {topic.description}
                    </p>
                  )}
                </div>

                {/* Hover Effect */}
                <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Bắt đầu học →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy chủ đề nào
            </h3>
            <p className="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyPage;
