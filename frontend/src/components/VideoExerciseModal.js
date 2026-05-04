import React, { useState, useEffect, useRef } from 'react';

const VideoExerciseModal = ({
  isOpen,
  onClose,
  subtitle,
  type, // 'dictation' | 'pronunciation'
  onSubmitDictation,
  onSubmitPronunciation,
  isSubmitting
}) => {
  const [dictationText, setDictationText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState(null);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (type === 'pronunciation' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        if (currentTranscript) {
          setTranscript((prev) => (prev + ' ' + currentTranscript).trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [type]);

  // Reset state when subtitle or type changes
  useEffect(() => {
    setDictationText('');
    setTranscript('');
    setResult(null);
    setAttempts(0);
    setIsRecording(false);
  }, [subtitle, type]);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Your browser does not support speech recognition. Please use Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript(''); // Clear previous recording
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmitDictation = async () => {
    if (!dictationText.trim()) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const res = await onSubmitDictation(subtitle.id, dictationText);
    setResult(res);
  };

  const handleSubmitPronunciation = async () => {
    if (!transcript.trim()) return;

    const res = await onSubmitPronunciation(subtitle.id, transcript);
    setResult(res);
  };

  const handleContinue = () => {
    onClose(true); // true means success/continue
  };

  if (!isOpen || !subtitle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {type === 'dictation' ? '✍️ Dictation Exercise' : '🎤 Pronunciation Exercise'}
            </h2>
            <button
              onClick={() => onClose(false)}
              className="text-gray-500 hover:text-gray-700 font-bold text-xl"
            >
              ×
            </button>
          </div>

          {/* Prompt Section */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800 font-medium">
              {type === 'dictation'
                ? 'Listen carefully and type what you hear:'
                : 'Read this sentence out loud:'}
            </p>
            {type === 'pronunciation' && (
              <p className="text-xl text-gray-800 mt-3 font-semibold bg-white p-3 rounded shadow-sm border border-blue-100">
                {subtitle.text_en}
              </p>
            )}
          </div>

          {/* Input Section */}
          {type === 'dictation' ? (
            <div className="mb-6">
              <textarea
                value={dictationText}
                onChange={(e) => setDictationText(e.target.value)}
                placeholder="Type the English text here..."
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 text-lg"
                rows="3"
                disabled={isSubmitting || (result && result.isCorrect)}
              />
            </div>
          ) : (
            <div className="mb-6 flex flex-col items-center">
              <div className="w-full mb-4">
                <p className="text-gray-600 mb-2">Your recording:</p>
                <div className="w-full p-4 min-h-[80px] bg-gray-50 border border-gray-200 rounded-lg text-lg">
                  {transcript || <span className="text-gray-400 italic">No audio recorded yet...</span>}
                </div>
              </div>

              <button
                onClick={handleToggleRecording}
                disabled={isSubmitting || (result && result.passed)}
                className={`flex items-center justify-center space-x-2 px-8 py-4 rounded-full font-bold text-lg text-white transition-all transform hover:scale-105 ${
                  isRecording
                    ? 'bg-red-500 animate-pulse shadow-lg shadow-red-200'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                <span className="text-2xl">{isRecording ? '⏹' : '🎙'}</span>
                <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
              </button>
            </div>
          )}

          {/* Action Buttons (Submit) */}
          {!result && (
            <div className="flex justify-end">
              <button
                onClick={type === 'dictation' ? handleSubmitDictation : handleSubmitPronunciation}
                disabled={isSubmitting || (type === 'dictation' ? !dictationText.trim() : !transcript.trim())}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50 transition-colors shadow-md"
              >
                {isSubmitting ? 'Checking...' : 'Check Answer'}
              </button>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className={`mt-6 p-5 rounded-xl border ${
              (type === 'dictation' ? result.isCorrect : result.passed)
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">
                  {(type === 'dictation' ? result.isCorrect : result.passed) ? '🎉' : '💡'}
                </span>
                <h3 className={`text-xl font-bold ${
                  (type === 'dictation' ? result.isCorrect : result.passed) ? 'text-green-700' : 'text-red-700'
                }`}>
                  {(type === 'dictation' ? result.isCorrect : result.passed)
                    ? 'Excellent! Correct!'
                    : 'Not quite right. Keep trying!'}
                </h3>
                <span className="ml-auto font-bold bg-white px-3 py-1 rounded-full shadow-sm text-gray-700">
                  Score: {result.score}/100
                </span>
              </div>

              <div className="mb-4 text-gray-700 bg-white p-3 rounded border border-gray-100">
                <p className="font-semibold text-sm text-gray-500 mb-1">Feedback:</p>
                <p>{result.feedback_vi}</p>
              </div>

              {type === 'dictation' && !result.isCorrect && result.highlightedAnswer && (
                <div className="mb-4 p-3 bg-white rounded border border-gray-100">
                  <p className="font-semibold text-sm text-gray-500 mb-1">Your answer with errors:</p>
                  <p className="text-lg" dangerouslySetInnerHTML={{
                    __html: result.highlightedAnswer.replace(/<error>/g, '<span class="text-red-500 font-bold underline">').replace(/<\/error>/g, '</span>')
                  }} />
                </div>
              )}

              {type === 'pronunciation' && result.wordScores && result.wordScores.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-sm text-gray-500 mb-2">Word Analysis:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.wordScores.map((ws, i) => (
                      <span key={i} className={`px-2 py-1 rounded border ${
                        ws.score >= 80 ? 'bg-green-100 border-green-300 text-green-800' :
                        ws.score >= 60 ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                        'bg-red-100 border-red-300 text-red-800 font-medium'
                      }`}>
                        {ws.word} <span className="text-xs opacity-75">{ws.score}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* XP Award */}
              {result.xpEarned > 0 && (
                <div className="flex items-center text-yellow-600 font-bold mb-4 animate-bounce">
                  <span className="mr-2">⭐</span> +{result.xpEarned} XP Earned!
                </div>
              )}

              <div className="flex justify-end gap-3 mt-5">
                {!(type === 'dictation' ? result.isCorrect : result.passed) && attempts < 3 && (
                  <button
                    onClick={() => {
                      setResult(null);
                      if (type === 'pronunciation') setTranscript('');
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                )}

                {(!(type === 'dictation' ? result.isCorrect : result.passed) && attempts >= 3) && (
                  <button
                    onClick={() => alert(`Correct answer: ${subtitle.text_en}`)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    Show Answer
                  </button>
                )}

                <button
                  onClick={handleContinue}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded-lg shadow-md transition-colors"
                >
                  Continue Video
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoExerciseModal;
