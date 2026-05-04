import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import VideoExerciseModal from './VideoExerciseModal';

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
        const [videoRes, progressRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/v1/videos/${videoId}`),
          axios.get(`http://localhost:5000/api/v1/videos/${videoId}/progress`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setVideo(videoRes.data.data);
        setSubtitles(videoRes.data.data.subtitles || []);
        setProgress(progressRes.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching video data', error);
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
        const res = await axios.get(`http://localhost:5000/api/v1/videos/${videoId}/progress`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProgress(res.data.data);
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
        `http://localhost:5000/api/v1/videos/${videoId}/dictation`,
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
        `http://localhost:5000/api/v1/videos/${videoId}/pronunciation`,
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
        `http://localhost:5000/api/v1/videos/${videoId}/progress`,
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

  const opts = {
    height: '450',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0
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
              <YouTube
                videoId={video?.youtube_id}
                opts={opts}
                onReady={onPlayerReady}
                onEnd={handleSaveProgress}
                onPause={handleSaveProgress}
              />
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{video?.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                  {video?.level}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  {video?.category}
                </span>
                <span>{Math.floor(video?.duration_sec / 60)} minutes</span>
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
            {subtitles.map((sub, index) => (
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
            ))}
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
