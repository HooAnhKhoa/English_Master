import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, List, Tag } from 'antd';
import { Avatar } from 'antd';
import {
  UserOutlined,
  ReadOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import withAdmin from './withAdmin';

const { Title } = Typography;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTopics: 0,
    totalVocab: 0,
    totalVideos: 0
  });

  const [topicStats, setTopicStats] = useState([]);
  const [topicAccessStats, setTopicAccessStats] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);

  // Collapse states
  const [collapsedSections, setCollapsedSections] = useState({
    userActivity: false,
    vocabByTopic: false,
    topicAccess: false,
    topicDistribution: false,
    recentUsers: false
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [usersRes, topicsRes, vocabRes, topicAccessRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers }),
        axios.get(`${API_URL}/topics`, { headers }),
        axios.get(`${API_URL}/vocabularies?limit=1000`, { headers }),
        axios.get(`${API_URL}/topics/stats/access?limit=10`, { headers })
      ]);

      // Set stats
      setStats({
        totalUsers: usersRes.data.pagination?.total || usersRes.data.data?.length || 0,
        totalTopics: topicsRes.data.pagination?.total || topicsRes.data.data?.length || 0,
        totalVocab: vocabRes.data.pagination?.total || vocabRes.data.data?.length || 0,
        totalVideos: 0 // Will be updated when video API is ready
      });

      // Process topic stats for chart
      if (topicsRes.data.success && topicsRes.data.data) {
        const topicData = topicsRes.data.data.map(topic => ({
          name: topic.name_vi || topic.name,
          words: topic.word_count || 0,
          icon: topic.icon
        }));
        setTopicStats(topicData);
      }

      // Process topic access stats
      if (topicAccessRes.data.success && topicAccessRes.data.data) {
        const accessData = topicAccessRes.data.data.map(topic => ({
          name: topic.name_vi || topic.name,
          views: topic.access_count || 0,
          icon: topic.icon
        }));
        setTopicAccessStats(accessData);
      }

      // Process recent users
      if (usersRes.data.success && usersRes.data.data) {
        const users = usersRes.data.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            xp: user.xp || 0,
            created_at: user.created_at
          }));
        setRecentUsers(users);

        // Generate user activity chart data (last 7 days)
        const activityData = [];
        const allUsers = usersRes.data.data;

        console.log('Sample user data:', allUsers[0]); // Debug log

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          // Count users who logged in on this day (using last_login_date)
          const activeUsers = allUsers.filter(user => {
            if (!user.last_login_date) return false;
            const loginDate = new Date(user.last_login_date).toISOString().split('T')[0];
            return loginDate === dateStr;
          }).length;

          // Count new registrations on this day (check both created_at and createdAt)
          const newUsers = allUsers.filter(user => {
            const createdDate = user.created_at || user.createdAt;
            if (!createdDate) return false;
            const dateOnly = new Date(createdDate).toISOString().split('T')[0];
            return dateOnly === dateStr;
          }).length;

          activityData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            active: activeUsers,
            new: newUsers
          });
        }

        console.log('Activity data:', activityData); // Debug log
        setUserActivityData(activityData);
      }

    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="admin-dashboard">
      <Title level={2} style={{ marginBottom: 24 }}>Dashboard Overview</Title>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: window.innerWidth < 768 ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Total Topics"
              value={stats.totalTopics}
              prefix={<FolderOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: window.innerWidth < 768 ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Total Vocabulary"
              value={stats.totalVocab}
              prefix={<ReadOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: window.innerWidth < 768 ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Total Videos"
              value={stats.totalVideos}
              prefix={<VideoCameraOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold', fontSize: window.innerWidth < 768 ? 20 : 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card
            title="User Activity (Last 7 Days)"
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            extra={
              <span
                onClick={() => toggleSection('userActivity')}
                style={{ cursor: 'pointer', fontSize: 16 }}
              >
                {collapsedSections.userActivity ? <DownOutlined /> : <UpOutlined />}
              </span>
            }
          >
            {!collapsedSections.userActivity && (
              <div style={{ height: 300 }}>
                {userActivityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userActivityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="active" name="Active Users" stroke="#1890ff" strokeWidth={2} />
                      <Line type="monotone" dataKey="new" name="New Registrations" stroke="#52c41a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p style={{ color: '#999' }}>No activity data available</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Most Accessed Topics"
            bordered={false}
            style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            extra={
              <span
                onClick={() => toggleSection('topicAccess')}
                style={{ cursor: 'pointer', fontSize: 16 }}
              >
                {collapsedSections.topicAccess ? <DownOutlined /> : <UpOutlined />}
              </span>
            }
          >
            {!collapsedSections.topicAccess && (
              <div style={{ height: 300 }}>
                {topicAccessStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicAccessStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="views" name="Views" fill="#52c41a" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p style={{ color: '#999' }}>No access data available</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Vocabulary by Topic"
            bordered={false}
            style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            extra={
              <span
                onClick={() => toggleSection('vocabByTopic')}
                style={{ cursor: 'pointer', fontSize: 16 }}
              >
                {collapsedSections.vocabByTopic ? <DownOutlined /> : <UpOutlined />}
              </span>
            }
          >
            {!collapsedSections.vocabByTopic && (
              <div style={{ height: 300 }}>
                {topicStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="words" name="Words" fill="#1890ff" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p style={{ color: '#999' }}>No topic data available</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card
            title="Topic Distribution"
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            extra={
              <span
                onClick={() => toggleSection('topicDistribution')}
                style={{ cursor: 'pointer', fontSize: 16 }}
              >
                {collapsedSections.topicDistribution ? <DownOutlined /> : <UpOutlined />}
              </span>
            }
          >
            {!collapsedSections.topicDistribution && (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {topicStats.length > 0 ? (
                  <List
                    dataSource={topicStats}
                    renderItem={item => (
                      <List.Item style={{ padding: '12px 0' }}>
                        <List.Item.Meta
                          avatar={<span style={{ fontSize: 24 }}>{item.icon || '📚'}</span>}
                          title={item.name}
                          description={`${item.words} words`}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <p style={{ color: '#999' }}>No topics available</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Users */}
      <Card
        title="Recent Users"
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        extra={
          <span
            onClick={() => toggleSection('recentUsers')}
            style={{ cursor: 'pointer', fontSize: 16 }}
          >
            {collapsedSections.recentUsers ? <DownOutlined /> : <UpOutlined />}
          </span>
        }
      >
        {!collapsedSections.recentUsers && (
          <>
            {recentUsers.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={recentUsers}
                renderItem={user => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ backgroundColor: user.role === 'admin' ? '#722ed1' : '#1890ff' }}
                          icon={<UserOutlined />}
                        />
                      }
                      title={
                        <span>
                          <strong>{user.username}</strong>
                          {user.role === 'admin' && (
                            <Tag color="purple" style={{ marginLeft: 8 }}>Admin</Tag>
                          )}
                        </span>
                      }
                      description={
                        <span>
                          {user.email} • {user.xp} XP • Joined {getTimeAgo(user.created_at)}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <UserOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>No users found</p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default withAdmin(AdminDashboard);
