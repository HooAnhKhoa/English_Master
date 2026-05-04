import React, { useState, useEffect } from 'react';
import { Card, Calendar, Badge, Statistic, Row, Col, Tag, Spin, Empty, Tooltip } from 'antd';
import {
  TrophyOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import { getReviewHistory } from '../services/reviewService';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const ReviewHistory = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getReviewHistory();
      if (response.success) {
        setHistory(response.data.history);
        setStats({
          totalDays: response.data.totalDays,
          averageAccuracy: response.data.averageAccuracy
        });
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateData = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return history.find(h => h.review_date === dateStr);
  };

  const dateCellRender = (value) => {
    const data = getDateData(value);
    if (!data) return null;

    const intensity = data.total_questions;
    let color = '#f0f0f0';

    if (intensity > 0 && intensity < 10) color = '#d4edda';
    else if (intensity >= 10 && intensity < 20) color = '#a8d5ba';
    else if (intensity >= 20 && intensity < 30) color = '#7bc96f';
    else if (intensity >= 30) color = '#52c41a';

    return (
      <Tooltip
        title={
          <div>
            <div><strong>{value.format('DD/MM/YYYY')}</strong></div>
            <div>Từ đã ôn: {data.words_reviewed}</div>
            <div>Quiz: {data.quizzes_completed}</div>
            <div>Độ chính xác: {data.accuracy}%</div>
            <div>XP: +{data.xp_earned}</div>
          </div>
        }
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: color,
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {intensity > 0 && intensity}
        </div>
      </Tooltip>
    );
  };

  const onSelect = (date) => {
    const data = getDateData(date);
    setSelectedDate(data);
  };

  // Prepare chart data (last 7 days)
  const chartData = history
    .slice(0, 7)
    .reverse()
    .map(h => ({
      date: new Date(h.review_date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
      accuracy: parseFloat(h.accuracy),
      questions: h.total_questions
    }));

  // Calculate total stats
  const totalWords = history.reduce((sum, h) => sum + h.words_reviewed, 0);
  const totalQuizzes = history.reduce((sum, h) => sum + h.quizzes_completed, 0);
  const totalXP = history.reduce((sum, h) => sum + h.xp_earned, 0);
  const totalMinutes = history.reduce((sum, h) => sum + h.time_spent_minutes, 0);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 'bold' }}>
          📅 Lịch Sử Ôn Tập
        </h1>
        <Empty description="Chưa có lịch sử ôn tập. Hãy bắt đầu học ngay!" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 'bold' }}>
        📅 Lịch Sử Ôn Tập
      </h1>

      {/* Overall Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng ngày học"
              value={stats?.totalDays || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Từ đã ôn"
              value={totalWords}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Quiz hoàn thành"
              value={totalQuizzes}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Độ chính xác TB"
              value={stats?.averageAccuracy || 0}
              suffix="%"
              prefix={<FireOutlined />}
              valueStyle={{
                color: stats?.averageAccuracy >= 80 ? '#52c41a' : stats?.averageAccuracy >= 60 ? '#faad14' : '#ff4d4f'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Accuracy Chart */}
      <Card title="📈 Biểu Đồ Độ Chính Xác (7 Ngày Gần Nhất)" style={{ marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="accuracy"
              stroke="#52c41a"
              strokeWidth={2}
              name="Độ chính xác (%)"
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="questions"
              stroke="#1890ff"
              strokeWidth={2}
              name="Số câu hỏi"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Calendar Heatmap */}
      <Card title="🗓️ Lịch Ôn Tập (30 Ngày)" style={{ marginBottom: '24px' }}>
        <Calendar
          dateCellRender={dateCellRender}
          onSelect={onSelect}
        />
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Cường độ:</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }} />
            <span style={{ fontSize: '12px' }}>Không học</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#d4edda', borderRadius: '4px' }} />
            <span style={{ fontSize: '12px' }}>1-9 câu</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#a8d5ba', borderRadius: '4px' }} />
            <span style={{ fontSize: '12px' }}>10-19 câu</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#7bc96f', borderRadius: '4px' }} />
            <span style={{ fontSize: '12px' }}>20-29 câu</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#52c41a', borderRadius: '4px' }} />
            <span style={{ fontSize: '12px' }}>30+ câu</span>
          </div>
        </div>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card title={`📊 Chi Tiết Ngày ${new Date(selectedDate.review_date).toLocaleDateString('vi-VN')}`}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Statistic
                title="Từ đã ôn"
                value={selectedDate.words_reviewed}
                prefix={<BookOutlined />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Quiz hoàn thành"
                value={selectedDate.quizzes_completed}
                prefix={<TrophyOutlined />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Độ chính xác"
                value={selectedDate.accuracy}
                suffix="%"
                valueStyle={{
                  color: selectedDate.accuracy >= 80 ? '#52c41a' : selectedDate.accuracy >= 60 ? '#faad14' : '#ff4d4f'
                }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="XP kiếm được"
                value={selectedDate.xp_earned}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Thời gian học"
                value={selectedDate.time_spent_minutes}
                suffix="phút"
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Tổng câu hỏi"
                value={selectedDate.total_questions}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Câu đúng"
                value={selectedDate.correct_answers}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Câu sai"
                value={selectedDate.total_questions - selectedDate.correct_answers}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Recent History List */}
      <Card title="📜 Lịch Sử Gần Đây" style={{ marginTop: '24px' }}>
        {history.slice(0, 10).map((item, index) => (
          <Card
            key={index}
            size="small"
            style={{ marginBottom: '12px', cursor: 'pointer' }}
            onClick={() => setSelectedDate(item)}
            hoverable
          >
            <Row align="middle" gutter={16}>
              <Col xs={24} sm={6}>
                <strong>{new Date(item.review_date).toLocaleDateString('vi-VN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</strong>
              </Col>
              <Col xs={12} sm={4}>
                <Tag color="blue">{item.words_reviewed} từ</Tag>
              </Col>
              <Col xs={12} sm={4}>
                <Tag color="purple">{item.quizzes_completed} quiz</Tag>
              </Col>
              <Col xs={12} sm={5}>
                <Tag color={item.accuracy >= 80 ? 'green' : item.accuracy >= 60 ? 'orange' : 'red'}>
                  {item.accuracy}% chính xác
                </Tag>
              </Col>
              <Col xs={12} sm={5}>
                <Tag color="gold">+{item.xp_earned} XP</Tag>
              </Col>
            </Row>
          </Card>
        ))}
      </Card>
    </div>
  );
};

export default ReviewHistory;
