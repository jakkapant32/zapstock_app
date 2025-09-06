#!/bin/bash

# 🚀 ZapStock Backend Deployment Script

echo "🚀 Starting ZapStock Backend Deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy ZapStock Backend to Railway"

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo "🔗 Please add your GitHub repository as origin:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/zapstock-backend.git"
    echo "   Then run this script again."
    exit 1
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo "✅ Deployment complete!"
echo "🌐 Next steps:"
echo "   1. Go to https://railway.app"
echo "   2. Sign in with GitHub"
echo "   3. Create new project from your repository"
echo "   4. Add PostgreSQL database"
echo "   5. Set environment variables"
echo "   6. Get your API URL and update frontend"
