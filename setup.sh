#!/bin/bash

# Trinity Dev Web - Setup and Run Script
# This script helps automate the setup and running of the project

set -e  # Exit on error

BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

echo "🚀 Trinity Dev Web - Setup Script"
echo "================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.13+"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Node.js/npm is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Backend setup
echo "🔧 Setting up Backend..."
cd $BACKEND_DIR

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -q -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

echo "Running migrations..."
python manage.py migrate

echo "✅ Backend setup complete!"
echo ""

cd ..

# Frontend setup
echo "🎨 Setting up Frontend..."
cd $FRONTEND_DIR

if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo "✅ Frontend setup complete!"
echo ""

cd ..

# Final instructions
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd $BACKEND_DIR"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd $FRONTEND_DIR"
echo "   npm run dev"
echo ""
echo "3. Create superuser (if not done):"
echo "   cd $BACKEND_DIR"
echo "   source venv/bin/activate"
echo "   python manage.py createsuperuser"
echo ""
echo "Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000/api/"
echo "  - API Docs: http://localhost:8000/api/docs/"
echo "  - Admin Panel: http://localhost:8000/admin/"
echo ""
echo "📚 For more information, see README.md or QUICKSTART.md"
