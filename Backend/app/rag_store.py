"""
In-memory RAG (Retrieval-Augmented Generation) store using Langchain.
"""
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import AzureOpenAIEmbeddings
from langchain_core.documents import Document
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RAGStore:
    def __init__(self):
        """
        Initialize the in-memory RAG store with Azure OpenAI embeddings.
        """
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        self.embeddings = self._initialize_embeddings()
        self.vector_store = None
        self.document_content = ""
        
    def _initialize_embeddings(self):
        """
        Initialize Azure OpenAI embeddings with proper error handling.
        """
        try:
            return AzureOpenAIEmbeddings(
                azure_deployment="text-embedding-ada-002",  # Standard embedding model name
                openai_api_version=settings.AZURE_OPENAI_API_VERSION,
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_API_KEY
            )
        except Exception as e:
            logger.error(f"Failed to initialize embeddings: {e}")
            raise RuntimeError(f"Failed to initialize embeddings: {e}")
    
    def load_document(self, document_path=None):
        """
        Load and process a document from the specified path.
        """
        path = document_path or settings.DOCUMENT_PATH
        logger.info(f"Loading document from {path}")
        
        try:
            with open(path, 'r', encoding='utf-8') as file:
                self.document_content = file.read()
                
            # Split the text into chunks
            texts = self.text_splitter.split_text(self.document_content)
            
            # Create documents with metadata
            documents = [Document(page_content=text, metadata={"source": path}) for text in texts]
              # Create vector store
            self.vector_store = InMemoryVectorStore.from_documents(
                documents=documents,
                embedding=self.embeddings
            )
            
            logger.info(f"Document loaded and processed successfully. Created {len(texts)} chunks.")
            return True
            
        except FileNotFoundError:
            logger.error(f"Document file not found: {path}")
            raise FileNotFoundError(f"Document file not found: {path}")
        except Exception as e:
            logger.error(f"Error loading document: {e}")
            raise RuntimeError(f"Error loading document: {e}")
    
    def similarity_search(self, query, k=4):
        """
        Perform similarity search with the query and return top-k relevant chunks.
        """
        if not self.vector_store:
            logger.error("Vector store is not initialized. Load a document first.")
            raise ValueError("Vector store is not initialized. Load a document first.")
        
        try:
            docs = self.vector_store.similarity_search(query, k=k)
            logger.info(f"Similarity search completed. Found {len(docs)} relevant chunks.")
            return docs
        except Exception as e:
            logger.error(f"Error during similarity search: {e}")
            raise RuntimeError(f"Error during similarity search: {e}")
