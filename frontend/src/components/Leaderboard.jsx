import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Crown, Medal, TrendingUp, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const Leaderboard = ({ socket, currentUser }) => {
  const [period, setPeriod] = useState('daily');
  const [rankings, setRankings] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const periods = [
    { key: 'daily', label: 'Hôm nay', icon: '📅' },
    { key: 'weekly', label: 'Tuần này', icon: '📊' },
    { key: 'monthly', label: 'Tháng này', icon: '📈' },
    { key: 'alltime', label: 'Tổng', icon: '🏆' },
  ];

  useEffect(() => {
    fetchLeaderboard();
    fetchUserRank();
  }, [period, pagination.page]);

  useEffect(() => {
    if (!socket) return;

    // Listen for ranking updates
    socket.on('ranking-update', handleRankingUpdate);

    return () => {
      socket.off('ranking-update', handleRankingUpdate);
    };
  }, [socket, period]);

  const handleRankingUpdate = (data) => {
    // Re-fetch leaderboard when rankings change
    fetchLeaderboard();
    fetchUserRank();
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/rankings`, {
        params: { period, page: pagination.page, limit: pagination.limit },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success) {
        setRankings(response.data.rankings || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/rankings/me`, {
        params: { period },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const newRank = response.data.data;

        // Check if user rank improved
        if (userRank && newRank && newRank.rank < userRank.rank) {
          triggerConfetti();
        }

        setUserRank(newRank);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347'],
    });
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-amber-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700';
      default:
        return 'bg-gray-200';
    }
  };

  const getXpProgress = (currentXp, level) => {
    const levelThresholds = [
      { level: 1, xp: 0 },
      { level: 2, xp: 100 },
      { level: 3, xp: 250 },
      { level: 4, xp: 500 },
      { level: 5, xp: 1000 },
      { level: 6, xp: 2000 },
      { level: 7, xp: 3500 },
      { level: 8, xp: 5500 },
      { level: 9, xp: 8000 },
      { level: 10, xp: 11000 },
      { level: 11, xp: 15000 },
      { level: 12, xp: 20000 },
      { level: 13, xp: 26000 },
      { level: 14, xp: 33000 },
      { level: 15, xp: 41000 },
      { level: 16, xp: 50000 },
      { level: 17, xp: 60000 },
      { level: 18, xp: 72000 },
      { level: 19, xp: 85000 },
      { level: 20, xp: 100000 },
    ];

    const currentThreshold = levelThresholds.find((t) => t.level === level);
    const nextThreshold = levelThresholds.find((t) => t.level === level + 1);

    if (!nextThreshold) return 100;

    const xpInLevel = currentXp - currentThreshold.xp;
    const xpNeeded = nextThreshold.xp - currentThreshold.xp;
    return Math.min((xpInLevel / xpNeeded) * 100, 100);
  };

  const renderTopThree = () => {
    const top3 = rankings.slice(0, 3);
    if (top3.length === 0) return null;

    return (
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="flex flex-col items-center pt-8">
            <div className="relative">
              <img
                src={top3[1].avatar || '/default-avatar.png'}
                alt={top3[1].fullName}
                className="w-20 h-20 rounded-full border-4 border-gray-400 shadow-lg"
              />
              <div className="absolute -top-2 -right-2 bg-gray-400 rounded-full p-2">
                <Medal className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="mt-3 font-bold text-gray-800">{top3[1].fullName}</h3>
            <p className="text-sm text-gray-600">Level {top3[1].level}</p>
            <div className="mt-2 px-4 py-1 bg-gray-100 rounded-full">
              <span className="text-lg font-bold text-gray-700">{top3[1].periodXp} XP</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={top3[0].avatar || '/default-avatar.png'}
                alt={top3[0].fullName}
                className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-2xl"
              />
              <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-3">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -left-1 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <h3 className="mt-3 font-bold text-xl text-gray-900">{top3[0].fullName}</h3>
            <p className="text-sm text-gray-600">Level {top3[0].level}</p>
            <div className="mt-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg">
              <span className="text-xl font-bold text-white">{top3[0].periodXp} XP</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="flex flex-col items-center pt-8">
            <div className="relative">
              <img
                src={top3[2].avatar || '/default-avatar.png'}
                alt={top3[2].fullName}
                className="w-20 h-20 rounded-full border-4 border-amber-600 shadow-lg"
              />
              <div className="absolute -top-2 -right-2 bg-amber-600 rounded-full p-2">
                <Medal className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="mt-3 font-bold text-gray-800">{top3[2].fullName}</h3>
            <p className="text-sm text-gray-600">Level {top3[2].level}</p>
            <div className="mt-2 px-4 py-1 bg-amber-100 rounded-full">
              <span className="text-lg font-bold text-amber-700">{top3[2].periodXp} XP</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRankingList = () => {
    const remainingRankings = rankings.slice(3);

    return (
      <div className="space-y-2">
        {remainingRankings.map((ranking) => {
          const isCurrentUser = currentUser && ranking.userId === currentUser.id;
          const xpProgress = getXpProgress(ranking.totalXp, ranking.level);

          return (
            <div
              key={ranking.userId}
              className={`flex items-center p-4 rounded-lg transition-all ${
                isCurrentUser
                  ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md'
                  : 'bg-white border border-gray-200 hover:shadow-md'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-12 text-center">
                <span className="text-xl font-bold text-gray-600">#{ranking.rank}</span>
              </div>

              {/* Avatar */}
              <img
                src={ranking.avatar || '/default-avatar.png'}
                alt={ranking.fullName}
                className="w-12 h-12 rounded-full border-2 border-gray-300 ml-4"
              />

              {/* User Info */}
              <div className="flex-1 ml-4">
                <h4 className="font-semibold text-gray-900">{ranking.fullName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Level {ranking.level}
                  </span>
                  <span className="text-xs text-gray-500">{ranking.periodXp} XP</span>
                </div>
                {/* XP Progress Bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 text-right ml-4">
                <div className="text-sm text-gray-600">
                  <div>{ranking.wordsLearned} từ</div>
                  <div>{ranking.lessonsCompleted} bài</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="w-10 h-10 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900">Bảng Xếp Hạng</h1>
        </div>
        <p className="text-gray-600">Cạnh tranh với bạn bè và leo lên top đầu!</p>
      </div>

      {/* Period Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              setPeriod(p.key);
              setPagination({ ...pagination, page: 1 });
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              period === p.key
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bảng xếp hạng...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {renderTopThree()}

          {/* Ranking List */}
          {renderRankingList()}

          {/* User's Current Rank (Sticky at bottom if not in top 20) */}
          {userRank && userRank.rank > 20 && (
            <div className="mt-6 sticky bottom-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="text-xl font-bold text-gray-600">#{userRank.rank}</span>
                </div>
                <img
                  src={userRank.avatar || '/default-avatar.png'}
                  alt={userRank.fullName}
                  className="w-12 h-12 rounded-full border-2 border-yellow-400 ml-4"
                />
                <div className="flex-1 ml-4">
                  <h4 className="font-semibold text-gray-900">{userRank.fullName} (Bạn)</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Level {userRank.level}
                    </span>
                    <span className="text-xs text-gray-500">{userRank.periodXp} XP</span>
                  </div>
                </div>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-gray-700">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
