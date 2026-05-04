#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    ENGLISHMASTER SETUP SCRIPT                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the backend directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Step 1: Dependencies installed${NC}"
echo ""

# Check MySQL
echo "Checking MySQL..."
if systemctl is-active --quiet mysql 2>/dev/null || service mysql status >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Step 2: MySQL is running${NC}"
else
    echo -e "${RED}❌ MySQL is not running. Please start MySQL first.${NC}"
    exit 1
fi
echo ""

# Prompt for MySQL password
echo -e "${YELLOW}📝 Step 3: Database Setup${NC}"
echo ""
read -sp "Enter MySQL root password (press Enter if no password): " MYSQL_PASSWORD
echo ""

# Create database
echo ""
echo "Creating database..."
if [ -z "$MYSQL_PASSWORD" ]; then
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS englishmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
else
    mysql -u root -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS englishmaster CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database 'englishmaster' created successfully${NC}"

    # Update .env file with password
    if [ ! -z "$MYSQL_PASSWORD" ]; then
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$MYSQL_PASSWORD/" .env
        echo -e "${GREEN}✅ Updated .env with MySQL password${NC}"
    fi
else
    echo -e "${RED}❌ Failed to create database. Please check your MySQL password.${NC}"
    exit 1
fi
echo ""

# Run migrations
echo -e "${YELLOW}📝 Step 4: Running migrations...${NC}"
npm run migrate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed successfully${NC}"
else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
fi
echo ""

# Seed database
echo -e "${YELLOW}📝 Step 5: Seeding database...${NC}"
npm run seed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
    echo -e "${RED}❌ Seeding failed${NC}"
    exit 1
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                          🎉 SETUP COMPLETE! 🎉                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ All setup steps completed successfully!${NC}"
echo ""
echo "📝 Sample Credentials:"
echo "   Admin: admin@englishmaster.com / admin123"
echo "   User:  john@example.com / password123"
echo ""
echo "🚀 To start the server, run:"
echo "   npm run dev"
echo ""
echo "📍 Server will be available at:"
echo "   http://localhost:5000"
echo ""
