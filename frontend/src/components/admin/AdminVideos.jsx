import React, { useState, useEffect } from 'react';
import { Drawer, Form, message, Popconfirm, Modal, Switch } from 'antd';
import {
  SearchOutlined,
  VideoCameraOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import withAdmin from './withAdmin';

const { TextArea } = require('antd/lib/input');

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [subtitleModalVisible, setSubtitleModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingSubtitles, setEditingSubtitles] = useState(null);
  const [form] = Form.useForm();
  const [subtitleForm] = Form.useForm();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      const response = await axios.get(`${API_URL}/videos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setVideos(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch videos', error);
      message.error('Failed to load videos');
      setLoading(false);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    form.setFieldsValue({
      title: video.title,
      youtube_id: video.youtube_id,
      description: video.description,
      level: video.level,
      duration: video.duration,
      is_active: video.is_active !== false
    });
    setDrawerVisible(true);
  };

  const handleEditSubtitles = (video) => {
    setEditingSubtitles(video);
    subtitleForm.setFieldsValue({
      subtitles: JSON.stringify(video.subtitles || [], null, 2),
      exercises: JSON.stringify(video.exercises || [], null, 2)
    });
    setSubtitleModalVisible(true);
  };

  const handleDelete = async (videoId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      await axios.delete(`${API_URL}/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(videos.filter(v => v.id !== videoId));
      message.success('Video deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete video');
    }
  };

  const handleSave = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      if (editingVideo) {
        await axios.put(`${API_URL}/videos/${editingVideo.id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVideos(videos.map(v => v.id === editingVideo.id ? { ...v, ...values } : v));
        message.success('Video updated successfully');
      } else {
        const response = await axios.post(`${API_URL}/videos`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVideos([...videos, response.data.data]);
        message.success('Video created successfully');
      }
      setDrawerVisible(false);
      form.resetFields();
      setEditingVideo(null);
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.response?.data?.message || 'Failed to save video');
    }
  };

  const handleSaveSubtitles = async (values) => {
    try {
      const subtitles = JSON.parse(values.subtitles);
      const exercises = JSON.parse(values.exercises);

      setVideos(videos.map(v => v.id === editingSubtitles.id ? { ...v, subtitles, exercises } : v));
      message.success('Subtitles and exercises updated successfully');
      setSubtitleModalVisible(false);
      subtitleForm.resetFields();
      setEditingSubtitles(null);
    } catch (error) {
      message.error('Invalid JSON format or failed to save');
      console.error(error);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'bg-green-50 text-green-700',
      intermediate: 'bg-orange-50 text-orange-700',
      advanced: 'bg-purple-50 text-purple-700'
    };
    return colors[level] || 'bg-gray-50 text-gray-700';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredVideos = videos.filter(video => {
    const matchSearch = video.title.toLowerCase().includes(searchText.toLowerCase()) ||
                       (video.description || '').toLowerCase().includes(searchText.toLowerCase());
    const matchLevel = filterLevel === 'all' || video.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const handleToggleActive = async (video) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      await axios.put(`${API_URL}/videos/${video.id}`, {
        ...video,
        is_active: !video.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVideos(videos.map(v =>
        v.id === video.id ? { ...v, is_active: !v.is_active } : v
      ));
      message.success(`Video ${!video.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle error:', error);
      message.error('Failed to update video status');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <VideoCameraOutlined className="text-2xl" />
          Videos Management
        </h1>
        <button
          onClick={() => {
            setEditingVideo(null);
            form.resetFields();
            setDrawerVisible(true);
          }}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <PlusOutlined />
          <span className="hidden sm:inline">Add Video</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 min-h-0">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <div className="text-sm text-gray-500 self-center whitespace-nowrap">
            {filteredVideos.length} of {videos.length} videos
          </div>
        </div>

        {/* Video List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl block mb-3">🎬</span>
            <p className="text-sm">No videos found. Click "+ Add Video" to add one.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredVideos.map((video) => (
              <div key={video.id} className="flex items-center gap-4 py-4">
                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-28 h-16 md:w-36 md:h-20 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">
                    4K
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate mb-1">
                    {video.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-0">
                    <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${getLevelColor(video.level)}`}>
                      {video.level}
                    </span>
                    {video.category && (
                      <span className="px-2 py-0.5 text-xs rounded-md bg-purple-50 text-purple-700">
                        {video.category}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDuration(video.duration_sec || 0)} • {(video.subtitles || []).length} subs • {(video.exercises || []).length} ex
                  </div>
                  <div className="mt-1">
                    <Switch
                      size="small"
                      checked={video.is_active}
                      onChange={() => handleToggleActive(video)}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(video)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <EditOutlined />
                  </button>
                  <button
                    onClick={() => handleEditSubtitles(video)}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <EyeOutlined />
                  </button>
                  <Popconfirm
                    title="Delete this video?"
                    onConfirm={() => handleDelete(video.id)}
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
        {filteredVideos.length > 0 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 text-sm text-gray-500">
            <div>Total {filteredVideos.length} videos</div>
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

      {/* Video Info Drawer */}
      <Drawer
        title={editingVideo ? 'Edit Video' : 'Add New Video'}
        placement="right"
        width={500}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setEditingVideo(null);
        }}
        open={drawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <input
              type="text"
              placeholder="Enter video title"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="youtube_id"
            label="YouTube Video ID"
            rules={[{ required: true, message: 'Please enter YouTube ID' }]}
            extra="The ID from YouTube URL (e.g., dQw4w9WgXcQ)"
          >
            <input
              type="text"
              placeholder="e.g., dQw4w9WgXcQ"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Enter video description" />
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
            name="duration"
            label="Duration (seconds)"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <input
              type="number"
              placeholder="e.g., 300"
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
                {editingVideo ? 'Update' : 'Create'}
              </button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Subtitle Editor Modal */}
      <Modal
        title={`Edit Subtitles & Exercises: ${editingSubtitles?.title}`}
        open={subtitleModalVisible}
        onCancel={() => {
          setSubtitleModalVisible(false);
          subtitleForm.resetFields();
          setEditingSubtitles(null);
        }}
        width={800}
        footer={null}
      >
        <Form
          form={subtitleForm}
          layout="vertical"
          onFinish={handleSaveSubtitles}
        >
          <Form.Item
            name="subtitles"
            label="Subtitles (JSON Array)"
            rules={[{ required: true, message: 'Please enter subtitles' }]}
            extra="Format: [{ start: 0, end: 5, text: 'Hello', translation: 'Xin chào' }]"
          >
            <TextArea
              rows={10}
              placeholder='[{"start": 0, "end": 5, "text": "Hello everyone!", "translation": "Xin chào mọi người!"}]'
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </Form.Item>

          <Form.Item
            name="exercises"
            label="Exercises (JSON Array)"
            rules={[{ required: true, message: 'Please enter exercises' }]}
            extra="Format: [{ type: 'pronunciation', timestamp: 5, text: 'Hello everyone' }]"
          >
            <TextArea
              rows={8}
              placeholder='[{"type": "pronunciation", "timestamp": 5, "text": "Hello everyone"}]'
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setSubtitleModalVisible(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default withAdmin(AdminVideos);
