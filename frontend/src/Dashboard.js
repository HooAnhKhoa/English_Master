import React, { useState, useEffect } from 'react';

function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [vocabToday, setVocabToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({
    todayGoal: false,
    progress: false,
    weeklyChart: false,
    recentActivity: false
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Load today's vocab
      const vocabResponse = await fetch('http://100.90.68.89:5000/api/v1/vocab/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const vocabData = await vocabResponse.json();

      if (vocabData.success) {
        setVocabToday(vocabData.data);
      }

      // Load vocab stats
      const statsResponse = await fetch('http://100.90.68.89:5000/api/v1/vocab/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      // Generate weekly progress data (last 7 days)
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        // Simulate progress data (in real app, fetch from backend)
        weeklyData.push({
          day: dayName,
          learned: Math.floor(Math.random() * 20) + 5,
          reviewed: Math.floor(Math.random() * 30) + 10
        });
      }
      setWeeklyProgress(weeklyData);

      // Generate recent activity (in real app, fetch from backend)
      const activities = [
        { id: 1, type: 'learned', count: 15, topic: 'Business English', time: '2 hours ago', icon: '📚' },
        { id: 2, type: 'reviewed', count: 25, topic: 'Daily Conversation', time: '5 hours ago', icon: '✅' },
        { id: 3, type: 'quiz', score: 85, topic: 'Grammar', time: '1 day ago', icon: '🎯' },
        { id: 4, type: 'streak', days: user.streak || 0, time: 'Current', icon: '🔥' }
      ];
      setRecentActivity(activities);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
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
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      paddingBottom: '80px' // Space for mobile bottom nav
    }}
    className="dashboard-container">
      {/* Welcome Header */}
      <div style={{
        padding: '20px 10px',
        marginBottom: '10px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            {user.avatar ? <img src={user.avatar} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '50%'}} /> : '👤'}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Hi, {user.full_name || user.username}! 👋
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '4px',
              background: 'rgba(0, 0, 0, 0.15)',
              padding: '4px 12px',
              borderRadius: '20px',
              width: 'fit-content'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Level {user.level || 'Beginner'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '5px' }}>🔥</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            {user.streak || 0}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>Day Streak</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '5px' }}>⭐</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            {user.xp || 0}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>Total XP</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '5px' }}>📚</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            {stats?.total || 0}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>Learning</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '5px' }}>✅</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            {stats?.completed || 0}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>Completed</div>
        </div>
      </div>

      {/* Today's Learning */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>📖</span>
            <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Today's Goal</h2>
          </div>
          <span
            onClick={() => toggleSection('todayGoal')}
            style={{ cursor: 'pointer', fontSize: '18px', color: '#666' }}
          >
            {collapsedSections.todayGoal ? '▼' : '▲'}
          </span>
        </div>

        {!collapsedSections.todayGoal && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '25px'
            }}>
              <div style={{
                padding: '15px 10px',
                background: '#f0f4ff',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #e0e7ff'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4f46e5' }}>
                  {vocabToday?.todayStats?.dueCount || 0}
                </div>
                <div style={{ color: '#6366f1', fontSize: '11px', fontWeight: '600', marginTop: '4px' }}>REVIEW</div>
              </div>

              <div style={{
                padding: '15px 10px',
                background: '#f0fdf4',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #dcfce7'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                  {vocabToday?.todayStats?.newAvailable || 0}
                </div>
                <div style={{ color: '#22c55e', fontSize: '11px', fontWeight: '600', marginTop: '4px' }}>NEW</div>
              </div>

              <div style={{
                padding: '15px 10px',
                background: '#fff7ed',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #ffedd5'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ea580c' }}>
                  {vocabToday?.todayStats?.reviewed || 0}
                </div>
                <div style={{ color: '#f97316', fontSize: '11px', fontWeight: '600', marginTop: '4px' }}>LEARNED</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => window.location.hash = 'flashcards'}
                style={{
                  padding: '16px',
                  border: 'none',
                  borderRadius: '15px',
                  background: '#4f46e5',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                <span>🚀</span> Start Flashcards
              </button>

              <button
                onClick={() => window.location.hash = 'ai-conversation'}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '15px',
                  background: 'white',
                  color: '#374151',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
              >
                <span>🤖</span> Practice with AI
              </button>
            </div>
          </>
        )}
      </div>

      {/* Weekly Progress Chart */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>📈</span>
            <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Weekly Progress</h2>
          </div>
          <span
            onClick={() => toggleSection('weeklyChart')}
            style={{ cursor: 'pointer', fontSize: '18px', color: '#666' }}
          >
            {collapsedSections.weeklyChart ? '▼' : '▲'}
          </span>
        </div>

        {!collapsedSections.weeklyChart && (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '8px', minWidth: '100%', justifyContent: 'space-between' }}>
              {weeklyProgress.map((day, index) => (
                <div key={index} style={{ flex: 1, textAlign: 'center', minWidth: '40px' }}>
                  <div style={{
                    height: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      background: '#4f46e5',
                      borderRadius: '8px 8px 0 0',
                      height: `${(day.learned / 25) * 100}%`,
                      minHeight: '10px',
                      marginBottom: '2px'
                    }}></div>
                    <div style={{
                      background: '#22c55e',
                      borderRadius: '8px 8px 0 0',
                      height: `${(day.reviewed / 40) * 100}%`,
                      minHeight: '10px'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666' }}>{day.day}</div>
                  <div style={{ fontSize: '10px', color: '#999' }}>{day.learned + day.reviewed}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', background: '#4f46e5', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '12px', color: '#666' }}>Learned</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '12px', color: '#666' }}>Reviewed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>🎯</span>
            <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Recent Activity</h2>
          </div>
          <span
            onClick={() => toggleSection('recentActivity')}
            style={{ cursor: 'pointer', fontSize: '18px', color: '#666' }}
          >
            {collapsedSections.recentActivity ? '▼' : '▲'}
          </span>
        </div>

        {!collapsedSections.recentActivity && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.map(activity => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '12px',
                gap: '12px'
              }}>
                <div style={{ fontSize: '28px' }}>{activity.icon}</div>
                <div style={{ flex: 1 }}>
                  {activity.type === 'learned' && (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                        Learned {activity.count} new words
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {activity.topic} • {activity.time}
                      </div>
                    </>
                  )}
                  {activity.type === 'reviewed' && (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                        Reviewed {activity.count} words
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {activity.topic} • {activity.time}
                      </div>
                    </>
                  )}
                  {activity.type === 'quiz' && (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                        Quiz Score: {activity.score}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {activity.topic} • {activity.time}
                      </div>
                    </>
                  )}
                  {activity.type === 'streak' && (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                        {activity.days} Day Streak!
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Keep it up! • {activity.time}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>📊 Progress Overview</h2>
          <span
            onClick={() => toggleSection('progress')}
            style={{ cursor: 'pointer', fontSize: '18px', color: '#666' }}
          >
            {collapsedSections.progress ? '▼' : '▲'}
          </span>
        </div>

        {!collapsedSections.progress && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#666' }}>Not Started</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{stats?.notStarted || 0}</span>
              </div>
              <div style={{
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#cbd5e0',
                  width: `${stats?.notStarted ? (stats.notStarted / (stats.notStarted + stats.total) * 100) : 0}%`
                }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#666' }}>In Progress</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{stats?.inProgress || 0}</span>
              </div>
              <div style={{
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#667eea',
                  width: `${stats?.total ? (stats.inProgress / stats.total * 100) : 0}%`
                }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#666' }}>Completed</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{stats?.completed || 0}</span>
              </div>
              <div style={{
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#48bb78',
                  width: `${stats?.total ? (stats.completed / stats.total * 100) : 0}%`
                }}></div>
              </div>
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#666' }}>Mastered</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{stats?.mastered || 0}</span>
              </div>
              <div style={{
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#f6ad55',
                  width: `${stats?.total ? (stats.mastered / stats.total * 100) : 0}%`
                }}></div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 12px !important;
            padding-bottom: 80px !important;
          }

          .dashboard-container h1 {
            font-size: 20px !important;
          }

          .dashboard-container h2 {
            font-size: 18px !important;
          }

          .dashboard-container > div:first-child {
            padding: 12px 8px !important;
          }

          .dashboard-container > div:first-child > div {
            gap: 10px !important;
          }

          .dashboard-container > div:first-child > div > div:first-child {
            width: 50px !important;
            height: 50px !important;
            font-size: 24px !important;
          }

          .dashboard-container button {
            padding: 14px !important;
            font-size: 15px !important;
          }
        }

        @media (max-width: 576px) {
          .dashboard-container {
            padding: 8px !important;
            padding-bottom: 80px !important;
          }

          .dashboard-container h1 {
            font-size: 18px !important;
          }

          .dashboard-container h2 {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
