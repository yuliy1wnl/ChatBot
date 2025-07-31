# Queryl - Hiring Drive Q&A System

A web application that allows users to ask questions about Quantum Tech Solutions' hiring drive and get instant answers using an Azure OpenAI-powered backend.

## Features

- **Interactive Chat Interface**: Ask questions in natural language about job openings, compensation, and application processes
- **RAG-based Q&A**: Uses Retrieval-Augmented Generation with Azure OpenAI's GPT-4o-mini model
- **Voice Input Support**: Ask questions using your microphone (browser permission required)
- **Responsive Design**: Works on desktop and mobile devices

## Components

### Backend

- Flask API serving responses from Azure OpenAI
- Langchain for document processing and RAG implementation
- In-memory vector store for document chunks
- Azure OpenAI integration with GPT-4o-mini model

### Frontend

- Clean, modern UI with real-time chat interactions
- Voice input capabilities
- System messages and notifications

## Setup Instructions

### Prerequisites

- Python 3.8+ for the backend
- Azure OpenAI API key with GPT-4o-mini deployment
- Web browser for the frontend

### Configuration

1. Edit the `.env` file in the Backend folder to add your Azure OpenAI credentials:

```
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_DEPLOYMENT_NAME=gpt-4o-mini
```

### Quick Start

Run the startup script to launch both backend and frontend:

```powershell
.\start.ps1
```

This will:
1. Create a Python virtual environment (if needed)
2. Install required dependencies
3. Start the Flask backend server
4. Open the frontend in your default browser

### Manual Start

If you prefer to start components separately:

#### Backend Setup

```powershell
cd Backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
python main.py
```

#### Frontend Access

Simply open `FrontEnd/index.html` in any modern web browser.

## Usage

1. Wait for the backend to fully initialize
2. Type questions in the chat input field or use voice input
3. Receive responses based on the hiring drive document content

Example questions:
- "What positions are currently open?"
- "What is the salary range for the Senior Software Engineer?"
- "What are the requirements for the Quantum Solutions Architect position?"
- "What benefits are offered to employees?"

## Troubleshooting

- If you see connection errors in the frontend, ensure the backend server is running
- If the backend fails to start, check that your Azure OpenAI API key is correctly configured
- For voice input issues, ensure your browser has permission to access your microphone