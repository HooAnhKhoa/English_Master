import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Progress } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined } from '@ant-design/icons';
import { changePassword } from '../services/profileService';

const ChangePasswordModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;

    // Length
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 15;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 15;

    // Contains numbers
    if (/[0-9]/.test(password)) strength += 10;

    // Contains special characters
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 30) return '#ff4d4f';
    if (strength < 60) return '#faad14';
    if (strength < 80) return '#1890ff';
    return '#52c41a';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 30) return 'Yếu';
    if (strength < 60) return 'Trung bình';
    if (strength < 80) return 'Khá';
    return 'Mạnh';
  };

  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const response = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      if (response.success) {
        message.success('Đổi mật khẩu thành công!');
        form.resetFields();
        setPasswordStrength(0);
        onClose();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      message.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPasswordStrength(0);
    onClose();
  };

  return (
    <Modal
      title={<span><LockOutlined /> Đổi mật khẩu</span>}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Current Password */}
        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu hiện tại"
            size="large"
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            visibilityToggle={{
              visible: showCurrentPassword,
              onVisibleChange: setShowCurrentPassword
            }}
          />
        </Form.Item>

        {/* New Password */}
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('currentPassword') !== value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu mới phải khác mật khẩu hiện tại!'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu mới"
            size="large"
            onChange={handleNewPasswordChange}
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            visibilityToggle={{
              visible: showNewPassword,
              onVisibleChange: setShowNewPassword
            }}
          />
        </Form.Item>

        {/* Password Strength Indicator */}
        {passwordStrength > 0 && (
          <div style={{ marginTop: '-16px', marginBottom: '16px' }}>
            <Progress
              percent={passwordStrength}
              strokeColor={getPasswordStrengthColor(passwordStrength)}
              showInfo={false}
              size="small"
            />
            <div style={{ fontSize: '12px', color: getPasswordStrengthColor(passwordStrength), marginTop: '4px' }}>
              Độ mạnh: {getPasswordStrengthText(passwordStrength)}
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu mới"
            size="large"
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            visibilityToggle={{
              visible: showConfirmPassword,
              onVisibleChange: setShowConfirmPassword
            }}
          />
        </Form.Item>

        {/* Password Requirements */}
        <div style={{
          background: '#f0f2f5',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Yêu cầu mật khẩu:</div>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Ít nhất 6 ký tự (khuyến nghị 8+ ký tự)</li>
            <li>Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
            <li>Không sử dụng mật khẩu dễ đoán</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            Đổi mật khẩu
          </Button>
          <Button
            size="large"
            block
            onClick={handleCancel}
            style={{ marginTop: '8px' }}
          >
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
