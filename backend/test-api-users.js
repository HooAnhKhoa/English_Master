const { User } = require('./models');

async function testUsersAPI() {
  try {
    const users = await User.findAll({
      limit: 2,
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] },
      order: [['created_at', 'DESC']]
    });

    console.log('Raw Sequelize result:');
    console.log(JSON.stringify(users, null, 2));

    console.log('\n\nJSON serialized:');
    const jsonUsers = users.map(u => u.toJSON());
    console.log(JSON.stringify(jsonUsers, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testUsersAPI();
