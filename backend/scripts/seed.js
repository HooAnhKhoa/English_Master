const {
  User,
  Topic,
  Vocabulary,
  Lesson,
  Exercise,
  Badge,
  VideoLesson,
  VideoSubtitle,
} = require('../models');

/**
 * Seed database with sample data
 */
async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@englishmaster.com',
      password: 'admin123',
      full_name: 'Admin User',
      role: 'admin',
      level: 'advanced',
      xp: 10000,
      coins: 5000,
    });

    console.log('✅ Admin user created');

    // 2. Create sample users
    const users = await User.bulkCreate([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        full_name: 'John Doe',
        level: 'intermediate',
        xp: 500,
        coins: 100,
        streak: 5,
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        full_name: 'Jane Smith',
        level: 'beginner',
        xp: 200,
        coins: 50,
        streak: 3,
      },
    ]);

    console.log('✅ Sample users created');

    // 3. Create topics
    const topics = await Topic.bulkCreate([
      {
        name: 'Daily Life',
        name_vi: 'Cuộc sống hàng ngày',
        slug: 'daily-life',
        icon: '🏠',
        description: 'Common words and phrases for everyday situations',
        level: 'A1',
        sort_order: 1,
      },
      {
        name: 'Food & Drink',
        name_vi: 'Đồ ăn & Thức uống',
        slug: 'food-drink',
        icon: '🍔',
        description: 'Vocabulary related to food, drinks, and dining',
        level: 'A1',
        sort_order: 2,
      },
      {
        name: 'Travel',
        name_vi: 'Du lịch',
        slug: 'travel',
        icon: '✈️',
        description: 'Words and phrases for traveling and tourism',
        level: 'A2',
        sort_order: 3,
      },
      {
        name: 'Business',
        name_vi: 'Kinh doanh',
        slug: 'business',
        icon: '💼',
        description: 'Professional vocabulary for business contexts',
        level: 'B1',
        sort_order: 4,
      },
    ]);

    console.log('✅ Topics created');

    // 4. Create vocabularies
    const vocabularies = await Vocabulary.bulkCreate([
      {
        word: 'hello',
        pronunciation: '/həˈloʊ/',
        part_of_speech: 'interjection',
        meaning: 'xin chào',
        definition: 'Used as a greeting',
        example: 'Hello! How are you today?',
        example_vi: 'Xin chào! Hôm nay bạn thế nào?',
        level: 'A1',
        topic_id: topics[0].id,
        created_by: admin.id,
      },
      {
        word: 'goodbye',
        pronunciation: '/ɡʊdˈbaɪ/',
        part_of_speech: 'interjection',
        meaning: 'tạm biệt',
        definition: 'Used to express good wishes when parting',
        example: 'Goodbye! See you tomorrow.',
        example_vi: 'Tạm biệt! Hẹn gặp lại ngày mai.',
        level: 'A1',
        topic_id: topics[0].id,
        created_by: admin.id,
      },
      {
        word: 'restaurant',
        pronunciation: '/ˈrestərɑːnt/',
        part_of_speech: 'noun',
        meaning: 'nhà hàng',
        definition: 'A place where people pay to sit and eat meals',
        example: 'We had dinner at a nice restaurant.',
        example_vi: 'Chúng tôi đã ăn tối tại một nhà hàng đẹp.',
        level: 'A1',
        topic_id: topics[1].id,
        created_by: admin.id,
      },
      {
        word: 'delicious',
        pronunciation: '/dɪˈlɪʃəs/',
        part_of_speech: 'adjective',
        meaning: 'ngon',
        definition: 'Having a very pleasant taste',
        example: 'This cake is delicious!',
        example_vi: 'Chiếc bánh này ngon quá!',
        level: 'A1',
        topic_id: topics[1].id,
        created_by: admin.id,
      },
    ]);

    // Update topic word counts
    await topics[0].update({ word_count: 2 });
    await topics[1].update({ word_count: 2 });

    console.log('✅ Vocabularies created');

    // 5. Create lessons
    const lessons = await Lesson.bulkCreate([
      {
        title: 'Greetings and Introductions',
        title_vi: 'Chào hỏi và Giới thiệu',
        slug: 'greetings-introductions',
        description: 'Learn how to greet people and introduce yourself',
        level: 'A1',
        category: 'speaking',
        content: '<h1>Greetings</h1><p>Learn basic greetings in English...</p>',
        duration: 15,
        is_published: true,
        sort_order: 1,
        created_by: admin.id,
      },
      {
        title: 'Present Simple Tense',
        title_vi: 'Thì Hiện tại đơn',
        slug: 'present-simple-tense',
        description: 'Master the present simple tense',
        level: 'A1',
        category: 'grammar',
        content: '<h1>Present Simple</h1><p>The present simple tense is used for...</p>',
        duration: 20,
        is_published: true,
        sort_order: 2,
        created_by: admin.id,
      },
    ]);

    console.log('✅ Lessons created');

    // 6. Create exercises
    await Exercise.bulkCreate([
      {
        lesson_id: lessons[0].id,
        type: 'multiple-choice',
        question: 'How do you greet someone in the morning?',
        options: JSON.stringify(['Good morning', 'Good night', 'Goodbye', 'Thank you']),
        correct_answer: 'Good morning',
        explanation: 'We use "Good morning" to greet people in the morning.',
        points: 10,
        difficulty: 'easy',
        sort_order: 1,
      },
      {
        lesson_id: lessons[0].id,
        type: 'fill-blank',
        question: 'Complete: "Nice to ____ you."',
        correct_answer: 'meet',
        explanation: 'The phrase is "Nice to meet you" when meeting someone for the first time.',
        points: 10,
        difficulty: 'easy',
        sort_order: 2,
      },
      {
        lesson_id: lessons[1].id,
        type: 'multiple-choice',
        question: 'Which sentence is in present simple?',
        options: JSON.stringify(['I am eating', 'I eat breakfast', 'I ate lunch', 'I will eat dinner']),
        correct_answer: 'I eat breakfast',
        explanation: 'Present simple uses the base form of the verb.',
        points: 10,
        difficulty: 'medium',
        sort_order: 1,
      },
    ]);

    console.log('✅ Exercises created');

    // 7. Create badges
    await Badge.bulkCreate([
      {
        name: 'First Step',
        name_vi: 'Bước đầu tiên',
        description: 'Learn your first word',
        icon: '🌱',
        condition_type: 'words_learned',
        condition_value: 1,
        xp_reward: 10,
        rarity: 'common',
      },
      {
        name: 'Word Collector',
        name_vi: 'Nhà sưu tập từ',
        description: 'Learn 100 words',
        icon: '📚',
        condition_type: 'words_learned',
        condition_value: 100,
        xp_reward: 50,
        rarity: 'common',
      },
      {
        name: 'On Fire',
        name_vi: 'Bốc lửa',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        condition_type: 'streak',
        condition_value: 7,
        xp_reward: 50,
        rarity: 'common',
      },
      {
        name: 'Unstoppable',
        name_vi: 'Không thể ngăn',
        description: 'Maintain a 30-day streak',
        icon: '⚡',
        condition_type: 'streak',
        condition_value: 30,
        xp_reward: 200,
        rarity: 'epic',
      },
    ]);

    console.log('✅ Badges created');

    // 8. Create video lesson
    const video = await VideoLesson.create({
      title: 'English Conversation for Beginners',
      youtube_id: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      level: 'A1',
      category: 'listening',
      duration_sec: 300,
      is_published: true,
      created_by: admin.id,
    });

    await VideoSubtitle.bulkCreate([
      {
        video_id: video.id,
        start_time: 0.0,
        end_time: 3.5,
        text_en: 'Hello, welcome to our English lesson.',
        text_vi: 'Xin chào, chào mừng đến với bài học tiếng Anh của chúng tôi.',
        sort_order: 0,
      },
      {
        video_id: video.id,
        start_time: 3.5,
        end_time: 7.0,
        text_en: 'Today we will learn basic greetings.',
        text_vi: 'Hôm nay chúng ta sẽ học các lời chào cơ bản.',
        sort_order: 1,
      },
    ]);

    console.log('✅ Video lesson and subtitles created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Sample credentials:');
    console.log('Admin: admin@englishmaster.com / admin123');
    console.log('User: john@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seed();
