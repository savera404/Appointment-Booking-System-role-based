import os
import json
from dotenv import load_dotenv
from chromadb import Client
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from openai import OpenAI

# ==== Load ENV ====
print("🔧 Loading environment variables...")
load_dotenv()
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")

# ==== Load Transcripts ====
def load_transcripts(json_path):
    print(f"📄 Loading transcripts from: {json_path}")
    with open(json_path, "r") as f:
        data = json.load(f)
    print(f"✅ Loaded {len(data)} transcript segments.")
    return data

# ==== Embedding Function using SentenceTransformers ====
class SentenceTransformerEmbeddingFunction:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        print(f"🧠 Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        print("✅ Embedding model loaded.")

    def __call__(self, input):
        print(f"🔍 Generating embeddings for {len(input)} texts...")
        return self.model.encode(input).tolist()

# ==== Setup ChromaDB ====
def setup_chroma(transcripts):
    print("🗂️ Setting up ChromaDB...")
    embedding_fn = SentenceTransformerEmbeddingFunction()

    client = Client(Settings(anonymized_telemetry=False))
    collection = client.create_collection(
        name="consultation_notes",
        embedding_function=embedding_fn
    )

    print("📥 Adding transcript segments to ChromaDB collection...")
    for i, note in enumerate(transcripts):
        collection.add(
            documents=[note["text"]],
            ids=[str(i)],
            # metadatas=[{"speaker": note["speaker"], "start": note["start"]}]  # ❌ Previous code with speaker label
            metadatas=[{"start": note["start"], "end": note["end"]}]  # ✅ Modified for JSON without speaker

        )
    print("✅ ChromaDB setup complete.")
    return collection

# ==== Retrieve Relevant Chunks ====
def retrieve(collection, query, top_k=3):
    print(f"🔎 Retrieving top {top_k} relevant chunks for query: \"{query}\"")
    results = collection.query(query_texts=[query], n_results=top_k)
    print("✅ Retrieval complete.")
    return results["documents"][0]

# ==== Azure OpenAI LLM ====
print("🔗 Connecting to Azure OpenAI API...")
client = OpenAI(
    api_key=AZURE_API_KEY,
    base_url=AZURE_ENDPOINT,
    default_query={"api-version": "preview"},
)
print("✅ Azure OpenAI connection ready.")

def generate_answer(query, retrieved_docs):
    print("💬 Generating answer from retrieved context...")
    context = "\n\n".join(retrieved_docs)

    prompt = f"""
    You are a responsible and helpful assistant tasked with analyzing a transcript of a medical consultation between a doctor and a patient.

    Please follow these rules when generating an answer:
    - ONLY use the provided context. Do not make up any facts or diagnoses.
    - If the context is insufficient to answer the question, reply with: "The context does not provide enough information to answer this question."
    - DO NOT give medical advice or recommendations beyond what the doctor already said.
    - Be concise, clear, and factual.
    - Use a neutral and professional tone.

    Context:
    {context}

    Question: {query}
    Answer:
    """.strip()

    response = client.chat.completions.create(
        model="gpt-4o-mini-01",  # Change to your Azure deployment name
        messages=[{"role": "user", "content": prompt}]
    )
    print("✅ Response generated.")
    return response.choices[0].message.content

# ==== MAIN ====
if __name__ == "__main__":
    print("🚀 Starting pipeline...")

    # Load transcript JSON file
    transcripts = load_transcripts(r"D0420-S1-whisper_transcript.json")

    # Setup local vector DB
    chroma_collection = setup_chroma(transcripts)

    # Get user query
    print("🧠 Ready! Ask your question:")
    user_query = input(">>> ")

    # Retrieve relevant parts
    top_chunks = retrieve(chroma_collection, user_query)

    # Generate answer
    answer = generate_answer(user_query, top_chunks)

    print("\n💬 Answer:")
    print(answer)
