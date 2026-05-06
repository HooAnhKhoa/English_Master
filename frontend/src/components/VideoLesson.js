import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import VideoExerciseModal from './VideoExerciseModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const VideoLesson = ({ videoId }) => {
  const [video, setVideo] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    currentTime: 0,
    completedSegments: [],
    isCompleted: false
  });
  const [activeExercise, setActiveExercise] = useState(null); // { subtitle, type }
  const [player, setPlayer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const playerRef = useRef(null);
  const checkIntervalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [videoRes, progressRes] = await Promise.all([
          axios.get(`${API_URL}/videos/${videoId}`, { headers }),
          axios.get(`${API_URL}/videos/${videoId}/progress`, { headers })
        ]);

        setVideo(videoRes.data.data);
        setSubtitles(videoRes.data.data.subtitles || []);

        // Handle progress response - it might return default values if no progress exists
        if (progressRes.data.success && progressRes.data.data) {
          setProgress({
            currentTime: progressRes.data.data.currentTime || 0,
            completedSegments: progressRes.data.data.completedSegments || [],
            isCompleted: progressRes.data.data.isCompleted || false
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching video data', error);
        // If progress fetch fails, set default progress
        if (error.response?.config?.url?.includes('/progress')) {
          setProgress({
            currentTime: 0,
            completedSegments: [],
            isCompleted: false
          });
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  // Periodic check for current time to trigger exercises
  useEffect(() => {
    if (player && !activeExercise) {
      checkIntervalRef.current = setInterval(() => {
        const currentTime = player.getCurrentTime();

        // Find next exercise point
        const nextSubtitle = subtitles.find(sub => {
          // Trigger when player time is close to subtitle start time
          // and this segment hasn't been completed yet
          return (
            currentTime >= sub.start_time &&
            currentTime <= sub.start_time + 1 &&
            !progress.completedSegments.includes(sub.id)
          );
        });

        if (nextSubtitle) {
          player.pauseVideo();
          // Alternate exercise type
          const type = Math.random() > 0.5 ? 'dictation' : 'pronunciation';
          setActiveExercise({ subtitle: nextSubtitle, type });
          clearInterval(checkIntervalRef.current);
        }
      }, 500);
    }

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [player, activeExercise, subtitles, progress.completedSegments]);

  const onPlayerReady = (event) => {
    setPlayer(event.target);
    // Seek to last saved position
    if (progress.currentTime > 0) {
      event.target.seekTo(progress.currentTime);
    }
  };

  const handleExerciseClose = async (success) => {
    setActiveExercise(null);
    if (success) {
      // Reload progress to get updated completed segments
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/videos/${videoId}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.data) {
          setProgress({
            currentTime: res.data.data.currentTime || 0,
            completedSegments: res.data.data.completedSegments || [],
            isCompleted: res.data.data.isCompleted || false
          });
        }
      } catch (error) {
        console.error('Error refreshing progress', error);
      }
    }
    // Resume video after a small delay
    if (player) {
      setTimeout(() => player.playVideo(), 500);
    }
  };

  const submitDictation = async (subtitleId, studentAnswer) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API_URL}/videos/${videoId}/dictation`,
        { subtitleId, studentAnswer },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setIsSubmitting(false);
      return res.data.data;
    } catch (error) {
      console.error('Dictation error', error);
      setIsSubmitting(false);
      return { score: 0, isCorrect: false, feedback_vi: 'Error checking answer' };
    }
  };

  const submitPronunciation = async (subtitleId, spokenText) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API_URL}/videos/${videoId}/pronunciation`,
        { subtitleId, spokenText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setIsSubmitting(false);
      return res.data.data;
    } catch (error) {
      console.error('Pronunciation error', error);
      setIsSubmitting(false);
      return { score: 0, passed: false, feedback_vi: 'Error checking pronunciation' };
    }
  };

  const handleSaveProgress = async () => {
    if (!player) return;
    try {
      await axios.post(
        `${API_URL}/videos/${videoId}/progress`,
        {
          currentTime: player.getCurrentTime(),
          completedSegments: progress.completedSegments
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (error) {
      console.error('Save progress error', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
    </div>
  );

  // Check if video data is invalid
  if (!video) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Not Found</h2>
          <p className="text-gray-600 mb-6">The video you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Validate YouTube ID
  const isValidYouTubeId = video.youtube_id && video.youtube_id.length > 0;

  const opts = {
    height: '450',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      enablejsapi: 1
    },
  };

  const completionPercentage = subtitles.length > 0
    ? Math.round((progress.completedSegments.length / subtitles.length) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Video) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="aspect-video">
              {isValidYouTubeId ? (
                <YouTube
                  videoId={video.youtube_id}
                  opts={opts}
                  onReady={onPlayerReady}
                  onEnd={handleSaveProgress}
                  onPause={handleSaveProgress}
                  onError={(e) => {
                    console.error('YouTube player error:', e);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-5xl mb-4">🎥</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Video Unavailable</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      This video cannot be played. It may be private, restricted, or removed.
                    </p>
                    <p className="text-xs text-gray-500">
                      Please contact the administrator to update the video.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{video?.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                  {video?.level}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  {video?.category || 'General'}
                </span>
                <span>
                  {video?.duration_sec
                    ? `${Math.floor(video.duration_sec / 60)} minutes`
                    : 'Duration not available'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Learning Progress</h3>
              <span className="text-blue-600 font-bold">{completionPercentage}% Completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {subtitles.map((sub, index) => (
                <div
                  key={sub.id}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    progress.completedSegments.includes(sub.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  title={sub.text_en}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (Subtitles List) */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[750px]">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-lg text-gray-800">Video Content</h3>
          </div>
          <div className="overflow-y-auto flex-grow p-2 space-y-2">
            {!subtitles || subtitles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="text-5xl mb-3">📝</div>
                <p className="text-sm font-medium">No subtitles available</p>
                <p className="text-xs mt-1">Subtitles will appear here when added</p>
              </div>
            ) : (
              subtitles.map((sub, index) => (
                <button
                  key={sub.id}
                  onClick={() => player?.seekTo(sub.start_time)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    progress.completedSegments.includes(sub.id)
                      ? 'bg-green-50 border-green-100 border'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <span className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-3 text-xs font-bold ${
                      progress.completedSegments.includes(sub.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{sub.text_en}</p>
                      <p className="text-xs text-gray-500 mt-1">{sub.text_vi}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Exercise Modal */}
      <VideoExerciseModal
        isOpen={!!activeExercise}
        onClose={handleExerciseClose}
        subtitle={activeExercise?.subtitle}
        type={activeExercise?.type}
        onSubmitDictation={submitDictation}
        onSubmitPronunciation={submitPronunciation}
        isSubmitting={isSubmitting}
      />

      {/* Completion Modal */}
      {progress.isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-10 text-center max-w-md shadow-2xl transform animate-bounce">
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Lesson Complete!</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Congratulations! You have successfully mastered this video lesson.
            </p>
            <div className="bg-yellow-50 rounded-2xl p-6 mb-8 flex justify-center items-center">
              <span className="text-4xl mr-3">⭐</span>
              <div className="text-left">
                <p className="text-sm text-yellow-800 uppercase font-bold tracking-wider">Bonus Earned</p>
                <p className="text-2xl font-black text-yellow-600">+50 XP</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg transition-transform hover:scale-105"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLesson;
