import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Row, Col, Card, Progress, Spin, message, Tag } from 'antd';
import { TrophyOutlined, LockOutlined } from '@ant-design/icons';
import { getAllBadges, getUserBadges } from '../services/profileService';

const { TabPane } = Tabs;

const BadgeGalleryModal = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (visible) {
      loadBadges();
    }
  }, [visible]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const [allRes, userRes] = await Promise.all([
        getAllBadges(),
        getUserBadges()
      ]);

      if (allRes.success) {
        setAllBadges(allRes.data);
      }

      if (userRes.success) {
        setUserBadges(userRes.data);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
      message.error('Không thể tải danh sách huy hiệu');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return '#ff4d4f';
      case 'epic': return '#722ed1';
      case 'rare': return '#1890ff';
      case 'common': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'Huyền thoại';
      case 'epic': return 'Sử thi';
      case 'rare': return 'Hiếm';
      case 'common': return 'Thường';
      default: return 'Không xác định';
    }
  };

  const isEarned = (badgeId) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  const getEarnedDate = (badgeId) => {
    const userBadge = userBadges.find(ub => ub.badge_id === badgeId);
    return userBadge ? new Date(userBadge.earned_at).toLocaleDateString('vi-VN') : null;
  };

  const getProgress = (badge) => {
    // TODO: Calculate actual progress based on badge requirements
    // For now, return mock data
    if (isEarned(badge.id)) return 100;

    // Mock progress calculation
    if (badge.requirement_type === 'words_learned') {
      return Math.min((347 / badge.requirement_value) * 100, 99);
    }
    if (badge.requirement_type === 'streak') {
      return Math.min((12 / badge.requirement_value) * 100, 99);
    }
    return 0;
  };

  const groupByRarity = (badges) => {
    const groups = {
      legendary: [],
      epic: [],
      rare: [],
      common: []
    };

    badges.forEach(badge => {
      if (groups[badge.rarity]) {
        groups[badge.rarity].push(badge);
      }
    });

    return groups;
  };

  const filterBadges = (badges) => {
    if (filter === 'earned') {
      return badges.filter(badge => isEarned(badge.id));
    }
    if (filter === 'not-earned') {
      return badges.filter(badge => !isEarned(badge.id));
    }
    return badges;
  };

  const filteredBadges = filterBadges(allBadges);
  const groupedBadges = groupByRarity(filteredBadges);

  const renderBadgeCard = (badge) => {
    const earned = isEarned(badge.id);
    const progress = getProgress(badge);
    const earnedDate = getEarnedDate(badge.id);

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={badge.id}>
        <Card
          hoverable
          style={{
            textAlign: 'center',
            opacity: earned ? 1 : 0.5,
            border: earned ? `2px solid ${getRarityColor(badge.rarity)}` : '1px solid #d9d9d9',
            position: 'relative'
          }}
        >
          {/* Rarity Tag */}
          <Tag
            color={getRarityColor(badge.rarity)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: '10px'
            }}
          >
            {getRarityLabel(badge.rarity)}
          </Tag>

          {/* Badge Icon */}
          <div
            style={{
              fontSize: '64px',
              marginBottom: '12px',
              filter: earned ? 'none' : 'grayscale(100%)'
            }}
          >
            {earned ? badge.icon : '🔒'}
          </div>

          {/* Badge Name */}
          <h4 style={{ marginBottom: '8px', minHeight: '44px' }}>
            {earned ? badge.name : '???'}
          </h4>

          {/* Badge Description */}
          <p style={{
            fontSize: '12px',
            color: '#666',
            minHeight: '40px',
            marginBottom: '12px'
          }}>
            {earned ? badge.description : 'Huy hiệu bí mật'}
          </p>

          {/* Requirements */}
          <div style={{
            fontSize: '12px',
            color: '#999',
            marginBottom: '12px',
            minHeight: '36px'
          }}>
            {earned ? (
              <div>
                <div style={{ color: '#52c41a', fontWeight: 'bold' }}>✓ Đã đạt</div>
                <div>Ngày: {earnedDate}</div>
              </div>
            ) : (
              <div>
                {badge.requirement_description || 'Điều kiện: ???'}
              </div>
            )}
          </div>

          {/* Progress Bar (for not earned badges) */}
          {!earned && progress > 0 && (
            <div>
              <Progress
                percent={Math.round(progress)}
                size="small"
                strokeColor={getRarityColor(badge.rarity)}
              />
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                {Math.round(progress)}% hoàn thành
              </div>
            </div>
          )}

          {/* Lock Icon for not earned */}
          {!earned && progress === 0 && (
            <div style={{ color: '#d9d9d9' }}>
              <LockOutlined style={{ fontSize: '24px' }} />
            </div>
          )}
        </Card>
      </Col>
    );
  };

  return (
    <Modal
      title={<span><TrophyOutlined /> Bộ sưu tập huy hiệu</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>Đang tải huy hiệu...</p>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <Tabs activeKey={filter} onChange={setFilter} style={{ marginBottom: '16px' }}>
            <TabPane tab={`Tất cả (${allBadges.length})`} key="all" />
            <TabPane tab={`Đã đạt (${userBadges.length})`} key="earned" />
            <TabPane tab={`Chưa đạt (${allBadges.length - userBadges.length})`} key="not-earned" />
          </Tabs>

          {/* Summary Stats */}
          <div style={{
            background: '#f0f2f5',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {userBadges.length}/{allBadges.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Huy hiệu đã đạt</div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {Math.round((userBadges.length / allBadges.length) * 100)}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Hoàn thành</div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {allBadges.length - userBadges.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Còn lại</div>
              </Col>
            </Row>
          </div>

          {/* Badges by Rarity */}
          {Object.entries(groupedBadges).map(([rarity, badges]) => {
            if (badges.length === 0) return null;

            return (
              <div key={rarity} style={{ marginBottom: '32px' }}>
                <h3 style={{
                  color: getRarityColor(rarity),
                  marginBottom: '16px',
                  borderBottom: `2px solid ${getRarityColor(rarity)}`,
                  paddingBottom: '8px'
                }}>
                  {getRarityLabel(rarity)} ({badges.length})
                </h3>
                <Row gutter={[16, 16]}>
                  {badges.map(badge => renderBadgeCard(badge))}
                </Row>
              </div>
            );
          })}

          {filteredBadges.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <TrophyOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>Không có huy hiệu nào</div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default BadgeGalleryModal;
