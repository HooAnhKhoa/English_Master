import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Volume2, BookOpen, Lightbulb, Star, ArrowRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const VocabDetailModal = ({ vocab, onClose, onRefresh }) => {
  const [vocabDetail, setVocabDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVocabDetail();
  }, [vocab.id]);

  const fetchVocabDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/vocab/${vocab.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success) {
        setVocabDetail(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vocab detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(vocabDetail.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt không hỗ trợ phát âm');
    }
  };

  const handleAddToReview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập');
        return;
      }

      const response = await axios.post(
        `${API_URL}/vocab/start-learning`,
        { vocabIds: [vocab.id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Đã thêm vào danh sách ôn tập!');
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error('Error adding to review:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleMarkAsMastered = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập');
        return;
      }

      // Review with quality 5 (easy) to mark as mastered
      const response = await axios.post(
        `${API_URL}/vocab/flashcard/review`,
        { vocabId: vocab.id, quality: 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Đã đánh dấu là đã thuộc!');
        onRefresh();
        onClose();
      }
    } catch (error) {
      console.error('Error marking as mastered:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const highlightWord = (text, word) => {
    if (!text || !word) return text;
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 font-semibold">$1</mark>');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vocabDetail) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-bold text-white">{vocabDetail.word}</h2>
                <button
                  onClick={handleSpeak}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <Volume2 className="w-6 h-6 text-white" />
                </button>
              </div>
              {vocabDetail.pronunciation && (
                <p className="text-xl text-blue-100 mb-2">{vocabDetail.pronunciation}</p>
              )}
              {vocabDetail.part_of_speech && (
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                  {vocabDetail.part_of_speech}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Image */}
          {vocabDetail.image_url && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={vocabDetail.image_url}
                alt={vocabDetail.word}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Meaning */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Nghĩa tiếng Việt
            </h3>
            <p className="text-2xl text-gray-800 font-medium">{vocabDetail.meaning}</p>
          </div>

          {/* Definition */}
          {vocabDetail.definition && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Định nghĩa (English)
              </h3>
              <p className="text-gray-700">{vocabDetail.definition}</p>
            </div>
          )}

          {/* Example */}
          {vocabDetail.example && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ví dụ</h3>
              <p
                className="text-gray-800 italic mb-2"
                dangerouslySetInnerHTML={{
                  __html: highlightWord(vocabDetail.example, vocabDetail.word),
                }}
              />
              {vocabDetail.example_translation && (
                <p className="text-gray-600 text-sm">
                  → {vocabDetail.example_translation}
                </p>
              )}
            </div>
          )}

          {/* Synonyms & Antonyms */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {vocabDetail.synonyms && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Từ đồng nghĩa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vocabDetail.synonyms.split(',').map((syn, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm cursor-pointer hover:bg-green-200"
                    >
                      {syn.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {vocabDetail.antonyms && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Từ trái nghĩa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {vocabDetail.antonyms.split(',').map((ant, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm cursor-pointer hover:bg-red-200"
                    >
                      {ant.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Memory Tip */}
          {vocabDetail.memory_tip && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Mẹo ghi nhớ
              </h3>
              <p className="text-gray-700">{vocabDetail.memory_tip}</p>
            </div>
          )}

          {/* Progress */}
          {vocabDetail.userProgress && vocabDetail.userProgress.repetitions > 0 && (
            <div className="mb-6 bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                Tiến độ học
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <span>Đã ôn {vocabDetail.userProgress.repetitions} lần</span>
                {vocabDetail.userProgress.nextReview && (
                  <span>
                    • Ôn lại sau{' '}
                    {Math.ceil(
                      (new Date(vocabDetail.userProgress.nextReview) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    ngày
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Related Words */}
          {vocabDetail.relatedWords && vocabDetail.relatedWords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Từ liên quan
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vocabDetail.relatedWords.map((related) => (
                  <div
                    key={related.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    {related.image_url && (
                      <img
                        src={related.image_url}
                        alt={related.word}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                    )}
                    <p className="font-semibold text-gray-900">{related.word}</p>
                    <p className="text-xs text-gray-600">{related.pronunciation}</p>
                    <p className="text-sm text-gray-700 line-clamp-1">
                      {related.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
          {vocabDetail.userProgress?.status === 'not-started' && (
            <button
              onClick={handleAddToReview}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Thêm vào danh sách ôn
            </button>
          )}

          {vocabDetail.userProgress?.status !== 'mastered' && (
            <button
              onClick={handleMarkAsMastered}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              Đã thuộc rồi
            </button>
          )}

          {vocabDetail.userProgress?.status === 'mastered' && (
            <div className="flex-1 py-3 bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2">
              <Star className="w-5 h-5 fill-current" />
              Bạn đã thuộc từ này
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabDetailModal;
