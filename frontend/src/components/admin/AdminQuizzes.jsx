import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, message, Popconfirm, Switch } from 'antd';
import {
  SearchOutlined,
  TrophyOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  BookOutlined,
  CheckCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import withAdmin from './withAdmin';

const { TextArea } = Input;

const AdminQuizzes = () => {
  const [templates, setTemplates] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchTopics();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      const response = await axios.get(`${API_URL}/admin/quiz-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTemplates(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch templates', error);
      message.error('Failed to load quiz templates');
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      const response = await axios.get(`${API_URL}/topics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTopics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch topics', error);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setQuestions([]);
    form.resetFields();
    form.setFieldsValue({
      total_questions: 10,
      time_limit_sec: 300,
      passing_score: 60,
      is_active: true
    });
    setDrawerVisible(true);
  };

  const handleEdit = async (template) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      const response = await axios.get(`${API_URL}/admin/quiz-templates/${template.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const fullTemplate = response.data.data;
        setEditingTemplate(fullTemplate);
        setQuestions(fullTemplate.questions || []);
        form.setFieldsValue({
          title: fullTemplate.title,
          description: fullTemplate.description,
          type: fullTemplate.type,
          level: fullTemplate.level,
          topic_id: fullTemplate.topic_id,
          total_questions: fullTemplate.total_questions,
          time_limit_sec: fullTemplate.time_limit_sec,
          passing_score: fullTemplate.passing_score,
          is_active: fullTemplate.is_active
        });
        setDrawerVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch template', error);
      message.error('Failed to load template');
    }
  };

  const handleDelete = async (templateId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      await axios.delete(`${API_URL}/admin/quiz-templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(templates.filter(t => t.id !== templateId));
      message.success('Quiz template deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete template');
    }
  };

  const handleToggleActive = async (template) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      await axios.put(`${API_URL}/admin/quiz-templates/${template.id}`, {
        ...template,
        is_active: !template.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTemplates(templates.map(t =>
        t.id === template.id ? { ...t, is_active: !t.is_active } : t
      ));
      message.success(`Template ${!template.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle error:', error);
      message.error('Failed to update template status');
    }
  };

  const handleSave = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

      const data = {
        ...values,
        questions: questions
      };

      if (editingTemplate) {
        await axios.put(`${API_URL}/admin/quiz-templates/${editingTemplate.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Quiz template updated successfully');
      } else {
        await axios.post(`${API_URL}/admin/quiz-templates`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Quiz template created successfully');
      }

      setDrawerVisible(false);
      form.resetFields();
      setEditingTemplate(null);
      setQuestions([]);
      fetchTemplates();
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.response?.data?.message || 'Failed to save template');
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question_type: 'multiple_choice',
      question_text: '',
      correct_answer: '',
      options: ['', '', '', ''],
      explanation: '',
      points: 10
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const getTypeColor = (type) => {
    const colors = {
      vocab: 'bg-blue-50 text-blue-700',
      lesson: 'bg-green-50 text-green-700',
      mixed: 'bg-purple-50 text-purple-700'
    };
    return colors[type] || 'bg-gray-50 text-gray-700';
  };

  const getLevelColor = (level) => {
    const colors = {
      A1: 'bg-green-50 text-green-700',
      A2: 'bg-cyan-50 text-cyan-700',
      B1: 'bg-blue-50 text-blue-700',
      B2: 'bg-purple-50 text-purple-700',
      C1: 'bg-orange-50 text-orange-700',
      C2: 'bg-red-50 text-red-700'
    };
    return colors[level] || 'bg-gray-50 text-gray-700';
  };

  const filteredTemplates = templates.filter(template => {
    const matchSearch = template.title.toLowerCase().includes(searchText.toLowerCase()) ||
                       (template.description || '').toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === 'all' || template.type === filterType;
    const matchLevel = filterLevel === 'all' || template.level === filterLevel;
    return matchSearch && matchType && matchLevel;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <TrophyOutlined className="text-2xl" />
          Quiz Templates
        </h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <PlusOutlined />
          <span className="hidden sm:inline">Create Template</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <BookOutlined className="text-gray-400 text-xl mb-2" />
            <div className="text-xs text-gray-500 mb-1">Total Templates</div>
            <div className="text-2xl font-bold text-gray-800">{templates.length}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <CheckCircleOutlined className="text-green-400 text-xl mb-2" />
            <div className="text-xs text-gray-500 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">{templates.filter(t => t.is_active).length}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Total Questions</div>
            <div className="text-2xl font-bold text-gray-800">{templates.reduce((sum, t) => sum + t.total_questions, 0)}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">Avg Questions</div>
            <div className="text-2xl font-bold text-gray-800">
              {templates.length > 0 ? Math.round(templates.reduce((sum, t) => sum + t.total_questions, 0) / templates.length) : 0}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 min-w-0 relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="vocab">Vocab</option>
            <option value="lesson">Lesson</option>
            <option value="mixed">Mixed</option>
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>

        {/* Quiz List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl block mb-3">🎯</span>
            <p className="text-sm">No quiz templates found. Click "Create Template" to add one.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="flex flex-col sm:flex-row sm:items-start gap-3 py-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 mb-0.5">
                    {template.title}
                  </div>
                  {template.description && (
                    <div className="text-xs text-gray-500 mb-2">
                      {template.description}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getTypeColor(template.type)}`}>
                      {template.type}
                    </span>
                    {template.level && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getLevelColor(template.level)}`}>
                        {template.level}
                      </span>
                    )}
                    {template.topic && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700">
                        {template.topic.icon} {template.topic.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-1">
                      {template.total_questions}Q • {Math.floor(template.time_limit_sec / 60)}m • Pass: {template.passing_score}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-0.5">
                  <Switch
                    size="small"
                    checked={template.is_active}
                    onChange={() => handleToggleActive(template)}
                  />
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <EditOutlined />
                  </button>
                  <Popconfirm
                    title="Delete this template?"
                    onConfirm={() => handleDelete(template.id)}
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
        {filteredTemplates.length > 0 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Total {filteredTemplates.length} templates
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

      {/* Create/Edit Drawer */}
      <Drawer
        title={editingTemplate ? 'Edit Quiz Template' : 'Create Quiz Template'}
        placement="right"
        width={720}
        onClose={() => {
          setDrawerVisible(false);
          setEditingTemplate(null);
          setQuestions([]);
          form.resetFields();
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
            <Input placeholder="e.g., Daily Life Vocabulary Quiz" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Brief description of the quiz" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <select >
                <option value="">Select type</option>
                <option value="vocab">Vocabulary</option>
                <option value="lesson">Lesson</option>
                <option value="mixed">Mixed</option>
              </select>
            </Form.Item>
            <Form.Item
              name="level"
              label="Level"
            >
              <select >
                <option value="">Select level</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </Form.Item>
          </div>

          <Form.Item
            name="topic_id"
            label="Topic"
          >
            <select >
              <option value="">Select topic</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.icon} {topic.name}
                </option>
              ))}
            </select>
          </Form.Item>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="total_questions"
              label="Total Questions"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input type="number" min="1" max="50" />
            </Form.Item>
            <Form.Item
              name="time_limit_sec"
              label="Time Limit (sec)"
            >
              <Input type="number" min="0" />
            </Form.Item>
            <Form.Item
              name="passing_score"
              label="Pass Score (%)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input type="number" min="0" max="100" />
            </Form.Item>
          </div>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Questions ({questions.length})</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <PlusOutlined /> Add Question
              </button>
            </div>

            {questions.map((q, index) => (
              <div key={index} className="mb-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-blue-600">Q{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    <DeleteOutlined /> Remove
                  </button>
                </div>

                <select
                  value={q.question_type}
                  onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded mb-2"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="fill_blank">Fill in the Blank</option>
                  <option value="true_false">True/False</option>
                </select>

                <Input
                  />
                  placeholder="Question text"
                  value={q.question_text}
                  onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded mb-2"
                />

                <Input
                  placeholder="Correct answer"
                  value={q.correct_answer}
                  onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded mb-2"
                />

                {q.question_type === 'multiple_choice' && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Options:</div>
                    {(q.options || []).map((opt, optIndex) => (
                      <Input
                        key={optIndex}
                        placeholder={`Option ${optIndex + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...(q.options || [])];
                          newOptions[optIndex] = e.target.value;
                          updateQuestion(index, 'options', newOptions);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded mb-1"
                      />
                    ))}
                  </div>
                )}

                <textarea
                  placeholder="Explanation (optional)"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
                />
              </div>
            ))}
          </div>

          <Form.Item className="mt-6">
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingTemplate ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setDrawerVisible(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default withAdmin(AdminQuizzes);
