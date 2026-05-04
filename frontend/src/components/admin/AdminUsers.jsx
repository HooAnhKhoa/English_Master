import React, { useState, useEffect } from 'react';
import { Drawer, Form, message, Popconfirm, Switch } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import axios from 'axios';
import Papa from 'papaparse';
import withAdmin from './withAdmin';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setDrawerVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      setUsers(users.filter(u => u.id !== userId));
      message.success('User deleted successfully');
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleSave = async (values) => {
    try {
      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...values } : u));
        message.success('User updated successfully');
      } else {
        const newUser = { id: Date.now(), ...values, created_at: new Date().toISOString().split('T')[0], last_login: '-' };
        setUsers([...users, newUser]);
        message.success('User created successfully');
      }
      setDrawerVisible(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error) {
      message.error('Failed to save user');
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(users);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    message.success('Users exported successfully');
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700';
  };

  const getLevelColor = (level) => {
    if (level <= 5) return 'bg-green-50 text-green-700';
    if (level <= 10) return 'bg-cyan-50 text-cyan-700';
    if (level <= 15) return 'bg-orange-50 text-orange-700';
    return 'bg-purple-50 text-purple-700';
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                       user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                       (user.full_name && user.full_name.toLowerCase().includes(searchText.toLowerCase()));
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchLevel = filterLevel === 'all' || user.level === filterLevel;
    return matchSearch && matchRole && matchLevel;
  });

  const handleToggleActive = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      await axios.put(`${API_URL}/users/${user.id}`, {
        ...user,
        is_active: !user.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(users.map(u =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
      message.success(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle error:', error);
      message.error('Failed to update user status');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <UserOutlined className="text-2xl" />
          Users Management
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setDrawerVisible(true);
            }}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <PlusOutlined />
            <span className="hidden sm:inline">Add User</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <DownloadOutlined />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 min-w-0 relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* User List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl block mb-3">👥</span>
            <p className="text-sm">No users found. Click "+ Add User" to add one.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-start gap-3 py-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <UserOutlined className="text-xl" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 mb-0.5">
                    {user.full_name || user.username}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {user.email}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getLevelColor(user.level)}`}>
                      Level {user.level}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-1">
                      {user.xp || 0} XP • {user.streak || 0} days streak
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-0.5">
                  <Switch
                    size="small"
                    checked={user.is_active}
                    onChange={() => handleToggleActive(user)}
                  />
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <EditOutlined />
                  </button>
                  <Popconfirm
                    title="Delete this user?"
                    onConfirm={() => handleDelete(user.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <button className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                      <DeleteOutlined />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Total {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-1">
              <select className="text-sm border border-gray-200 rounded-lg px-2 py-1">
                <option>10 / page</option>
                <option>20 / page</option>
                <option>50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      <Drawer
        title={editingUser ? 'Edit User' : 'Add New User'}
        placement="right"
        width={500}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setEditingUser(null);
        }}
        open={drawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <input
              type="text"
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Full Name"
          >
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </Form.Item>

          <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: 'Please select level' }]}
          >
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Form.Item>

          <Form.Item
            name="xp"
            label="XP"
            initialValue={0}
          >
            <input
              type="number"
              placeholder="Enter XP"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="streak"
            label="Streak"
            initialValue={0}
          >
            <input
              type="number"
              placeholder="Enter streak"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDrawerVisible(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default withAdmin(AdminUsers);
