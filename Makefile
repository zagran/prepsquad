.PHONY: help dev stop build clean deploy-backend deploy-frontend logs

help:
	@echo "PrepSquad - Available Commands"
	@echo "==============================="
	@echo "Local Development:"
	@echo "  make dev              - Start both frontend and backend with Docker"
	@echo "  make stop             - Stop all Docker containers"
	@echo "  make logs             - View Docker logs"
	@echo "  make build            - Build Docker images"
	@echo "  make clean            - Remove Docker containers and volumes"
	@echo ""
	@echo "AWS Deployment:"
	@echo "  make deploy-backend   - Deploy backend to AWS Lambda"
	@echo "  make deploy-frontend  - Build and prepare frontend for S3"
	@echo ""

dev:
	@echo "🚀 Starting PrepSquad with Docker..."
	docker compose up -d
	@echo "✅ Services started!"
	@echo "   Frontend: http://localhost:5173"
	@echo "   Backend:  http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"

stop:
	@echo "🛑 Stopping services..."
	docker compose down
	@echo "✅ Services stopped"

build:
	@echo "🔨 Building Docker images..."
	docker compose build
	@echo "✅ Build complete"

clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker compose down -v
	@echo "✅ Cleanup complete"

logs:
	docker compose logs -f

deploy-backend:
	@echo "🚀 Deploying backend to AWS Lambda..."
	cd backend && ./deploy.sh

deploy-frontend:
	@echo "📦 Building frontend for production..."
	cd frontend && npm install && npm run build
	@echo "✅ Frontend built successfully!"
	@echo "📁 Static files are in frontend/dist/"
	@echo ""
	@echo "To deploy to S3, run:"
	@echo "  aws s3 sync frontend/dist/ s3://your-bucket-name/ --delete"
