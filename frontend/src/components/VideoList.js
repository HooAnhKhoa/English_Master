import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoList = ({ onSelectVideo }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/v1/videos', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setVideos(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos', error);
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🎥 Video Lessons</h1>

        {videos.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No video lessons available yet. Please check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(video => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video.id)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
              >
                <div className="aspect-video relative bg-gray-100">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <img src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} alt={video.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(video.duration_sec / 60)}:{(video.duration_sec % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold">
                      Level: {video.level}
                    </span>
                    <span className="text-gray-500 text-sm">{video.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoList;
