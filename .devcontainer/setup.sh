#!/bin/bash
set -e

echo "🚀 Setting up Spaces Angels Development Environment..."

# Install pnpm globally
echo "📦 Installing pnpm..."
npm install -g pnpm

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Set up the database
echo "🗄️ Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE spaces_angels_dev;" || true
sudo -u postgres psql -c "CREATE USER spaces_user WITH PASSWORD 'spaces_pass';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE spaces_angels_dev TO spaces_user;" || true

# Copy env.example if .env doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env from env.example..."
    cp env.example .env
    echo "⚠️  Please update .env with your actual credentials!"
fi

# Run database migrations
echo "🔄 Running database migrations..."
pnpm payload migrate || echo "⚠️  Migrations will run on first start"

# Build the project
echo "🔨 Building the project..."
pnpm build || echo "⚠️  Build will complete on first run"

echo "✅ Setup complete! Your Spaces Angels development environment is ready."
echo ""
echo "🎯 Next steps:"
echo "1. Update your .env file with actual credentials"
echo "2. Run 'pnpm dev' to start the development server"
echo "3. Access the app at http://localhost:3000"
echo "4. Access Payload Admin at http://localhost:3000/admin"
echo ""
echo "🚀 Happy coding, Guardian Angel!"
