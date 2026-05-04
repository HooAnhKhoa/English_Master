import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, BookOpen, Play, Filter } from 'lucide-react';
import VocabDetailModal from './VocabDetailModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const TopicDetailPage = ({ slug, onBack }) => {
  const [topic, setTopic] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedWord, setSelectedWord] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const tabs = [
    { key: 'all', label: 'Tất cả', color: 'blue' },
    { key: 'not-started', label: 'Chưa học', color: 'gray' },
    { key: 'in-progress', label: 'Đang học', color: 'yellow' },
    { key: 'mastered', label: 'Đã thuộc', color: 'green' },
  ];

  useEffect(() => {
    fetchTopicDetail();
  }, [slug, selectedTab, pagination.page]);

  const fetchTopicDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const statusParam = selectedTab !== 'all' ? `&status=${selectedTab}` : '';
      const response = await axios.get(
        `${API_URL}/vocab/topics/${slug}?page=${pagination.page}&limit=${pagination.limit}${statusParam}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.data.success) {
        setTopic(response.data.data.topic);
        setWords(response.data.data.words);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching topic detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để bắt đầu học');
        return;
      }

      const response = await axios.post(
        `${API_URL}/vocab/start-learning`,
        { topicId: topic.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Đã bắt đầu học ${response.data.data.started} từ mới!`);
        fetchTopicDetail();
      }
    } catch (error) {
      console.error('Error starting learning:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleStartFlashcard = () => {
    // Get words that are not mastered
    const wordsToLearn = words.filter(
      (w) => w.userProgress.status !== 'mastered'
    );

    if (wordsToLearn.length === 0) {
      alert('Bạn đã thuộc hết từ trong chủ đề này!');
      return;
    }

    // Navigate to flashcard with these words
    const vocabIds = wordsToLearn.map((w) => w.id).join(',');
    window.location.hash = `flashcards?vocabIds=${vocabIds}`;
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

  if (loading && !topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{topic?.icon || '📚'}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {topic?.nameVi}
                </h1>
                <p className="text-gray-600">{topic?.name}</p>
                {topic?.description && (
                  <p className="text-sm text-gray-500 mt-2">{topic.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {pagination.total}
                </div>
                <div className="text-sm text-gray-600">từ vựng</div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleStartLearning}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Bắt đầu học
              </button>
              <button
                onClick={handleStartFlashcard}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Học ngay
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedTab(tab.key);
                setPagination({ ...pagination, page: 1 });
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedTab === tab.key
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'bg-white/50 text-gray-700 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Words Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {words.filter(word => word.is_active !== false).map((word) => (
                <div
                  key={word.id}
                  onClick={() => setSelectedWord(word)}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  {/* Image */}
                  {word.image_url && (
                    <div className="h-32 bg-gray-200 overflow-hidden">
                      <img
                        src={word.image_url}
                        alt={word.word}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {word.word}
                        </h3>
                        {word.pronunciation && (
                          <p className="text-sm text-gray-500">{word.pronunciation}</p>
                        )}
                      </div>
                      {getStatusBadge(word.userProgress.status)}
                    </div>

                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                      {word.meaning}
                    </p>

                    {word.part_of_speech && (
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {word.part_of_speech}
                      </span>
                    )}

                    {word.userProgress.repetitions > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Đã ôn {word.userProgress.repetitions} lần
                      </div>
                    )}
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
        {!loading && words.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không có từ vựng nào
            </h3>
            <p className="text-gray-500">
              {selectedTab === 'all'
                ? 'Chủ đề này chưa có từ vựng'
                : `Bạn chưa có từ nào ở trạng thái "${
                    tabs.find((t) => t.key === selectedTab)?.label
                  }"`}
            </p>
          </div>
        )}
      </div>

      {/* Vocab Detail Modal */}
      {selectedWord && (
        <VocabDetailModal
          vocab={selectedWord}
          onClose={() => setSelectedWord(null)}
          onRefresh={fetchTopicDetail}
        />
      )}
    </div>
  );
};

export default TopicDetailPage;
