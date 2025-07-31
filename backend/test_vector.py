import os
import asyncio
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from app.services.rag_service import build_vector_store_from_appointment

async def main():
    success = await build_vector_store_from_appointment("686a1d3af7994c01380a5b04")
    
    if success:
        # ==== Initialize embedding function ====
        embedding_model_name = "all-MiniLM-L6-v2"
        embedding_function = HuggingFaceEmbeddings(model_name=embedding_model_name)

        # ==== Load Chroma Vector Store ====
        VECTOR_DB_DIR = os.path.join(os.getcwd(), "vector_db")
        print(f"📦 Loading vector store from: {VECTOR_DB_DIR}")

        vectorstore = Chroma(
            persist_directory=VECTOR_DB_DIR,
            embedding_function=embedding_function
        )

        # ✅ Check document count
        print("📦 Vector store document count:", vectorstore._collection.count())
        print("✅ Vector store loaded.")
    else:
        print("❌ Failed to build vector store.")

if __name__ == "__main__":
    asyncio.run(main())
