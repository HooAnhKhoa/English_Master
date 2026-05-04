import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'antd/dist/reset.css';
import { io } from 'socket.io-client';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import FlashCardSession from './components/FlashCard';
import AIConversation from './components/AIConversation';
import NavigationMenu from './components/NavigationMenu';
import VideoList from './components/VideoList';
import VideoLesson from './components/VideoLesson';
import Leaderboard from './components/Leaderboard';
import VocabularyPage from './components/VocabularyPage';
import TopicDetailPage from './components/TopicDetailPage';
import VocabSearchPage from './components/VocabSearchPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminTopics from './components/admin/AdminTopics';
import AdminVocabulary from './components/admin/AdminVocabulary';
import AdminVideos from './components/admin/AdminVideos';
import AdminSettings from './components/admin/AdminSettings';
import AdminQuizzes from './components/admin/AdminQuizzes';
import DictionaryPage from './components/DictionaryPage';
import ReviewDashboard from './components/ReviewDashboard';
import QuizSession from './components/QuizSession';
import ReviewHistory from './components/ReviewHistory';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [xpNotification, setXpNotification] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);

    // Simple routing based on URL hash
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setCurrentPage(hash || 'home');
      if (hash !== 'video-lesson') {
        setSelectedVideoId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      newSocket.emit('join', user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // Listen for XP updates
    newSocket.on('xp-update', (data) => {
      console.log('🎉 XP Update:', data);

      // Update user XP in state
      setUser((prevUser) => ({
        ...prevUser,
        xp: data.totalXp,
        level: data.newLevel,
      }));

      // Update localStorage
      const savedUser = JSON.parse(localStorage.getItem('user'));
      savedUser.xp = data.totalXp;
      savedUser.level = data.newLevel;
      localStorage.setItem('user', JSON.stringify(savedUser));

      // Show XP notification
      setXpNotification(data);
      setTimeout(() => setXpNotification(null), 3000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Redirect admin users to admin dashboard
    if (userData.role === 'admin') {
      window.location.hash = 'admin-dashboard';
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
    window.location.hash = '';
  };

  const handleNavigate = (path) => {
    window.location.hash = path;
  };

  const handleSelectVideo = (videoId) => {
    setSelectedVideoId(videoId);
    window.location.hash = 'video-lesson';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render page content based on currentPage
  const renderPage = () => {
    // Admin pages
    if (currentPage.startsWith('admin-')) {
      if (user.role !== 'admin') {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
              <p className="text-gray-600">You do not have permission to access the admin panel.</p>
            </div>
          </div>
        );
      }

      return (
        <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
          {currentPage === 'admin-dashboard' && <AdminDashboard />}
          {currentPage === 'admin-users' && <AdminUsers />}
          {currentPage === 'admin-topics' && <AdminTopics />}
          {currentPage === 'admin-vocabulary' && <AdminVocabulary />}
          {currentPage === 'admin-videos' && <AdminVideos />}
          {currentPage === 'admin-quizzes' && <AdminQuizzes />}
          {currentPage === 'admin-settings' && <AdminSettings />}
        </AdminLayout>
      );
    }

    // Vocabulary sub-pages
    if (currentPage.startsWith('vocabulary/')) {
      const parts = currentPage.split('/');
      if (parts[1] === 'search') {
        return <VocabSearchPage onBack={() => handleNavigate('vocabulary')} />;
      } else {
        // Topic detail page
        const slug = parts[1];
        return <TopicDetailPage slug={slug} onBack={() => handleNavigate('vocabulary')} />;
      }
    }

    // Dictionary page
    if (currentPage === 'dictionary') {
      return <DictionaryPage onBack={() => handleNavigate('vocabulary')} />;
    }

    // Review pages
    if (currentPage === 'review') {
      return <ReviewDashboard />;
    }

    if (currentPage === 'review/quiz') {
      return <QuizSession />;
    }

    if (currentPage === 'review/history') {
      return <ReviewHistory />;
    }

    if (currentPage === 'review/vocab') {
      // Navigate to flashcards with due filter
      return <FlashCardSession user={user} onLogout={handleLogout} dueOnly={true} />;
    }

    // Regular user pages
    switch (currentPage) {
      case 'home':
        return <Dashboard user={user} onLogout={handleLogout} />;

      case 'flashcards':
        return <FlashCardSession user={user} onLogout={handleLogout} />;

      case 'ai-conversation':
        return <AIConversation user={user} onBack={() => handleNavigate('')} />;

      case 'leaderboard':
        return <Leaderboard socket={socket} currentUser={user} />;

      case 'vocabulary':
        return <VocabularyPage onNavigate={handleNavigate} />;

      case 'videos':
        return <VideoList onSelectVideo={handleSelectVideo} />;

      case 'video-lesson':
        return selectedVideoId ? (
          <VideoLesson videoId={selectedVideoId} />
        ) : (
          <VideoList onSelectVideo={handleSelectVideo} />
        );

      case 'exercises':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">✅ Kiểm tra</h1>
              <p className="text-gray-600">Exercises feature coming soon...</p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">👤 Profile</h1>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-600 font-semibold">Name:</label>
                  <p className="text-gray-800">{user.full_name || user.username}</p>
                </div>
                <div>
                  <label className="text-gray-600 font-semibold">Email:</label>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="text-gray-600 font-semibold">Level:</label>
                  <p className="text-gray-800 capitalize">{user.level || 1}</p>
                </div>
                <div>
                  <label className="text-gray-600 font-semibold">XP:</label>
                  <p className="text-gray-800">{user.xp || 0}</p>
                </div>
                <div>
                  <label className="text-gray-600 font-semibold">Streak:</label>
                  <p className="text-gray-800">{user.streak || 0} days 🔥</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <Dashboard user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* XP Notification Toast */}
      {xpNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-4 rounded-lg shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="font-bold text-lg">+{xpNotification.xpGained} XP</p>
                {xpNotification.levelUp && (
                  <p className="text-sm">🎊 Level Up! Level {xpNotification.newLevel}</p>
                )}
                {xpNotification.newBadges && xpNotification.newBadges.length > 0 && (
                  <p className="text-sm">🏆 New Badge Earned!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Only show NavigationMenu for non-admin pages */}
      {!currentPage.startsWith('admin-') && (
        <NavigationMenu
          currentPage={currentPage}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
        />
      )}
      <div className={!currentPage.startsWith('admin-') ? "pb-20 md:pb-0" : ""}>
        {renderPage()}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
