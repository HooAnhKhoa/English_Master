import React, { useState, useEffect } from 'react';
import { Drawer, Form, message, Upload, Popconfirm, Switch, Select } from 'antd';
import {
  SearchOutlined,
  ReadOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import Papa from 'papaparse';
import withAdmin from './withAdmin';

const { Option } = Select;
const { TextArea } = require('antd/lib/input');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const AdminVocabulary = () => {
  const [vocabulary, setVocabulary] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTopics();
    fetchVocabulary();
  }, []);

  const fetchTopics = async () => {
    try {
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
    }
  };

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/vocabularies`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 }
      });

      if (response.data.success) {
        setVocabulary(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vocabulary', error);
      message.error('Failed to load vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vocab) => {
    setEditingVocab(vocab);
    form.setFieldsValue({
      word: vocab.word,
      meaning: vocab.meaning,
      pronunciation: vocab.pronunciation,
      definition: vocab.definition,
      example: vocab.example,
      part_of_speech: vocab.part_of_speech,
      level: vocab.level,
      topic_id: vocab.topic_id,
      is_active: vocab.is_active !== false
    });
    setDrawerVisible(true);
  };

  const handleDelete = async (vocabId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/vocabularies/${vocabId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVocabulary(vocabulary.filter(v => v.id !== vocabId));
      message.success('Vocabulary deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete vocabulary');
    }
  };

  const handleSave = async (values) => {
    try {
      const token = localStorage.getItem('token');

      if (editingVocab) {
        await axios.put(`${API_URL}/vocabularies/${editingVocab.id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Vocabulary updated successfully');
      } else {
        await axios.post(`${API_URL}/vocabularies`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Vocabulary created successfully');
      }

      fetchVocabulary();
      setDrawerVisible(false);
      form.resetFields();
      setEditingVocab(null);
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.response?.data?.message || 'Failed to save vocabulary');
    }
  };

  const handleExportCSV = () => {
    const exportData = vocabulary.map(v => ({
      word: v.word,
      meaning: v.meaning,
      pronunciation: v.pronunciation,
      definition: v.definition,
      example: v.example,
      part_of_speech: v.part_of_speech,
      level: v.level,
      topic: topics.find(t => t.id === v.topic_id)?.name || '',
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vocabulary_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    message.success('Vocabulary exported successfully');
  };

  const handleImportCSV = (file) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const token = localStorage.getItem('token');
        let successCount = 0;
        let errorCount = 0;

        for (const row of results.data) {
          if (!row.word || !row.meaning) continue;

          try {
            const topic = topics.find(t => t.name.toLowerCase() === row.topic?.toLowerCase());

            await axios.post(`${API_URL}/vocabularies`, {
              word: row.word,
              meaning: row.meaning,
              pronunciation: row.pronunciation || '',
              definition: row.definition || '',
              example: row.example || '',
              part_of_speech: row.part_of_speech || 'noun',
              level: row.level || 'A1',
              topic_id: topic?.id || null,
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            successCount++;
          } catch (error) {
            console.error('Import error:', error);
            errorCount++;
          }
        }

        if (successCount > 0) {
          message.success(`Imported ${successCount} vocabulary items`);
          fetchVocabulary();
        }
        if (errorCount > 0) {
          message.warning(`Failed to import ${errorCount} items`);
        }
      },
      error: (error) => {
        message.error('Failed to parse CSV file');
        console.error(error);
      }
    });
    return false;
  };

  const handleToggleActive = async (vocab) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(`${API_URL}/vocabularies/${vocab.id}`, {
        ...vocab,
        is_active: !vocab.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVocabulary(vocabulary.map(v =>
        v.id === vocab.id ? { ...v, is_active: !v.is_active } : v
      ));
      message.success(`Vocabulary ${!vocab.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle error:', error);
      message.error('Failed to update vocabulary status');
    }
  };

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

  const filteredVocabulary = vocabulary.filter(vocab => {
    const matchSearch = vocab.word?.toLowerCase().includes(searchText.toLowerCase()) ||
                       vocab.meaning?.toLowerCase().includes(searchText.toLowerCase());
    const matchLevel = filterLevel === 'all' || vocab.level === filterLevel;
    const matchTopic = filterTopic === 'all' || vocab.topic_id === parseInt(filterTopic);
    return matchSearch && matchLevel && matchTopic;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <ReadOutlined className="text-2xl" />
          Vocabulary Management
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Upload
            accept=".csv"
            beforeUpload={handleImportCSV}
            showUploadList={false}
          >
            <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <UploadOutlined />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
          </Upload>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <DownloadOutlined />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingVocab(null);
              form.resetFields();
              setDrawerVisible(true);
            }}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <PlusOutlined />
            <span className="hidden sm:inline">Add Vocabulary</span>
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
              placeholder="Search vocabulary..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Topics</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>
                {topic.icon} {topic.name_vi}
              </option>
            ))}
          </select>
        </div>

        {/* Vocabulary List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : filteredVocabulary.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl block mb-3">📖</span>
            <p className="text-sm">No vocabulary found. Click "+ Add Vocabulary" to add one.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredVocabulary.map((vocab) => (
              <div key={vocab.id} className="flex flex-col sm:flex-row sm:items-start gap-3 py-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 mb-0.5">
                    {vocab.word}
                  </div>
                  <div className="text-xs text-gray-700 mb-2">
                    {vocab.meaning}
                  </div>
                  {vocab.example && (
                    <div className="text-xs text-gray-500 italic mb-2">
                      "{vocab.example}"
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getLevelColor(vocab.level)}`}>
                      {vocab.level}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                      {vocab.part_of_speech}
                    </span>
                    {vocab.topic_id && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700">
                        {topics.find(t => t.id === vocab.topic_id)?.icon} {topics.find(t => t.id === vocab.topic_id)?.name}
                      </span>
                    )}
                    {vocab.pronunciation && (
                      <span className="text-xs text-blue-500 ml-1">
                        [{vocab.pronunciation}]
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-0.5">
                  <Switch
                    size="small"
                    checked={vocab.is_active}
                    onChange={() => handleToggleActive(vocab)}
                  />
                  <button
                    onClick={() => handleEdit(vocab)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <EditOutlined />
                  </button>
                  <Popconfirm
                    title="Delete this vocabulary?"
                    onConfirm={() => handleDelete(vocab.id)}
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
        {filteredVocabulary.length > 0 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Total {filteredVocabulary.length} words
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
        title={editingVocab ? 'Edit Vocabulary' : 'Add New Vocabulary'}
        placement="right"
        width={600}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setEditingVocab(null);
        }}
        open={drawerVisible}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="word"
            label="Word"
            rules={[{ required: true, message: 'Please enter word' }]}
          >
            <input
              type="text"
              placeholder="Enter word"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="meaning"
            label="Meaning (Vietnamese)"
            rules={[{ required: true, message: 'Please enter meaning' }]}
          >
            <input
              type="text"
              placeholder="Enter meaning"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="pronunciation"
            label="Pronunciation (IPA)"
          >
            <input
              type="text"
              placeholder="e.g., /həˈloʊ/"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="definition"
            label="Definition (English)"
          >
            <TextArea rows={2} placeholder="Enter English definition" />
          </Form.Item>

          <Form.Item
            name="example"
            label="Example Sentence"
            rules={[{ required: true, message: 'Please enter example' }]}
          >
            <TextArea rows={3} placeholder="Enter example sentence" />
          </Form.Item>

          <Form.Item
            name="part_of_speech"
            label="Part of Speech"
            rules={[{ required: true, message: 'Please select part of speech' }]}
          >
            <Select placeholder="Select part of speech">
              <Option value="noun">Noun</Option>
              <Option value="verb">Verb</Option>
              <Option value="adjective">Adjective</Option>
              <Option value="adverb">Adverb</Option>
              <Option value="preposition">Preposition</Option>
              <Option value="conjunction">Conjunction</Option>
              <Option value="pronoun">Pronoun</Option>
              <Option value="interjection">Interjection</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: 'Please select level' }]}
          >
            <Select placeholder="Select level">
              <Option value="A1">A1 - Beginner</Option>
              <Option value="A2">A2 - Elementary</Option>
              <Option value="B1">B1 - Intermediate</Option>
              <Option value="B2">B2 - Upper-Intermediate</Option>
              <Option value="C1">C1 - Advanced</Option>
              <Option value="C2">C2 - Proficiency</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="topic_id"
            label="Topic"
            rules={[{ required: true, message: 'Please select topic' }]}
          >
            <Select placeholder="Select topic">
              {topics.map(topic => (
                <Option key={topic.id} value={topic.id}>
                  {topic.icon} {topic.name_vi} ({topic.name})
                </Option>
              ))}
            </Select>
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
                {editingVocab ? 'Update' : 'Create'}
              </button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default withAdmin(AdminVocabulary);
