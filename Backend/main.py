"""
Main entry point for the Flask API.
"""
from app.api import app, initialize_services, check_api_key
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

if __name__ == '__main__':
    logger.info("Starting Flask API for Hiring Drive Q&A System...")
    
    # Initialize services on startup
    # Services will also be initialized per-request if needed
    initialize_services()
    
    # Start the Flask application
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    app.run(
        host=settings.HOST,
        port=settings.PORT,
        debug=settings.FLASK_DEBUG
    )
