import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Volume2, X, Award, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const AIConversation = ({ user, onBack }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const [scorecard, setScorecard] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [topic, setTopic] = useState('');
  const [error, setError] = useState(null);
  const [hoveredCorrection, setHoveredCorrection] = useState(null);
  const [selectedVocab, setSelectedVocab] = useState(null);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scenarios = [
    { id: 'daily_conversation', name: 'Daily Conversation', icon: '💬', description: 'Casual everyday chat' },
    { id: 'job_interview', name: 'Job Interview', icon: '💼', description: 'Practice interview skills' },
    { id: 'ordering_food', name: 'Ordering Food', icon: '🍽️', description: 'Restaurant conversations' },
    { id: 'travel', name: 'Travel', icon: '✈️', description: 'Hotel and travel situations' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', description: 'Shopping and retail' },
    { id: 'business_meeting', name: 'Business Meeting', icon: '📊', description: 'Professional meetings' },
    { id: 'making_friends', name: 'Making Friends', icon: '👋', description: 'Social interactions' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = async (scenario) => {
    try {
      setError(null);
      setIsTyping(true);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/ai/conversations`,
        {
          scenario: scenario,
          ...(topic && { topic: topic }),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const { conversationId, firstMessage, suggestedResponses } = response.data.data;

        setCurrentConversation({
          id: conversationId,
          scenario: scenario,
          topic: topic,
        });

        setMessages([
          {
            role: 'assistant',
            content: firstMessage,
            suggestedResponses: suggestedResponses,
            timestamp: new Date(),
          },
        ]);

        setSelectedScenario(null);
      }
    } catch (err) {
      console.error('Start conversation error:', err);
      setError(err.response?.data?.message || 'Failed to start conversation. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !currentConversation) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/ai/conversations/${currentConversation.id}/messages`,
        { content: text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const {
          reply,
          correction,
          vocabulary,
          suggestedResponses,
          grammarErrors,
          turnScore,
          xpEarned,
        } = response.data.data;

        const aiMessage = {
          role: 'assistant',
          content: reply,
          correction: correction,
          vocabulary: vocabulary,
          suggestedResponses: suggestedResponses,
          grammarErrors: grammarErrors,
          turnScore: turnScore,
          xpEarned: xpEarned,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('Send message error:', err);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioMessage = async (audioBlob) => {
    if (!currentConversation) return;

    setIsTyping(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await axios.post(
        `${API_BASE_URL}/ai/conversations/${currentConversation.id}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        const {
          transcribedText,
          reply,
          correction,
          vocabulary,
          suggestedResponses,
          grammarErrors,
          turnScore,
          xpEarned,
        } = response.data.data;

        const userMessage = {
          role: 'user',
          content: transcribedText,
          isTranscribed: true,
          timestamp: new Date(),
        };

        const aiMessage = {
          role: 'assistant',
          content: reply,
          correction: correction,
          vocabulary: vocabulary,
          suggestedResponses: suggestedResponses,
          grammarErrors: grammarErrors,
          turnScore: turnScore,
          xpEarned: xpEarned,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage, aiMessage]);
      }
    } catch (err) {
      console.error('Send audio error:', err);
      setError(err.response?.data?.message || 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const endConversation = async () => {
    if (!currentConversation) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/ai/conversations/${currentConversation.id}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setScorecard(response.data.data);
        setShowScorecard(true);
      }
    } catch (err) {
      console.error('End conversation error:', err);
      setError('Failed to end conversation.');
    }
  };

  const resetConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setShowScorecard(false);
    setScorecard(null);
    setSelectedScenario(null);
    setTopic('');
    setError(null);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Scenario Selection Screen
  if (!currentConversation && !showScorecard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-800">🤖 Học với AI</h1>
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 font-semibold"
              >
                ← Back
              </button>
            </div>
            <p className="text-gray-600">
              Chọn tình huống để bắt đầu cuộc trò chuyện với AI. AI sẽ giúp bạn luyện tập tiếng Anh
              và sửa lỗi ngữ pháp.
            </p>
          </div>

          {/* Topic Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Chủ đề (tùy chọn):
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: technology, sports, movies..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => startConversation(scenario.id)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 text-left"
              >
                <div className="text-4xl mb-3">{scenario.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{scenario.name}</h3>
                <p className="text-gray-600 text-sm">{scenario.description}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Scorecard Modal
  if (showScorecard && scorecard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Hoàn thành!</h2>
            <p className="text-gray-600">Bạn đã hoàn thành cuộc trò chuyện</p>
          </div>

          {/* Score */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 mb-6 text-white text-center">
            <div className="text-5xl font-bold mb-2">
              {scorecard.scorecard.overallScore || 'N/A'}
            </div>
            <div className="text-lg">Điểm trung bình</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {scorecard.scorecard.totalTurns}
              </div>
              <div className="text-sm text-gray-600">Lượt trò chuyện</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {scorecard.scorecard.durationMin}m
              </div>
              <div className="text-sm text-gray-600">Thời gian</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">+{scorecard.xpTotal}</div>
              <div className="text-sm text-gray-600">XP</div>
            </div>
          </div>

          {/* Common Errors */}
          {scorecard.scorecard.commonErrors && scorecard.scorecard.commonErrors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Lỗi thường gặp:</h3>
              <div className="space-y-2">
                {scorecard.scorecard.commonErrors.map((error, index) => (
                  <div key={index} className="flex justify-between items-center bg-orange-50 px-4 py-2 rounded-lg">
                    <span className="text-gray-700 capitalize">{error.type}</span>
                    <span className="font-semibold text-orange-600">{error.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {scorecard.badgesEarned && scorecard.badgesEarned.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Huy hiệu mới:</h3>
              {scorecard.badgesEarned.map((badge, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="text-3xl">{badge.icon}</div>
                  <div>
                    <div className="font-bold text-gray-800">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={resetConversation}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Bắt đầu mới
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Về Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {scenarios.find((s) => s.id === currentConversation?.scenario)?.name || 'AI Conversation'}
            </h2>
            {currentConversation?.topic && (
              <p className="text-sm text-gray-600">Topic: {currentConversation.topic}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={endConversation}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Kết thúc
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-lg'
                }`}
              >
                {/* Message Content */}
                <div className="mb-2">{message.content}</div>

                {/* Transcribed Badge */}
                {message.isTranscribed && (
                  <div className="text-xs bg-blue-400 text-white px-2 py-1 rounded-full inline-block mb-2">
                    🎤 Transcribed
                  </div>
                )}

                {/* AI Message Features */}
                {message.role === 'assistant' && (
                  <>
                    {/* Audio Button */}
                    <button
                      onClick={() => speakText(message.content)}
                      className="text-purple-600 hover:text-purple-800 mt-2"
                    >
                      <Volume2 size={20} />
                    </button>

                    {/* Correction */}
                    {message.correction && (
                      <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="text-sm font-semibold text-orange-700 mb-1">
                          💡 Correction:
                        </div>
                        <div className="text-sm text-orange-600">{message.correction}</div>
                      </div>
                    )}

                    {/* Vocabulary */}
                    {message.vocabulary && message.vocabulary.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          📚 Vocabulary:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.vocabulary.map((vocab, vIndex) => (
                            <button
                              key={vIndex}
                              onClick={() => setSelectedVocab(vocab)}
                              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-all"
                            >
                              {vocab.word}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Responses */}
                    {message.suggestedResponses && message.suggestedResponses.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          💬 Suggested:
                        </div>
                        <div className="space-y-2">
                          {message.suggestedResponses.map((suggestion, sIndex) => (
                            <button
                              key={sIndex}
                              onClick={() => sendMessage(suggestion)}
                              className="block w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm transition-all"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Score & XP */}
                    {message.turnScore !== null && (
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp size={16} />
                          <span>Score: {message.turnScore}</span>
                        </div>
                        {message.xpEarned && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <Award size={16} />
                            <span>+{message.xpEarned} XP</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Timestamp */}
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isTyping}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-lg transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
            disabled={isTyping}
          >
            <Mic size={24} />
          </button>
          <button
            onClick={() => sendMessage(inputText)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-all duration-200"
            disabled={isTyping || !inputText.trim()}
          >
            <Send size={24} />
          </button>
        </div>
      </div>

      {/* Vocabulary Popup */}
      {selectedVocab && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{selectedVocab.word}</h3>
              <button onClick={() => setSelectedVocab(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-semibold text-gray-600">Meaning:</div>
                <div className="text-gray-800">{selectedVocab.meaning}</div>
              </div>
              {selectedVocab.example && (
                <div>
                  <div className="text-sm font-semibold text-gray-600">Example:</div>
                  <div className="text-gray-800 italic">"{selectedVocab.example}"</div>
                </div>
              )}
              {selectedVocab.level && (
                <div>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    Level: {selectedVocab.level}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConversation;
