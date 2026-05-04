import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Avatar, Upload, Button, message, Spin } from 'antd';
import { UserOutlined, CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import { updateProfile, uploadAvatar, checkUsernameAvailable } from '../services/profileService';
import { debounce } from 'lodash';

const EditProfileModal = ({ visible, onClose, userData, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(userData?.avatar);
  const [avatarFile, setAvatarFile] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  useEffect(() => {
    if (visible && userData) {
      form.setFieldsValue({
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email
      });
      setAvatarUrl(userData.avatar);
    }
  }, [visible, userData, form]);

  const checkUsername = debounce(async (username) => {
    if (!username || username === userData.username) {
      setUsernameAvailable(true);
      return;
    }

    setUsernameChecking(true);
    try {
      const response = await checkUsernameAvailable(username);
      setUsernameAvailable(response.available);
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setUsernameChecking(false);
    }
  }, 500);

  const handleUsernameChange = (e) => {
    const username = e.target.value;
    if (username) {
      checkUsername(username);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được upload file ảnh!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
    return false; // Prevent auto upload
  };

  const handleSubmit = async (values) => {
    if (!usernameAvailable) {
      message.error('Username đã được sử dụng');
      return;
    }

    try {
      setLoading(true);

      let finalAvatarUrl = avatarUrl;

      // Upload avatar first if changed
      if (avatarFile) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const uploadRes = await uploadAvatar(formData);
        if (uploadRes.success) {
          finalAvatarUrl = uploadRes.data.avatarUrl;
        }
        setUploadingAvatar(false);
      }

      // Update profile
      const response = await updateProfile({
        fullName: values.fullName,
        username: values.username,
        avatar: finalAvatarUrl
      });

      if (response.success) {
        message.success('Cập nhật profile thành công!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật profile');
    } finally {
      setLoading(false);
      setUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAvatarUrl(userData?.avatar);
    setAvatarFile(null);
    onClose();
  };

  return (
    <Modal
      title="Chỉnh sửa hồ sơ"
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
        {/* Avatar Upload */}
        <Form.Item label="Ảnh đại diện" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              size={120}
              src={avatarUrl}
              icon={<UserOutlined />}
              style={{ cursor: 'pointer' }}
            />
            <Upload
              showUploadList={false}
              beforeUpload={beforeUpload}
              accept="image/*"
            >
              <Button
                shape="circle"
                icon={uploadingAvatar ? <LoadingOutlined /> : <CameraOutlined />}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  border: '2px solid white'
                }}
                type="primary"
                loading={uploadingAvatar}
              />
            </Upload>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
            Click vào icon camera để thay đổi ảnh
          </div>
        </Form.Item>

        {/* Full Name */}
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[
            { required: true, message: 'Vui lòng nhập họ tên!' },
            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
          ]}
        >
          <Input placeholder="Nhập họ và tên" size="large" />
        </Form.Item>

        {/* Username */}
        <Form.Item
          label="Username"
          name="username"
          validateStatus={
            usernameChecking ? 'validating' : !usernameAvailable ? 'error' : 'success'
          }
          hasFeedback
          help={
            usernameChecking
              ? 'Đang kiểm tra...'
              : !usernameAvailable
              ? 'Username đã được sử dụng'
              : ''
          }
          rules={[
            { required: true, message: 'Vui lòng nhập username!' },
            { min: 3, message: 'Username phải có ít nhất 3 ký tự' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username chỉ chứa chữ, số và dấu gạch dưới' }
          ]}
        >
          <Input
            placeholder="Nhập username"
            size="large"
            onChange={handleUsernameChange}
            suffix={usernameChecking ? <LoadingOutlined /> : null}
          />
        </Form.Item>

        {/* Email (Read-only) */}
        <Form.Item
          label="Email"
          name="email"
          extra="Email không thể thay đổi"
        >
          <Input disabled size="large" />
        </Form.Item>

        {/* Action Buttons */}
        <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading || uploadingAvatar}
            disabled={!usernameAvailable}
          >
            {uploadingAvatar ? 'Đang upload ảnh...' : 'Lưu thay đổi'}
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

export default EditProfileModal;
