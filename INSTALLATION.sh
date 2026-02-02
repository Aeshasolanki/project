#!/bin/bash

echo "🚀 Mukhawar Platform Installation Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo -e "${YELLOW}Step 1: Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION installed${NC}"
echo ""

# Step 2: Check MongoDB
echo -e "${YELLOW}Step 2: Checking MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. You can:"
    echo "   1. Install MongoDB locally: sudo apt-get install mongodb"
    echo "   2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
else
    MONGO_VERSION=$(mongod --version | head -n 1)
    echo -e "${GREEN}✅ $MONGO_VERSION${NC}"
fi
echo ""

# Step 3: Install backend dependencies
echo -e "${YELLOW}Step 3: Installing backend dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo ""

# Step 4: Install frontend dependencies
echo -e "${YELLOW}Step 4: Installing frontend dependencies...${NC}"
cd client
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..
echo ""

# Step 5: Setup environment file
echo -e "${YELLOW}Step 5: Setting up environment file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo "⚠️  Please edit .env file with your configuration"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Final instructions
echo "=========================================="
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start MongoDB: sudo systemctl start mongodb"
echo "3. Run backend: npm run dev"
echo "4. Run frontend (new terminal): cd client && npm start"
echo ""
echo "Or run both with: npm run dev:full"
echo ""
echo "Access application at: http://localhost:3000"
echo "API available at: http://localhost:5000"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
