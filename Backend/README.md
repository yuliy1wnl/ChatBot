# Hiring Drive Q&A Backend

A Flask API backend that uses Langchain with Azure OpenAI API (GPT-4o-mini) to answer questions related to Quantum Tech Solutions' hiring drive.

## Features

- Flask REST API for question-answering
- Azure OpenAI integration with GPT-4o-mini model
- In-memory RAG (Retrieval-Augmented Generation) system
- Document chunking and semantic search
- Configurable settings via environment variables

## Requirements

- Python 3.8+
- Azure OpenAI API access with a GPT-4o-mini deployment

## Setup

1. **Clone the repository**

2. **Set up a Python virtual environment**

```powershell
# Navigate to the Backend folder
cd d:\projects\Queryl\Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate
```

3. **Install required packages**

```powershell
pip install -r requirements.txt
```

4. **Configure environment variables**

Copy the `.env` file and fill in your Azure OpenAI API credentials:

```
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_VERSION=2023-05-15
AZURE_DEPLOYMENT_NAME=gpt-4o-mini
```

5. **Run the application**

```powershell
python main.py
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Response**: Status of the API

### Ask a Question
- **URL**: `/api/ask`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "question": "What is the salary range for the Senior Software Engineer position?"
  }
  ```
- **Response**:
  ```json
  {
    "question": "What is the salary range for the Senior Software Engineer position?",
    "answer": "The salary range for the Senior Software Engineer - AI Systems position is $180,000 - $220,000 annually, depending on experience.",
    "processingTime": 1.25
  }
  ```

## Security Best Practices

- Never commit your `.env` file with API keys
- Configure appropriate API key permissions
- Use virtual environments to isolate dependencies
- Consider implementing rate limiting for production use

## Troubleshooting

- If you encounter `ModuleNotFoundError`, ensure your virtual environment is activated and dependencies are installed
- If the API returns a 503 status, check that your Azure OpenAI API credentials are correctly configured
- For other issues, check the application logs for detailed error messages
