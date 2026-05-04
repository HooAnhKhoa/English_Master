import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Alert, Progress, Tag, Spin, Empty } from 'antd';
import {
  BookOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RightOutlined
} from '@ant-design/icons';
import { getReviewDashboard } from '../services/reviewService';

const ReviewDashboard = () => {
  const navigate = (path) => {
    window.location.hash = path;
  };
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getReviewDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <Empty description="Không thể tải dữ liệu ôn tập" />
    );
  }

  const { dueToday, weeklyStats, weakAreas, upcomingReviews } = dashboard;
  const totalDue = dueToday.vocab + dueToday.lessons + dueToday.videos;

  // Calculate intensity for heatmap
  const getIntensityColor = (count) => {
    if (count === 0) return '#f0f0f0';
    if (count < 5) return '#d4edda';
    if (count < 10) return '#a8d5ba';
    if (count < 20) return '#7bc96f';
    return '#52c41a';
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy < 60) return 'red';
    if (accuracy < 80) return 'orange';
    return 'green';
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 'bold' }}>
        📚 Ôn Tập
      </h1>

      {/* Alert for overdue items */}
      {totalDue > 0 && (
        <Alert
          message={`🔔 Bạn có ${totalDue} mục cần ôn ngay!`}
          description={`${dueToday.vocab} từ vựng, ${dueToday.lessons} bài học, ${dueToday.videos} video`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: '24px' }}
          action={
            <Button type="primary" size="small" onClick={() => navigate('review/vocab')}>
              Bắt đầu ôn
            </Button>
          }
        />
      )}

      {/* Action Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={24} md={8}>
          <Card
            hoverable
            onClick={() => navigate('review/vocab')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              minHeight: '180px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>
                Ôn Từ Vựng
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '16px' }}>
                {dueToday.vocab} từ cần ôn hôm nay
              </p>
              <Button
                type="default"
                size="large"
                icon={<RightOutlined />}
                style={{ marginTop: 'auto', width: 'fit-content' }}
              >
                Bắt đầu
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Card
            hoverable
            onClick={() => navigate('review/quiz')}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              minHeight: '180px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <TrophyOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>
                Làm Quiz
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '16px' }}>
                Kiểm tra kiến thức của bạn
              </p>
              <Button
                type="default"
                size="large"
                icon={<RightOutlined />}
                style={{ marginTop: 'auto', width: 'fit-content' }}
              >
                Tạo Quiz
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Card
            hoverable
            onClick={() => {
              if (weakAreas.length > 0) {
                navigate(`review/quiz?topicId=${weakAreas[0].topicId}`);
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              minHeight: '180px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <FireOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>
                Luyện Điểm Yếu
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '16px' }}>
                {weakAreas.length > 0 ? `Cải thiện ${weakAreas[0].name}` : 'Chưa có dữ liệu'}
              </p>
              <Button
                type="default"
                size="large"
                icon={<RightOutlined />}
                style={{ marginTop: 'auto', width: 'fit-content' }}
                disabled={weakAreas.length === 0}
              >
                Luyện tập
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Weekly Progress */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="📊 Thống Kê Tuần Này" bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Ngày học"
                  value={weeklyStats.daysStudied}
                  suffix="/ 7 ngày"
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Từ đã ôn"
                  value={weeklyStats.totalWords}
                  prefix={<BookOutlined />}
                />
              </Col>
              <Col span={12} style={{ marginTop: '16px' }}>
                <Statistic
                  title="Thời gian"
                  value={weeklyStats.totalMinutes}
                  suffix="phút"
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={12} style={{ marginTop: '16px' }}>
                <Statistic
                  title="Độ chính xác"
                  value={weeklyStats.accuracy}
                  suffix="%"
                  valueStyle={{ color: weeklyStats.accuracy >= 80 ? '#52c41a' : '#faad14' }}
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="📅 Lịch Ôn Tập 7 Ngày Tới" bordered={false}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {upcomingReviews.map((review, index) => {
                const date = new Date(review.date);
                const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
                const dayNum = date.getDate();

                return (
                  <div
                    key={index}
                    style={{
                      flex: '1 1 calc(14.28% - 8px)',
                      minWidth: '60px',
                      textAlign: 'center',
                      padding: '12px 8px',
                      borderRadius: '8px',
                      backgroundColor: getIntensityColor(review.count),
                      border: '1px solid #d9d9d9'
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      {dayName}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {dayNum}
                    </div>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      {review.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <Card title="⚠️ Lĩnh Vực Cần Cải Thiện" bordered={false}>
          <Row gutter={[16, 16]}>
            {weakAreas.map((area, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => navigate(`review/quiz?topicId=${area.topicId}`)}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ marginBottom: '4px' }}>{area.name}</h3>
                    <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>
                      {area.name_vi} • {area.count} từ
                    </p>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Progress
                      percent={parseFloat(area.accuracy)}
                      strokeColor={getAccuracyColor(parseFloat(area.accuracy))}
                      size="small"
                    />
                  </div>
                  <Tag color={getAccuracyColor(parseFloat(area.accuracy))}>
                    {area.accuracy}% chính xác
                  </Tag>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default ReviewDashboard;
