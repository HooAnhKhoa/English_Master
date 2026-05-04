const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/database');
const { User } = require('./models');

async function updateUserPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('🔐 Password hashed');

    // Update user
    await User.update(
      { password: hashedPassword },
      { where: { email: 'john@example.com' } }
    );

    console.log('✅ Password updated for john@example.com');
    console.log('You can now login with:');
    console.log('  Email: john@example.com');
    console.log('  Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserPassword();
