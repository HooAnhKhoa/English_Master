import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Alert, Progress, Tag, Spin, Empty, Modal, List } from 'antd';
import {
  BookOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RightOutlined
} from '@ant-design/icons';
import { getReviewDashboard, getVocabDue } from '../services/reviewService';

const ReviewDashboard = () => {
  const navigate = (path) => {
    window.location.hash = path;
  };
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [vocabDueList, setVocabDueList] = useState(null);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

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

  const fetchVocabDue = async (date) => {
    try {
      setLoadingVocab(true);
      setSelectedDate(date);
      const response = await getVocabDue();
      if (response.success) {
        // Filter words by selected date
        const filteredData = {
          ...response.data,
          byTopic: response.data.byTopic.map(topic => ({
            ...topic,
            words: topic.words.filter(word => {
              const reviewDate = new Date(word.next_review);
              const selectedDay = new Date(date);
              return reviewDate.toDateString() === selectedDay.toDateString();
            })
          })).filter(topic => topic.words.length > 0),
          total: 0
        };
        // Recalculate total
        filteredData.total = filteredData.byTopic.reduce((sum, topic) => sum + topic.words.length, 0);
        setVocabDueList(filteredData);
        setShowVocabModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch vocab due:', error);
    } finally {
      setLoadingVocab(false);
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
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f5ff', borderRadius: '8px', border: '1px solid #d6e4ff' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#1890ff' }}>
                💡 <strong>Ghi chú:</strong> Số lượng từ cần ôn mỗi ngày dựa trên thuật toán Spaced Repetition.
                Màu đậm hơn = nhiều từ hơn cần ôn. Ôn đúng lịch giúp ghi nhớ lâu dài!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {upcomingReviews.map((review, index) => {
                const date = new Date(review.date);
                const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
                const dayNum = date.getDate();
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (review.count > 0) {
                        // Show vocab due list modal for selected date
                        fetchVocabDue(review.date);
                      }
                    }}
                    style={{
                      flex: '1 1 calc(14.28% - 8px)',
                      minWidth: '60px',
                      textAlign: 'center',
                      padding: '12px 8px',
                      borderRadius: '8px',
                      backgroundColor: getIntensityColor(review.count),
                      border: isToday ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      position: 'relative',
                      cursor: review.count > 0 ? 'pointer' : 'default',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (review.count > 0) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {isToday && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        •
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      {dayName}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {dayNum}
                    </div>
                    <div style={{ fontSize: '14px', color: '#333', fontWeight: review.count > 0 ? 'bold' : 'normal' }}>
                      {review.count} từ
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: '#666', justifyContent: 'center' }}>
              <span>Ít</span>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#d4edda', borderRadius: '4px' }}></div>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#a8d5ba', borderRadius: '4px' }}></div>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#7bc96f', borderRadius: '4px' }}></div>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#52c41a', borderRadius: '4px' }}></div>
              <span>Nhiều</span>
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

      {/* Modal hiển thị danh sách từ cần ôn */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            📚 Từ cần ôn ngày {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : ''} ({vocabDueList?.total || 0} từ)
          </div>
        }
        open={showVocabModal}
        onCancel={() => setShowVocabModal(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowVocabModal(false)}>
            Đóng
          </Button>,
          <Button
            key="start"
            type="primary"
            onClick={() => {
              setShowVocabModal(false);
              navigate('review/vocab');
            }}
          >
            Bắt đầu ôn tập
          </Button>
        ]}
      >
        {loadingVocab ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : vocabDueList && vocabDueList.byTopic ? (
          <div>
            {vocabDueList.byTopic.map((topic, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: '16px' }}
                title={
                  <div>
                    <span style={{ fontSize: '18px' }}>
                      {topic.icon} {topic.topicName}
                    </span>
                    <Tag color="blue" style={{ marginLeft: '8px' }}>
                      {topic.count} từ
                    </Tag>
                  </div>
                }
              >
                <List
                  dataSource={topic.words}
                  renderItem={(word) => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', marginRight: '8px' }}>
                              {word.word}
                            </span>
                            {word.pronunciation && (
                              <span style={{ color: '#666', fontSize: '14px' }}>
                                {word.pronunciation}
                              </span>
                            )}
                          </div>
                          <div>
                            <Tag color={word.overdue ? 'red' : 'orange'}>
                              {word.level}
                            </Tag>
                            {word.overdue && (
                              <Tag color="red">Quá hạn</Tag>
                            )}
                          </div>
                        </div>
                        <div style={{ color: '#666', marginTop: '4px' }}>
                          {word.meaning}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </div>
        ) : (
          <Empty description="Không có từ nào cần ôn" />
        )}
      </Modal>
    </div>
  );
};

export default ReviewDashboard;
