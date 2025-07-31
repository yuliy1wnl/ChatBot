"""
Main Flask API for the Hiring Drive Q&A system.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from app.rag_store import RAGStore
from app.chat_completion import ChatCompletion
from config import settings
import logging
import time
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize RAG store and chat completion
rag_store = None
chat_completion = None

def check_api_key():
    """Check if the Azure OpenAI API key is configured."""
    if not settings.AZURE_OPENAI_API_KEY or not settings.AZURE_OPENAI_ENDPOINT:
        logger.error("Azure OpenAI API key or endpoint not set. Please configure them in .env file.")
        return False
    return True

def initialize_services():
    """Initialize services for the application."""
    global rag_store, chat_completion
    
    # Check API key
    if not check_api_key():
        logger.warning("Services not fully initialized due to missing API configuration.")
        return
    
    try:
        # Initialize RAG store
        logger.info("Initializing RAG store...")
        rag_store = RAGStore()
        
        # Load document
        logger.info("Loading document...")
        rag_store.load_document()
        
        # Initialize chat completion
        logger.info("Initializing chat completion...")
        chat_completion = ChatCompletion()
        
        logger.info("All services initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing services: {e}")
        rag_store = None
        chat_completion = None

# Ensure services are initialized before requests
@app.before_request
def ensure_services_initialized():
    """Ensure services are initialized before each request."""
    global rag_store, chat_completion
    if rag_store is None or chat_completion is None:
        initialize_services()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    if rag_store and chat_completion:
        return jsonify({"status": "healthy", "message": "Service is up and running"}), 200
    else:
        return jsonify({"status": "degraded", "message": "Service is not fully initialized"}), 503

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Endpoint to ask questions about the hiring drive."""
    # Check if services are initialized
    if not rag_store or not chat_completion:
        logger.error("Services not initialized properly.")
        return jsonify({
            "error": "Service not fully initialized. Check logs for details."
        }), 500
    
    # Get request data
    data = request.json
    if not data or 'question' not in data:
        return jsonify({"error": "Missing required field: question"}), 400
    
    question = data['question']
    
    try:
        # Record start time for performance tracking
        start_time = time.time()
        
        # Get relevant context from RAG store
        logger.info(f"Performing similarity search for question: {question}")
        relevant_docs = rag_store.similarity_search(question)
        
        # Generate response using chat completion
        logger.info("Generating response with chat completion...")
        response = chat_completion.generate_response(question, relevant_docs)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Return response
        return jsonify({
            "question": question,
            "answer": response,
            "processingTime": round(processing_time, 2)
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors."""
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Initialize services on startup
    initialize_services()
        
    # Start server
    app.run(host=settings.HOST, port=settings.PORT, debug=settings.FLASK_DEBUG)
