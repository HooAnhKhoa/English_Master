import React, { useState, useEffect } from 'react';

function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [vocabToday, setVocabToday] = useState(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
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
      padding: '20px'
    }}>
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
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>📖</span>
          <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Today's Goal</h2>
        </div>

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
      </div>

      {/* Progress Overview */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, color: '#333' }}>📊 Progress Overview</h2>

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

export default Dashboard;
