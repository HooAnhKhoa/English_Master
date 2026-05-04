import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Select, Button, Tag, Space, Drawer, Form, message, Popconfirm, Statistic, Row, Col } from 'antd';
import {
  SearchOutlined,
  TrophyOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import withAdmin from './withAdmin';
import useResponsive from './useResponsive';

const { Option } = Select;

const AdminQuizzes = () => {
  const { isMobile } = useResponsive();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewingQuiz, setViewingQuiz] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    avgScore: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      // Fetch all quizzes (admin endpoint)
      const response = await axios.get(`${API_URL}/admin/quizzes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const quizData = response.data.data;
        setQuizzes(quizData);

        // Calculate stats
        const completed = quizData.filter(q => q.status === 'completed');
        const totalScore = completed.reduce((sum, q) => sum + q.score, 0);
        const totalQuestions = quizData.reduce((sum, q) => sum + q.total_questions, 0);

        setStats({
          total: quizData.length,
          completed: completed.length,
          avgScore: completed.length > 0 ? Math.round(totalScore / completed.length) : 0,
          totalQuestions
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch quizzes', error);
      message.error('Failed to load quizzes');
      setLoading(false);
    }
  };

  const handleView = async (quiz) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      // Fetch quiz with questions
      const response = await axios.get(`${API_URL}/admin/quizzes/${quiz.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setViewingQuiz(response.data.data);
        setDrawerVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch quiz details', error);
      message.error('Failed to load quiz details');
    }
  };

  const handleDelete = async (quizId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      await axios.delete(`${API_URL}/admin/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      message.success('Quiz deleted successfully');
      fetchQuizzes(); // Refresh stats
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete quiz');
    }
  };

  const getTypeColor = (type) => {
    const colors = { vocab: 'blue', lesson: 'green', mixed: 'purple' };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = { completed: 'success', 'in-progress': 'processing', abandoned: 'default' };
    return colors[status] || 'default';
  };

  const getLevelColor = (level) => {
    const colors = { A1: 'green', A2: 'cyan', B1: 'blue', B2: 'purple', C1: 'orange', C2: 'red' };
    return colors[level] || 'default';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchSearch = quiz.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                       quiz.user?.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === 'all' || quiz.type === filterType;
    const matchStatus = filterStatus === 'all' || quiz.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const columns = isMobile ? [
    {
      title: 'Quizzes',
      key: 'mobile',
      render: (_, record) => (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
          cursor: 'pointer'
        }}
        onClick={() => handleView(record)}
        >
          <Space align="start" style={{ flex: 1 }}>
            <TrophyOutlined style={{ fontSize: 24, color: record.score >= 80 ? '#52c41a' : record.score >= 60 ? '#faad14' : '#ff4d4f' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
                {record.user?.username || 'Unknown User'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4, flexWrap: 'wrap' }}>
                <Tag color={getTypeColor(record.type)} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                  {record.type}
                </Tag>
                {record.level && (
                  <Tag color={getLevelColor(record.level)} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                    {record.level}
                  </Tag>
                )}
                <Tag color={getStatusColor(record.status)} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                  {record.status}
                </Tag>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                📊 {record.score}% • ✅ {record.correct_answers}/{record.total_questions} • ⏱️ {formatDuration(record.time_spent_sec)}
              </div>
            </div>
          </Space>
          <Space direction="vertical" size={4} style={{ marginLeft: 8 }}>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleView(record);
              }}
            />
            <Popconfirm
              title="Delete?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(record.id);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Space>
        </div>
      ),
    },
  ] : [
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.user?.username || 'Unknown'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag color={getTypeColor(type)}>{type}</Tag>,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level) => level ? <Tag color={getLevelColor(level)}>{level}</Tag> : '-',
    },
    {
      title: 'Questions',
      key: 'questions',
      width: 100,
      render: (_, record) => (
        <span>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
          {record.correct_answers}/{record.total_questions}
        </span>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score) => (
        <Tag color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'}>
          {score}%
        </Tag>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time_spent_sec',
      key: 'time',
      width: 100,
      render: (time) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {formatDuration(time)}
        </span>
      ),
    },
    {
      title: 'XP',
      dataIndex: 'xp_earned',
      key: 'xp',
      width: 80,
      render: (xp) => <Tag color="gold">+{xp}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'completed_at',
      key: 'date',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this quiz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      <h1 style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '16px' }}>
        <TrophyOutlined /> Quiz Management
      </h1>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Quizzes"
              value={stats.total}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Avg Score"
              value={stats.avgScore}
              suffix="%"
              valueStyle={{ color: stats.avgScore >= 80 ? '#52c41a' : stats.avgScore >= 60 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Questions"
              value={stats.totalQuestions}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: '100%', marginBottom: '16px' }}>
          <Input
            placeholder="Search by user..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? '100%' : 200 }}
          />
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: isMobile ? '100%' : 120 }}
          >
            <Option value="all">All Types</Option>
            <Option value="vocab">Vocab</Option>
            <Option value="lesson">Lesson</Option>
            <Option value="mixed">Mixed</Option>
          </Select>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: isMobile ? '100%' : 140 }}
          >
            <Option value="all">All Status</Option>
            <Option value="completed">Completed</Option>
            <Option value="in-progress">In Progress</Option>
            <Option value="abandoned">Abandoned</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredQuizzes}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: isMobile ? 10 : 20,
            showSizeChanger: !isMobile,
            showTotal: (total) => `Total ${total} quizzes`,
          }}
          scroll={isMobile ? {} : { x: 1200 }}
          showHeader={!isMobile}
        />
      </Card>

      {/* View Quiz Drawer */}
      <Drawer
        title="Quiz Details"
        placement="right"
        width={isMobile ? '100%' : 600}
        onClose={() => {
          setDrawerVisible(false);
          setViewingQuiz(null);
        }}
        open={drawerVisible}
      >
        {viewingQuiz && (
          <div>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="User" value={viewingQuiz.user?.username} />
                </Col>
                <Col span={12}>
                  <Statistic title="Score" value={viewingQuiz.score} suffix="%" />
                </Col>
                <Col span={12} style={{ marginTop: '16px' }}>
                  <Statistic title="Correct" value={viewingQuiz.correct_answers} suffix={`/${viewingQuiz.total_questions}`} />
                </Col>
                <Col span={12} style={{ marginTop: '16px' }}>
                  <Statistic title="XP Earned" value={viewingQuiz.xp_earned} prefix="+" />
                </Col>
              </Row>
            </Card>

            <h3>Questions</h3>
            {viewingQuiz.questions?.map((q, index) => (
              <Card key={q.id} size="small" style={{ marginBottom: '12px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <Tag color="blue">Q{index + 1}</Tag>
                  <Tag color={q.is_correct ? 'success' : 'error'}>
                    {q.is_correct ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  </Tag>
                </div>
                <p><strong>Question:</strong> {q.question_text}</p>
                <p><strong>Correct Answer:</strong> <Tag color="success">{q.correct_answer}</Tag></p>
                {q.user_answer && (
                  <p><strong>User Answer:</strong> <Tag color={q.is_correct ? 'success' : 'error'}>{q.user_answer}</Tag></p>
                )}
                {q.explanation && (
                  <p style={{ fontSize: '12px', color: '#666' }}>💡 {q.explanation}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default withAdmin(AdminQuizzes);
