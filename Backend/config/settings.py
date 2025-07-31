"""
Configuration settings for the Flask API using Azure OpenAI.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Azure OpenAI API Configuration
AZURE_OPENAI_API_KEY = os.getenv('AZURE_OPENAI_API_KEY')
AZURE_OPENAI_ENDPOINT = os.getenv('AZURE_OPENAI_ENDPOINT')
AZURE_OPENAI_API_VERSION = os.getenv('AZURE_OPENAI_API_VERSION', '2023-05-15')
AZURE_DEPLOYMENT_NAME = os.getenv('AZURE_DEPLOYMENT_NAME', 'gpt-4o-mini')

# Flask Configuration
FLASK_ENV = os.getenv('FLASK_ENV', 'development')
FLASK_DEBUG = os.getenv('FLASK_DEBUG', '1') == '1'
PORT = int(os.getenv('PORT', '5000'))
HOST = os.getenv('HOST', '0.0.0.0')

# Application Configuration
DOCUMENT_PATH = os.getenv('DOCUMENT_PATH', './data/SkyConnect_Airlines.txt')
CHUNK_SIZE = int(os.getenv('CHUNK_SIZE', '1000'))
CHUNK_OVERLAP = int(os.getenv('CHUNK_OVERLAP', '200'))

# Default system prompt for the chat completion
SYSTEM_PROMPT = """You are a helpful assistant for Sky Connect Airlines. 
Your task is to answer questions about job openings, compensation, and the application process 
based on the provided context. Only answer questions if you can find the relevant information in the context.
If you don't know the answer, say you don't have that information.
Keep your answers professional, accurate, and concise."""
