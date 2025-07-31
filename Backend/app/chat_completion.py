"""
Chat completion module using Azure OpenAI API with GPT-4o-mini.
"""
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from langchain_openai import AzureChatOpenAI
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ChatCompletion:
    def __init__(self):
        """
        Initialize the chat completion module with Azure OpenAI API.
        """
        self.llm = self._initialize_llm()
        self.system_prompt = settings.SYSTEM_PROMPT
        
    def _initialize_llm(self):
        """
        Initialize the Azure OpenAI LLM with proper error handling.
        """
        try:
            return AzureChatOpenAI(
                azure_deployment=settings.AZURE_DEPLOYMENT_NAME,
                api_version=settings.AZURE_OPENAI_API_VERSION,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_API_KEY,
                temperature=0.2  # Setting a lower temperature for more focused answers
            )
        except Exception as e:
            logger.error(f"Failed to initialize Azure OpenAI LLM: {e}")
            raise RuntimeError(f"Failed to initialize Azure OpenAI LLM: {e}")
    
    def generate_response(self, query, context_docs):
        """
        Generate a response using the RAG approach with the provided context documents.
        
        Args:
            query (str): The user's question
            context_docs (list): List of relevant document chunks from RAG store
            
        Returns:
            str: The generated response
        """
        try:
            # Extract text from context documents
            context_texts = [doc.page_content for doc in context_docs]
            context = "\n\n".join(context_texts)
            
            # Create a prompt template
            prompt = ChatPromptTemplate.from_messages([
                ("system", self.system_prompt),
                ("system", "Use the following context to answer the user's question:\n\n{context}"),
                ("human", "{query}")
            ])
            
            # Create a simple chain to generate the response
            chain = prompt | self.llm | StrOutputParser()
            
            # Execute the chain
            response = chain.invoke({"context": context, "query": query})
            logger.info("Response generated successfully")
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise RuntimeError(f"Error generating response: {e}")
