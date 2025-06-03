#!/bin/bash

# Celebrity Connect - Deployment Script
# This script helps automate the deployment process

set -e  # Exit on any error

echo "🚀 Celebrity Connect Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Clean up development files
cleanup_dev_files() {
    print_status "Cleaning up development files..."
    
    # Remove development files
    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".env" -type f -delete 2>/dev/null || true
    find . -name "*.log" -type f -delete 2>/dev/null || true
    find . -name "*-cookies.txt" -type f -delete 2>/dev/null || true
    
    # Remove test files
    rm -f backend/test-*.js 2>/dev/null || true
    rm -f backend/check-*.js 2>/dev/null || true
    rm -f backend/create-*.js 2>/dev/null || true
    rm -f backend/fix-*.js 2>/dev/null || true
    rm -f backend/update-*.js 2>/dev/null || true
    rm -f *.html 2>/dev/null || true
    
    print_success "Development files cleaned up!"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    npm install
    npm run build
    cd ..
    
    print_success "Frontend built successfully!"
}

# Prepare backend
prepare_backend() {
    print_status "Preparing backend..."
    
    cd backend
    npm install --production
    cd ..
    
    print_success "Backend prepared successfully!"
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p dist
    
    # Copy necessary files
    cp -r backend dist/
    cp -r frontend/build dist/frontend
    cp -r deployment dist/
    cp README.md dist/
    cp DEPLOYMENT_GUIDE.md dist/
    
    # Create archive
    tar -czf celebrity-connect-deployment.tar.gz -C dist .
    
    print_success "Deployment package created: celebrity-connect-deployment.tar.gz"
}

# Initialize git repository
init_git_repo() {
    print_status "Initializing Git repository..."
    
    if [ ! -d ".git" ]; then
        git init
        git add .
        git commit -m "Initial commit - Celebrity Connect platform"
        print_success "Git repository initialized!"
    else
        print_warning "Git repository already exists."
    fi
}

# Main deployment function
main() {
    echo ""
    print_status "Starting deployment preparation..."
    echo ""
    
    check_requirements
    cleanup_dev_files
    build_frontend
    prepare_backend
    create_deployment_package
    init_git_repo
    
    echo ""
    print_success "🎉 Deployment preparation complete!"
    echo ""
    echo "Next steps:"
    echo "1. Create a GitHub repository"
    echo "2. Push your code: git remote add origin <your-repo-url> && git push -u origin main"
    echo "3. Deploy backend to Railway: https://railway.app"
    echo "4. Deploy frontend to Vercel: https://vercel.com"
    echo "5. Configure environment variables"
    echo "6. Run database migration"
    echo ""
    echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
    echo ""
}

# Run main function
main
