-- Create sample badges for the system
INSERT INTO badges (name, name_vi, description, icon, condition_type, condition_value, xp_reward, rarity) VALUES
-- Words Learned Badges
('First Steps', 'Bước Đầu Tiên', 'Learn your first 10 words', '🌱', 'words_learned', 10, 50, 'common'),
('Word Explorer', 'Nhà Thám Hiểm Từ Vựng', 'Learn 50 words', '📚', 'words_learned', 50, 100, 'common'),
('Vocabulary Master', 'Bậc Thầy Từ Vựng', 'Learn 200 words', '🎓', 'words_learned', 200, 200, 'rare'),
('Dictionary Pro', 'Chuyên Gia Từ Điển', 'Learn 500 words', '📖', 'words_learned', 500, 500, 'epic'),
('Word Wizard', 'Phù Thủy Từ Vựng', 'Learn 1000 words', '🧙', 'words_learned', 1000, 1000, 'legendary'),

-- Streak Badges
('Consistent Learner', 'Người Học Kiên Trì', 'Maintain a 3-day streak', '🔥', 'streak', 3, 50, 'common'),
('Week Warrior', 'Chiến Binh Tuần', 'Maintain a 7-day streak', '⚡', 'streak', 7, 150, 'rare'),
('Month Champion', 'Nhà Vô Địch Tháng', 'Maintain a 30-day streak', '🏆', 'streak', 30, 500, 'epic'),
('Unstoppable', 'Không Thể Ngăn Cản', 'Maintain a 100-day streak', '💎', 'streak', 100, 2000, 'legendary'),

-- Lessons Completed Badges
('Lesson Starter', 'Người Mới Bắt Đầu', 'Complete 5 lessons', '📝', 'lessons_completed', 5, 50, 'common'),
('Dedicated Student', 'Học Sinh Chăm Chỉ', 'Complete 20 lessons', '✏️', 'lessons_completed', 20, 150, 'rare'),
('Course Master', 'Bậc Thầy Khóa Học', 'Complete 50 lessons', '🎯', 'lessons_completed', 50, 300, 'epic'),
('Education Legend', 'Huyền Thoại Giáo Dục', 'Complete 100 lessons', '👑', 'lessons_completed', 100, 1000, 'legendary'),

-- XP Badges
('XP Novice', 'Tân Binh XP', 'Earn 500 XP', '⭐', 'xp', 500, 100, 'common'),
('XP Expert', 'Chuyên Gia XP', 'Earn 2000 XP', '🌟', 'xp', 2000, 200, 'rare'),
('XP Master', 'Bậc Thầy XP', 'Earn 5000 XP', '✨', 'xp', 5000, 500, 'epic'),
('XP Legend', 'Huyền Thoại XP', 'Earn 10000 XP', '💫', 'xp', 10000, 1500, 'legendary'),

-- Video Badges
('Video Beginner', 'Người Mới Xem Video', 'Complete 3 video lessons', '🎬', 'video_completed', 3, 50, 'common'),
('Video Enthusiast', 'Người Đam Mê Video', 'Complete 10 video lessons', '📹', 'video_completed', 10, 150, 'rare'),
('Video Master', 'Bậc Thầy Video', 'Complete 25 video lessons', '🎥', 'video_completed', 25, 300, 'epic'),

-- AI Conversation Badges
('AI Curious', 'Tò Mò AI', 'Have 10 AI conversation turns', '🤖', 'ai_turns', 10, 50, 'common'),
('AI Conversationalist', 'Người Trò Chuyện AI', 'Have 50 AI conversation turns', '💬', 'ai_turns', 50, 150, 'rare'),
('AI Expert', 'Chuyên Gia AI', 'Have 200 AI conversation turns', '🗣️', 'ai_turns', 200, 500, 'epic'),

-- Perfect Score Badges
('Perfectionist', 'Người Cầu Toàn', 'Get perfect score on 5 lessons', '💯', 'perfect_score', 5, 100, 'rare'),
('Flawless Master', 'Bậc Thầy Hoàn Hảo', 'Get perfect score on 20 lessons', '🏅', 'perfect_score', 20, 500, 'epic'),
('Perfect Legend', 'Huyền Thoại Hoàn Hảo', 'Get perfect score on 50 lessons', '👑', 'perfect_score', 50, 1500, 'legendary');
