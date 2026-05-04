import React, { useState, useEffect } from 'react';
import { Drawer, Form, message, Popconfirm, Switch } from 'antd';
import {
  SearchOutlined,
  FolderOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import withAdmin from './withAdmin';

const { TextArea } = require('antd/lib/input');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const AdminTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/topics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTopics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch topics', error);
      message.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    form.setFieldsValue({
      name: topic.name,
      name_vi: topic.name_vi,
      slug: topic.slug,
      icon: topic.icon,
      description: topic.description,
      level: topic.level,
      is_active: topic.is_active,
    });
    setDrawerVisible(true);
  };

  const handleDelete = async (topicId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/topics/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(topics.filter(t => t.id !== topicId));
      message.success('Topic deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      message.error(error.response?.data?.message || 'Failed to delete topic');
    }
  };

  const handleSave = async (values) => {
    try {
      const token = localStorage.getItem('token');

      if (editingTopic) {
        await axios.put(`${API_URL}/topics/${editingTopic.id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Topic updated successfully');
      } else {
        await axios.post(`${API_URL}/topics`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Topic created successfully');
      }

      fetchTopics();
      setDrawerVisible(false);
      form.resetFields();
      setEditingTopic(null);
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.response?.data?.message || 'Failed to save topic');
    }
  };

  const handleToggleActive = async (topic) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/topics/${topic.id}`, {
        ...topic,
        is_active: !topic.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTopics(topics.map(t =>
        t.id === topic.id ? { ...t, is_active: !t.is_active } : t
      ));
      message.success(`Topic ${!topic.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle error:', error);
      message.error('Failed to update topic status');
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchSearch = topic.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                       topic.name_vi?.toLowerCase().includes(searchText.toLowerCase());
    return matchSearch;
  });

  const getLevelColor = (level) => {
    const colors = {
      'A1': 'bg-green-50 text-green-700',
      'A2': 'bg-cyan-50 text-cyan-700',
      'B1': 'bg-blue-50 text-blue-700',
      'B2': 'bg-orange-50 text-orange-700',
      'C1': 'bg-purple-50 text-purple-700',
      'C2': 'bg-red-50 text-red-700'
    };
    return colors[level] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FolderOutlined className="text-2xl" />
          Topic Management
        </h1>
        <button
          onClick={() => {
            setEditingTopic(null);
            form.resetFields();
            setDrawerVisible(true);
          }}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <PlusOutlined />
          <span className="hidden sm:inline">Add Topic</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 min-w-0 relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Topic List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl block mb-3">📚</span>
            <p className="text-sm">No topics found. Click "+ Add Topic" to add one.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="flex flex-col sm:flex-row sm:items-start gap-3 py-4">
                {/* Icon */}
                <div className="flex-shrink-0 text-4xl">
                  {topic.icon || '📚'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 mb-0.5">
                    {topic.name}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {topic.name_vi}
                  </div>
                  {topic.description && (
                    <div className="text-xs text-gray-500 mb-2">
                      {topic.description}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getLevelColor(topic.level)}`}>
                      {topic.level}
                    </span>
                    {topic.slug && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {topic.slug}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-1">
                      {topic.word_count || 0} words
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-0.5">
                  <Switch
                    size="small"
                    checked={topic.is_active}
                    onChange={() => handleToggleActive(topic)}
                  />
                  <button
                    onClick={() => handleEdit(topic)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <EditOutlined />
                  </button>
                  <Popconfirm
                    title="Delete this topic?"
                    description="This will affect all vocabularies."
                    onConfirm={() => handleDelete(topic.id)}
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
        {filteredTopics.length > 0 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Total {filteredTopics.length} topics
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
        title={editingTopic ? 'Edit Topic' : 'Add New Topic'}
        placement="right"
        width={500}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setEditingTopic(null);
        }}
        open={drawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            is_active: true,
            level: 'A1',
          }}
        >
          <Form.Item
            name="name"
            label="Name (English)"
            rules={[{ required: true, message: 'Please enter English name' }]}
          >
            <input
              type="text"
              placeholder="e.g., Daily Life"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="name_vi"
            label="Name (Vietnamese)"
            rules={[{ required: true, message: 'Please enter Vietnamese name' }]}
          >
            <input
              type="text"
              placeholder="e.g., Cuộc sống hàng ngày"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: 'Please enter slug' },
              { pattern: /^[a-z0-9-]+$/, message: 'Slug must be lowercase letters, numbers, and hyphens only' }
            ]}
            help="URL-friendly identifier (e.g., daily-life)"
          >
            <input
              type="text"
              placeholder="e.g., daily-life"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="icon"
            label="Icon (Emoji)"
            rules={[{ required: true, message: 'Please enter an emoji icon' }]}
            help="Use a single emoji character"
          >
            <input
              type="text"
              placeholder="e.g., 🏠"
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Brief description of this topic" />
          </Form.Item>

          <Form.Item
            name="level"
            label="Recommended Level"
            rules={[{ required: true, message: 'Please select level' }]}
          >
            <input
              type="text"
              placeholder="e.g., A1, A2, B1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
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
                {editingTopic ? 'Update' : 'Create'}
              </button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default withAdmin(AdminTopics);
