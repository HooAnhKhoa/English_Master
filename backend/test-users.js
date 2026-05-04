const { User } = require('./models');

async function testUsers() {
  try {
    const users = await User.findAll({
      limit: 5,
      attributes: ['id', 'username', 'email', 'created_at', 'last_login_date'],
      order: [['created_at', 'DESC']]
    });

    console.log('Total users:', users.length);
    console.log('\nSample users:');
    users.forEach(user => {
      console.log({
        id: user.id,
        username: user.username,
        created_at: user.created_at,
        last_login_date: user.last_login_date
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testUsers();
