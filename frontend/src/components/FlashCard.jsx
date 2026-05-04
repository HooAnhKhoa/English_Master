import React, { useState, useEffect } from 'react';
import { Volume2, RotateCw, TrendingUp, Award } from 'lucide-react';

const FlashCard = ({ vocab, onReview, isFlipped, onFlip }) => {
  const [startTime] = useState(Date.now());

  const handleReview = (rating) => {
    const responseTime = Date.now() - startTime;
    onReview(vocab.id, rating, responseTime);
  };

  const playAudio = () => {
    if (vocab.audio_url) {
      const audio = new Audio(vocab.audio_url);
      audio.play();
    } else {
      // Use Web Speech API as fallback
      const utterance = new SpeechSynthesisUtterance(vocab.word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <div
        className={`relative w-full h-96 transition-transform duration-500 transform-style-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={onFlip}
      >
        {/* Front Side */}
        <div
          className={`absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center ${
            isFlipped ? 'invisible' : 'visible'
          }`}
        >
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-4">{vocab.word}</h2>
            {vocab.pronunciation && (
              <p className="text-xl text-blue-100 mb-6">{vocab.pronunciation}</p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playAudio();
              }}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-4 transition-all duration-200 hover:scale-110"
            >
              <Volume2 size={32} />
            </button>
          </div>
          <div className="absolute bottom-6 text-white/70 text-sm">
            Click to flip
          </div>
        </div>

        {/* Back Side */}
        <div
          className={`absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-2xl p-8 rotate-y-180 ${
            isFlipped ? 'visible' : 'invisible'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Image */}
            {vocab.image_url && (
              <div className="mb-4">
                <img
                  src={vocab.image_url}
                  alt={vocab.word}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Part of Speech & Topic */}
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {vocab.part_of_speech}
              </span>
              {vocab.topic && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {vocab.topic.icon} {vocab.topic.name}
                </span>
              )}
            </div>

            {/* Meaning */}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{vocab.meaning}</h3>
              {vocab.definition && (
                <p className="text-gray-600 text-sm">{vocab.definition}</p>
              )}
            </div>

            {/* Example */}
            {vocab.example && (
              <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 italic mb-1">"{vocab.example}"</p>
                {vocab.example_vi && (
                  <p className="text-gray-500 text-sm">"{vocab.example_vi}"</p>
                )}
              </div>
            )}

            {/* Synonyms & Antonyms */}
            <div className="flex gap-4 text-sm">
              {vocab.synonyms && vocab.synonyms.length > 0 && (
                <div>
                  <span className="font-semibold text-green-600">Synonyms: </span>
                  <span className="text-gray-600">{vocab.synonyms.join(', ')}</span>
                </div>
              )}
              {vocab.antonyms && vocab.antonyms.length > 0 && (
                <div>
                  <span className="font-semibold text-red-600">Antonyms: </span>
                  <span className="text-gray-600">{vocab.antonyms.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Buttons - Only show when flipped */}
      {isFlipped && (
        <div className="space-y-3 mt-6">
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => handleReview('forgot')}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-1">😰</div>
              <div className="text-sm">Quên rồi</div>
            </button>
            <button
              onClick={() => handleReview('hard')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-1">😓</div>
              <div className="text-sm">Khó</div>
            </button>
            <button
              onClick={() => handleReview('good')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-1">😊</div>
              <div className="text-sm">OK</div>
            </button>
            <button
              onClick={() => handleReview('easy')}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-1">😎</div>
              <div className="text-sm">Dễ</div>
            </button>
          </div>
          <button
            onClick={() => handleReview('mastered')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">✅</span>
              <span>Đã thuộc - Không ôn lại</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

const FlashCardSession = ({ user, onLogout }) => {
  const [vocabList, setVocabList] = useState([]);
  const [newWords, setNewWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadTodayVocab();
  }, []);

  const loadTodayVocab = async () => {
    try {
      setLoading(true);
      const { getTodayVocab } = await import('../services/api');
      const response = await getTodayVocab();

      if (response.success) {
        const { toReview, newWords: newWordsData, todayStats } = response.data;

        // Combine review words and new words
        const reviewVocabs = toReview.map(item => item.vocab).filter(v => v.is_active !== false);
        const allVocabs = [...reviewVocabs, ...newWordsData.filter(v => v.is_active !== false)];

        setVocabList(allVocabs);
        setNewWords(newWordsData.map(v => v.id));
        setStats(todayStats);

        if (allVocabs.length === 0) {
          setSessionComplete(true);
        }
      }
    } catch (error) {
      console.error('Error loading vocab:', error);
      alert('Không thể tải danh sách từ vựng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (vocabId, rating, responseTime) => {
    try {
      const { reviewFlashcard } = await import('../services/api');
      const response = await reviewFlashcard(vocabId, rating, responseTime);

      if (response.success) {
        setReviewResult(response.data);

        // Show result briefly
        setTimeout(() => {
          setReviewResult(null);

          // Move to next card
          if (currentIndex < vocabList.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
          } else {
            // Session complete
            setSessionComplete(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setReviewResult(null);
    loadTodayVocab();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải từ vựng...</p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          {showConfetti && <Confetti />}
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Hoàn thành!</h2>
          <p className="text-gray-600 mb-6">
            Bạn đã hoàn thành {vocabList.length} từ vựng hôm nay!
          </p>

          {stats && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
                  <div className="text-sm text-gray-600">Đã ôn tập</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.newLearned}</div>
                  <div className="text-sm text-gray-600">Từ mới</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.streak}</div>
                  <div className="text-sm text-gray-600">Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.xp}</div>
                  <div className="text-sm text-gray-600">XP</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.hash = ''}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
            >
              ← Về Dashboard
            </button>
            <button
              onClick={resetSession}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <RotateCw size={20} />
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentVocab = vocabList[currentIndex];
  const progress = ((currentIndex + 1) / vocabList.length) * 100;
  const isNewWord = newWords.includes(currentVocab?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.hash = ''}
                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow transition-all duration-200"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Học từ vựng</h1>
            </div>
            <div className="flex gap-4 text-sm">
              {stats && (
                <>
                  <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg shadow">
                    <TrendingUp size={16} className="text-blue-600" />
                    <span className="font-semibold">{stats.streak} days</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg shadow">
                    <Award size={16} className="text-orange-600" />
                    <span className="font-semibold">{stats.xp} XP</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-full h-3 shadow-inner overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>
              {currentIndex + 1} / {vocabList.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>

          {isNewWord && (
            <div className="mt-2 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              ✨ Từ mới
            </div>
          )}
        </div>

        {/* FlashCard */}
        {currentVocab && (
          <FlashCard
            vocab={currentVocab}
            onReview={handleReview}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        )}

        {/* Review Result Notification */}
        {reviewResult && (
          <div className="fixed top-4 right-4 bg-white rounded-xl shadow-2xl p-6 max-w-sm animate-slide-in">
            <div className="flex items-start gap-3">
              <div className="text-3xl">
                {reviewResult.levelUp ? '🎊' : reviewResult.newBadge ? '🏆' : '✅'}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">
                  {reviewResult.levelUp
                    ? 'Level Up!'
                    : reviewResult.newBadge
                    ? 'Huy hiệu mới!'
                    : 'Tuyệt vời!'}
                </h3>
                <p className="text-sm text-gray-600">
                  +{reviewResult.xpEarned} XP, +{reviewResult.coinsEarned} coins
                </p>
                {reviewResult.levelUp && (
                  <p className="text-sm text-purple-600 font-semibold mt-1">
                    Lên cấp {reviewResult.levelUp.newLevel}!
                  </p>
                )}
                {reviewResult.newBadge && (
                  <p className="text-sm text-orange-600 font-semibold mt-1">
                    {reviewResult.newBadge.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple Confetti Component
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          {['🎉', '🎊', '⭐', '✨', '🌟'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );
};

export default FlashCardSession;
