import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, Switch, Space, message, Divider, Typography, InputNumber } from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import withAdmin from './withAdmin';

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // In production: const res = await axios.get('/api/v1/admin/settings', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setTimeout(() => {
        const mockSettings = {
          // General Settings
          site_name: 'EnglishMaster',
          site_description: 'Learn English with AI-powered lessons',
          maintenance_mode: false,

          // User Settings
          default_level: 'beginner',
          daily_xp_goal: 50,
          new_vocab_per_day: 10,

          // AI Settings
          ai_provider: 'gemini',
          gemini_api_key: 'AIzaSyAfOZLzcoNBLmslD2jMnBaO2tDa4PSpzqk',
          gemini_model: 'gemini-2.0-flash-001',
          openai_api_key: '',

          // Feature Flags
          enable_ai_conversation: true,
          enable_video_lessons: true,
          enable_flashcards: true,
          enable_pronunciation_check: true,

          // Email Settings
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_user: '',
          smtp_password: '',
          email_from: 'noreply@englishmaster.com',

          // Notification Settings
          enable_email_notifications: false,
          enable_push_notifications: false,
        };

        form.setFieldsValue(mockSettings);
        setInitialLoading(false);
      }, 800);
    } catch (error) {
      console.error('Failed to fetch settings', error);
      message.error('Failed to load settings');
      setInitialLoading(false);
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // await axios.put('/api/v1/admin/settings', values, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setTimeout(() => {
        message.success('Settings saved successfully');
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Failed to save settings');
      setLoading(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    message.info('Settings reset to saved values');
  };

  if (initialLoading) {
    return (
      <Card loading={true} style={{ borderRadius: 12 }}>
        <div style={{ height: 400 }} />
      </Card>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <SettingOutlined style={{ fontSize: 20 }} />
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>System Settings</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Reset
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => form.submit()}
            >
              Save Changes
            </Button>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* General Settings */}
          <Title level={4}>General Settings</Title>
          <Divider style={{ marginTop: 8, marginBottom: 24 }} />

          <Form.Item
            name="site_name"
            label="Site Name"
            rules={[{ required: true, message: 'Please enter site name' }]}
          >
            <Input placeholder="EnglishMaster" />
          </Form.Item>

          <Form.Item
            name="site_description"
            label="Site Description"
          >
            <TextArea rows={2} placeholder="Learn English with AI-powered lessons" />
          </Form.Item>

          <Form.Item
            name="maintenance_mode"
            label="Maintenance Mode"
            valuePropName="checked"
          >
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
          </Form.Item>

          {/* User Settings */}
          <Title level={4} style={{ marginTop: 40 }}>User Settings</Title>
          <Divider style={{ marginTop: 8, marginBottom: 24 }} />

          <Form.Item
            name="default_level"
            label="Default Level for New Users"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="beginner">Beginner</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="advanced">Advanced</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="daily_xp_goal"
            label="Daily XP Goal"
            rules={[{ required: true }]}
          >
            <InputNumber min={10} max={500} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="new_vocab_per_day"
            label="New Vocabulary Per Day"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={50} style={{ width: '100%' }} />
          </Form.Item>

          {/* AI Settings */}
          <Title level={4} style={{ marginTop: 40 }}>AI Settings</Title>
          <Divider style={{ marginTop: 8, marginBottom: 24 }} />

          <Form.Item
            name="ai_provider"
            label="AI Provider"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="gemini">Google Gemini</Option>
              <Option value="openai">OpenAI</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="gemini_api_key"
            label="Gemini API Key"
          >
            <Input.Password placeholder="AIzaSy..." />
          </Form.Item>

          <Form.Item
            name="gemini_model"
            label="Gemini Model"
          >
            <Select>
              <Option value="gemini-2.0-flash-001">Gemini 2.0 Flash</Option>
              <Option value="gemini-1.5-pro">Gemini 1.5 Pro</Option>
              <Option value="gemini-pro">Gemini Pro</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="openai_api_key"
            label="OpenAI API Key"
          >
            <Input.Password placeholder="sk-proj-..." />
          </Form.Item>

          {/* Feature Flags */}
          <Title level={4} style={{ marginTop: 40 }}>Feature Flags</Title>
          <Divider style={{ marginTop: 8, marginBottom: 24 }} />

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item
              name="enable_ai_conversation"
              label="Enable AI Conversation"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>

            <Form.Item
              name="enable_video_lessons"
              label="Enable Video Lessons"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>

            <Form.Item
              name="enable_flashcards"
              label="Enable Flashcards"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>

            <Form.Item
              name="enable_pronunciation_check"
              label="Enable Pronunciation Check"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Space>

          {/* Email Settings */}
          <Title level={4} style={{ marginTop: 40 }}>Email Settings</Title>
          <Divider style={{ marginTop: 8, marginBottom: 24 }} />

          <Form.Item
            name="smtp_host"
            label="SMTP Host"
          >
            <Input placeholder="smtp.gmail.com" />
          </Form.Item>

          <Form.Item
            name="smtp_port"
            label="SMTP Port"
          >
            <InputNumber min={1} max={65535} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="smtp_user"
            label="SMTP Username"
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            name="smtp_password"
            label="SMTP Password"
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item
            name="email_from"
            label="Email From Address"
          >
            <Input placeholder="noreply@englishmaster.com" />
          </Form.Item>

          {/* Notification Settings */}
          <Title level={4} style={{ marginTop: 40 }}>Notification Settings</Title>
          <Divider style={{ marginTop: 8, marginBottom: 24 }} />

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item
              name="enable_email_notifications"
              label="Enable Email Notifications"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>

            <Form.Item
              name="enable_push_notifications"
              label="Enable Push Notifications"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Space>

          <Divider style={{ marginTop: 40, marginBottom: 24 }} />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Reset
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={loading}
              >
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default withAdmin(AdminSettings);
