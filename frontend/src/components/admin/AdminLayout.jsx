import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Drawer } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ReadOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import './AdminResponsive.css';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children, currentPage, onNavigate }) => {
  const [collapsed, setSiderCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSiderCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { key: 'admin-dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'admin-users', icon: <UserOutlined />, label: 'Users' },
    { key: 'admin-topics', icon: <GlobalOutlined />, label: 'Topics' },
    { key: 'admin-vocabulary', icon: <ReadOutlined />, label: 'Vocabulary' },
    { key: 'admin-videos', icon: <VideoCameraOutlined />, label: 'Videos' },
    { key: 'admin-quizzes', icon: <ReadOutlined />, label: 'Quizzes' },
    { key: 'admin-settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleMenuClick = (key) => {
    onNavigate(key);
    if (isMobile) {
      setMobileDrawerVisible(false);
    }
  };

  const userMenu = (
    <Menu items={[
      { key: 'profile', icon: <UserOutlined />, label: 'Admin Profile' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
    ]} />
  );

  const sidebarContent = (
    <>
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#001529',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: collapsed && !isMobile ? 12 : 18 }}>
          {collapsed && !isMobile ? 'EM' : 'EnglishMaster'}
        </span>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[currentPage]}
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
        style={{ borderRight: 0, marginTop: 10 }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          style={{
            boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
            zIndex: 10,
            position: 'fixed',
            height: '100vh',
            left: 0
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          bodyStyle={{ padding: 0 }}
          width={250}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), transition: 'all 0.2s' }}>
        <Header style={{
          background: 'white',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
          width: '100%'
        }}>
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setMobileDrawerVisible(true) : setSiderCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24 }}>
            {!isMobile && (
              <Button
                type="link"
                icon={<GlobalOutlined />}
                onClick={() => window.location.hash = 'home'}
              >
                Back to App
              </Button>
            )}

            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>

            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                {!isMobile && <span>{user.full_name || user.username}</span>}
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content style={{
          margin: isMobile ? '16px 8px' : '24px 16px',
          padding: isMobile ? 16 : 24,
          background: 'transparent',
          minHeight: 280
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
