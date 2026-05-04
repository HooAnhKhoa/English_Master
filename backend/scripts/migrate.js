const { sequelize } = require('../config/database');

/**
 * Run database migrations
 * Creates all tables based on Sequelize models
 */
async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    // Import models to register them
    require('../models');

    // Sync all models with database
    // force: false - Don't drop existing tables
    // alter: true - Modify existing tables to match models
    await sequelize.sync({ alter: true });

    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Undo migrations (drop all tables)
 */
async function undoMigration() {
  try {
    console.log('🔄 Undoing database migration...');

    // Import models
    require('../models');

    // Drop all tables
    await sequelize.drop();

    console.log('✅ All tables dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Undo migration failed:', error);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--undo')) {
  undoMigration();
} else {
  migrate();
}
