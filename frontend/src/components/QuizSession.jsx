import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Progress, Tag, Modal, Row, Col, Input, message, Spin } from 'antd';
import {
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import { generateQuiz, submitQuiz } from '../services/reviewService';
import confetti from 'canvas-confetti';

const QuizSession = () => {
  const navigate = (path) => {
    window.location.hash = path;
  };
  const getSearchParams = () => {
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    return new URLSearchParams(queryString);
  };
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [xpEarned, setXpEarned] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = getSearchParams();
    const type = params.get('type') || 'vocab';
    const count = params.get('count') || 10;
    const level = params.get('level');
    const topicId = params.get('topicId');

    fetchQuiz({ type, count, level, topicId });
  }, []);

  const fetchQuiz = async (params) => {
    try {
      setLoading(true);
      const response = await generateQuiz(params);
      if (response.success) {
        setQuiz(response.data);
        setQuestionStartTime(Date.now());
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      message.error('Không thể tạo quiz. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = () => {
    if (!selectedAnswer) {
      message.warning('Vui lòng chọn câu trả lời!');
      return;
    }

    const currentQuestion = quiz.questions[currentIndex];
    const timeSpent = Date.now() - questionStartTime;
    let correct = false;

    if (currentQuestion.question_type === 'multiple_choice') {
      correct = selectedAnswer.toLowerCase().trim() === currentQuestion.correct_answer?.toLowerCase().trim();
    } else if (currentQuestion.question_type === 'fill_blank') {
      correct = selectedAnswer.toLowerCase().trim() === currentQuestion.correct_answer?.toLowerCase().trim();
    }

    setIsCorrect(correct);
    setShowExplanation(true);

    // Store answer
    const newAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      timeMs: timeSpent
    };

    setAnswers([...answers, newAnswer]);

    if (correct) {
      setXpEarned(xpEarned + 10);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
      setIsCorrect(null);
      setQuestionStartTime(Date.now());
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await submitQuiz(quiz.quizId, answers);
      if (response.success) {
        setResult(response.data);
        setShowResult(true);

        // Show confetti if score >= 80%
        if (response.data.score >= 80) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      message.error('Không thể nộp bài. Vui lòng thử lại!');
    }
  };

  const renderQuestion = () => {
    const question = quiz.questions[currentIndex];

    if (question.question_type === 'multiple_choice') {
      return (
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '32px', textAlign: 'center' }}>
            {question.question_text}
          </h2>
          <Radio.Group
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            style={{ width: '100%' }}
            disabled={showExplanation}
          >
            <Row gutter={[16, 16]}>
              {question.options?.map((option, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card
                    hoverable={!showExplanation}
                    style={{
                      cursor: showExplanation ? 'default' : 'pointer',
                      border: selectedAnswer === option ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      backgroundColor: showExplanation
                        ? option === question.correct_answer
                          ? '#f6ffed'
                          : selectedAnswer === option
                          ? '#fff1f0'
                          : 'white'
                        : selectedAnswer === option
                        ? '#e6f7ff'
                        : 'white'
                    }}
                    onClick={() => !showExplanation && setSelectedAnswer(option)}
                  >
                    <Radio value={option} style={{ width: '100%' }}>
                      <span style={{ fontSize: '16px', marginLeft: '8px' }}>{option}</span>
                    </Radio>
                  </Card>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </div>
      );
    } else if (question.question_type === 'fill_blank') {
      return (
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '24px', textAlign: 'center' }}>
            Điền từ vào chỗ trống:
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '32px', textAlign: 'center', lineHeight: '1.8' }}>
            {question.question_text}
          </p>
          <Input
            size="large"
            placeholder="Nhập câu trả lời..."
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={showExplanation}
            onPressEnter={handleAnswer}
            style={{ fontSize: '18px', textAlign: 'center' }}
          />
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Đang tạo quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <p>Không thể tải quiz</p>
        <Button onClick={() => navigate('/review')}>Quay lại</Button>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <TrophyOutlined style={{ fontSize: '64px', color: result.score >= 80 ? '#52c41a' : result.score >= 60 ? '#faad14' : '#ff4d4f' }} />
            <h1 style={{ fontSize: '48px', margin: '16px 0' }}>
              {result.score}%
            </h1>
            <p style={{ fontSize: '20px', color: '#666' }}>
              {result.correct}/{result.total} câu đúng
            </p>
            <Tag color="gold" style={{ fontSize: '16px', padding: '8px 16px' }}>
              <FireOutlined /> +{result.xpEarned} XP
            </Tag>
          </div>

          <Progress
            percent={result.score}
            strokeColor={result.score >= 80 ? '#52c41a' : result.score >= 60 ? '#faad14' : '#ff4d4f'}
            style={{ marginBottom: '32px' }}
          />

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>📊 Phân tích:</h3>
            {result.score >= 80 && (
              <p style={{ color: '#52c41a' }}>
                🎉 Xuất sắc! Bạn đã nắm vững kiến thức này!
              </p>
            )}
            {result.score >= 60 && result.score < 80 && (
              <p style={{ color: '#faad14' }}>
                👍 Khá tốt! Hãy tiếp tục luyện tập để đạt kết quả cao hơn.
              </p>
            )}
            {result.score < 60 && (
              <p style={{ color: '#ff4d4f' }}>
                💪 Cần cải thiện! Hãy ôn lại các từ sai và thử lại.
              </p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>📝 Chi tiết câu trả lời:</h3>
            {result.details.map((detail, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: '12px' }}
                title={
                  <span>
                    Câu {index + 1}{' '}
                    {detail.isCorrect ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    )}
                  </span>
                }
              >
                <p><strong>Câu hỏi:</strong> {detail.question}</p>
                <p>
                  <strong>Đáp án đúng:</strong>{' '}
                  <Tag color="success">{detail.correctAnswer}</Tag>
                </p>
                {!detail.isCorrect && (
                  <p>
                    <strong>Bạn đã chọn:</strong>{' '}
                    <Tag color="error">{detail.userAnswer}</Tag>
                  </p>
                )}
                {detail.explanation && (
                  <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                    💡 {detail.explanation}
                  </p>
                )}
              </Card>
            ))}
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Button block onClick={() => navigate('/review')}>
                Quay lại
              </Button>
            </Col>
            <Col span={8}>
              <Button block onClick={() => window.location.reload()}>
                Làm lại
              </Button>
            </Col>
            <Col span={8}>
              <Button type="primary" block onClick={() => navigate('/review/quiz')}>
                Quiz mới
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Tag color="blue">Câu {currentIndex + 1}/{quiz.questions.length}</Tag>
          <Tag color="gold">
            <FireOutlined /> {xpEarned} XP
          </Tag>
        </div>
        <div>
          <ClockCircleOutlined style={{ marginRight: '8px' }} />
          {Math.floor((Date.now() - startTime) / 1000)}s
        </div>
      </div>

      <Progress percent={progress} showInfo={false} style={{ marginBottom: '24px' }} />

      {/* Question Card */}
      <Card style={{ minHeight: '400px' }}>
        {renderQuestion()}

        {/* Explanation */}
        {showExplanation && (
          <div
            style={{
              marginTop: '32px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: isCorrect ? '#f6ffed' : '#fff1f0',
              border: `1px solid ${isCorrect ? '#b7eb8f' : '#ffa39e'}`
            }}
          >
            <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              {isCorrect ? (
                <span style={{ color: '#52c41a' }}>
                  <CheckCircleOutlined /> Chính xác!
                </span>
              ) : (
                <span style={{ color: '#ff4d4f' }}>
                  <CloseCircleOutlined /> Sai rồi!
                </span>
              )}
            </p>
            {!isCorrect && (
              <p>
                <strong>Đáp án đúng:</strong> {currentQuestion.correct_answer}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          {!showExplanation ? (
            <Button type="primary" size="large" onClick={handleAnswer}>
              Trả lời
            </Button>
          ) : (
            <Button type="primary" size="large" onClick={handleNext}>
              {currentIndex < quiz.questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QuizSession;
