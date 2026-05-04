import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Avatar, Button, Tag, Tabs, Spin, message, Modal } from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  FireOutlined,
  BookOutlined,
  ClockCircleOutlined,
  StarOutlined,
  EditOutlined,
  SettingOutlined,
  CrownOutlined
} from '@ant-design/icons';
import CountUp from 'react-countup';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import BadgeGalleryModal from './BadgeGalleryModal';
import { getProfile, getDetailedStats, getActivityFeed } from '../services/profileService';

const { TabPane } = Tabs;

const ProfilePage = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('7days');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes, activityRes] = await Promise.all([
        getProfile(),
        getDetailedStats(),
        getActivityFeed(1, 20)
      ]);

      if (profileRes.success) {
        setProfileData(profileRes.data);
      }

      if (statsRes.success) {
        setDetailedStats(statsRes.data);
      }

      if (activityRes.success) {
        setActivityFeed(activityRes.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      message.error('Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    if (level >= 10) return '#FFD700'; // Gold
    if (level >= 7) return '#C0C0C0'; // Silver
    if (level >= 4) return '#CD7F32'; // Bronze
    return '#95a5a6'; // Gray
  };

  const getLevelBadge = (level) => {
    if (level >= 10) return '💎';
    if (level >= 7) return '🥇';
    if (level >= 4) return '🥈';
    return '🥉';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'word_learned': return '📚';
      case 'lesson_completed': return '✅';
      case 'badge_earned': return '🏆';
      case 'quiz_done': return '📝';
      case 'streak_milestone': return '🔥';
      default: return '⭐';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Đang tải profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return <div>Không thể tải thông tin profile</div>;
  }

  const { user: userData, stats, recentBadges, levelProgress } = profileData;

  // Prepare chart data
  const chartData = detailedStats?.activity?.[chartPeriod === '7days' ? 'last7days' : 'last30days'] || [];
  const formattedChartData = chartData.map(item => ({
    date: new Date(item.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    'Từ học': item.words,
    'XP': item.xp
  }));

  // Vocabulary pie chart data
  const vocabData = detailedStats?.vocabulary ? [
    { name: 'Chưa học', value: detailedStats.vocabulary.notStarted, color: '#d9d9d9' },
    { name: 'Đang học', value: detailedStats.vocabulary.inProgress, color: '#1890ff' },
    { name: 'Hoàn thành', value: detailedStats.vocabulary.completed, color: '#52c41a' },
    { name: 'Đã thuộc', value: detailedStats.vocabulary.mastered, color: '#faad14' }
  ].filter(item => item.value > 0) : [];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* SECTION 1 - Hero/Header */}
      <Card style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Row gutter={24} align="middle">
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              src={userData.avatar}
              icon={<UserOutlined />}
              style={{ border: '4px solid white', cursor: 'pointer' }}
              onClick={() => setShowEditModal(true)}
            />
            <div style={{ marginTop: '12px', color: 'white' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Học viên từ {formatDate(userData.createdAt)}
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ color: 'white' }}>
              <h1 style={{ color: 'white', marginBottom: '8px', fontSize: '32px' }}>
                {userData.fullName || userData.username}
              </h1>
              <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '16px' }}>
                @{userData.username}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <Tag
                  color={getLevelColor(userData.level)}
                  style={{ fontSize: '16px', padding: '4px 12px', border: 'none' }}
                >
                  {getLevelBadge(userData.level)} Level {userData.level}
                </Tag>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Progress
                  percent={parseFloat(levelProgress.percentage)}
                  strokeColor="#52c41a"
                  trailColor="rgba(255,255,255,0.3)"
                  format={() => `${userData.xp} XP`}
                />
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {stats.xpToNextLevel > 0
                  ? `Còn ${stats.xpToNextLevel} XP để lên Level ${levelProgress.currentLevel + 1}`
                  : 'Đã đạt level tối đa!'}
              </div>
            </div>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="large"
              onClick={() => setShowEditModal(true)}
              style={{ marginBottom: '8px', width: '100%' }}
            >
              Chỉnh sửa hồ sơ
            </Button>
            <Button
              icon={<SettingOutlined />}
              size="large"
              onClick={() => setShowPasswordModal(true)}
              style={{ width: '100%' }}
            >
              Đổi mật khẩu
            </Button>
          </Col>
        </Row>
      </Card>

      {/* SECTION 2 - Stats Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔥</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff4d4f' }}>
                <CountUp end={stats.currentStreak} duration={2} />
              </div>
              <div style={{ color: '#666' }}>Streak (ngày)</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>📚</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                <CountUp end={stats.totalWordsLearned} duration={2} />
              </div>
              <div style={{ color: '#666' }}>Từ đã học</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>📖</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                <CountUp end={stats.totalLessonsCompleted} duration={2} />
              </div>
              <div style={{ color: '#666' }}>Bài hoàn thành</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>⭐</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>
                <CountUp end={userData.xp} duration={2} />
              </div>
              <div style={{ color: '#666' }}>Tổng XP</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎯</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#722ed1' }}>
                <CountUp end={stats.averageAccuracy} duration={2} decimals={0} />%
              </div>
              <div style={{ color: '#666' }}>Độ chính xác</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>⏱️</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#13c2c2' }}>
                <CountUp end={stats.totalStudyMinutes} duration={2} />
              </div>
              <div style={{ color: '#666' }}>Phút học tập</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* SECTION 3 - Badges */}
      <Card
        title={<span><TrophyOutlined /> Huy hiệu</span>}
        extra={<Button type="link" onClick={() => setShowBadgeModal(true)}>Xem tất cả</Button>}
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={16}>
          {recentBadges.length > 0 ? (
            recentBadges.map(badge => (
              <Col xs={12} sm={8} md={4} key={badge.id} style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title={`${badge.name} - ${badge.description}\nĐạt: ${new Date(badge.earnedAt).toLocaleDateString('vi-VN')}`}
                >
                  {badge.icon}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{badge.name}</div>
              </Col>
            ))
          ) : (
            <Col span={24} style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
              <div style={{ color: '#999' }}>Chưa có huy hiệu nào</div>
              <div style={{ color: '#999', fontSize: '14px' }}>Tiếp tục học tập để nhận huy hiệu!</div>
            </Col>
          )}
        </Row>
      </Card>

      {/* SECTION 4 - Activity Chart */}
      <Card
        title="Biểu đồ tiến độ học"
        extra={
          <Tabs activeKey={chartPeriod} onChange={setChartPeriod} size="small">
            <TabPane tab="7 ngày" key="7days" />
            <TabPane tab="30 ngày" key="30days" />
          </Tabs>
        }
        style={{ marginBottom: '24px' }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="Từ học" fill="#1890ff" />
            <Bar yAxisId="right" dataKey="XP" fill="#52c41a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={16}>
        {/* SECTION 5 - Vocabulary Analysis */}
        <Col xs={24} md={12}>
          <Card title="Phân tích từ vựng" style={{ marginBottom: '24px' }}>
            {vocabData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={vocabData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vocabData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: '16px' }}>
                  <h4>Theo cấp độ:</h4>
                  {detailedStats?.vocabulary?.byLevel && Object.entries(detailedStats.vocabulary.byLevel).map(([level, count]) => (
                    count > 0 && (
                      <div key={level} style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>{level}</span>
                          <span>{count} từ</span>
                        </div>
                        <Progress percent={(count / detailedStats.vocabulary.total * 100).toFixed(0)} size="small" />
                      </div>
                    )
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                Chưa có dữ liệu từ vựng
              </div>
            )}
          </Card>
        </Col>

        {/* SECTION 6 - Activity Feed */}
        <Col xs={24} md={12}>
          <Card title="Hoạt động gần đây" style={{ marginBottom: '24px' }}>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {activityFeed.length > 0 ? (
                activityFeed.map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginRight: '16px' }}>
                      {activity.icon || getActivityIcon(activity.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div>{activity.description}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {getRelativeTime(activity.createdAt)}
                      </div>
                    </div>
                    {activity.xpEarned > 0 && (
                      <Tag color="gold">+{activity.xpEarned} XP</Tag>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  Chưa có hoạt động nào
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        userData={userData}
        onSuccess={loadProfileData}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <BadgeGalleryModal
        visible={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
      />
    </div>
  );
};

export default ProfilePage;
