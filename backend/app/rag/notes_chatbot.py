import os
import re
import json
from dotenv import load_dotenv
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from openai import OpenAI
from openai.types.chat import ChatCompletionMessageToolCall
from openai.types.shared_params import FunctionDefinition

# ==== Load environment variables ====
print("🔧 Loading environment variables...")
load_dotenv()
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")

# ==== Initialize embedding function ====
print("🧠 Loading embedding model...")
embedding_model_name = "all-MiniLM-L6-v2"
embedding_function = HuggingFaceEmbeddings(model_name=embedding_model_name)
print("✅ Embedding model loaded.")

# ==== Load Chroma Vector Store ====
VECTOR_DB_DIR = os.path.abspath("vector_db")
print(f"📦 Loading vector store from: {VECTOR_DB_DIR}")
vectorstore = Chroma(
    persist_directory=VECTOR_DB_DIR,
    embedding_function=embedding_function
)
print("📦 Vector store document count:", vectorstore._collection.count())
print("✅ Vector store loaded.")

# ==== Azure OpenAI Client Setup ====
print("🔗 Connecting to Azure OpenAI API...")
client = OpenAI(
    api_key=AZURE_API_KEY,
    base_url=AZURE_ENDPOINT,
    default_query={"api-version": "preview"},
)
print("✅ Azure OpenAI connection ready.")

# ==== Define Tools for Function Calling ====
tools = [
    {
        "type": "function",
        "function": FunctionDefinition(
            name="retrieve_relevant_chunks",
            description="Search the medical transcript for relevant context for a user query",
            parameters={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "User's question to be answered from the transcript",
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of most relevant transcript chunks to retrieve",
                        "default": 3,
                    },
                    "appointment_id": {
                        "type": "string",
                        "description": "The appointment ID used to filter transcript data."
                    }
                },
                "required": ["query", "appointment_id"],
            }
        )
    }
]

# ==== Retrieval Function ====
def retrieve_relevant_chunks(query: str, appointment_id: str, top_k: int = 3) -> list[str]:
    print(f"🔍 Searching for query: '{query}' in appointment: {appointment_id}")
    print(f"🔍 Vector store document count: {vectorstore._collection.count()}")
    
    try:
        results = vectorstore.similarity_search(
            query,
            k=top_k,
            filter={"appointment_id": appointment_id}  # metadata filter
        )
        print(f"🔍 Found {len(results)} results")
        for i, result in enumerate(results):
            print(f"🔍 Result {i+1}: {result.page_content[:100]}...")
        return [doc.page_content for doc in results]
    except Exception as e:
        print(f"❌ Error in retrieve_relevant_chunks: {e}")
        import traceback
        traceback.print_exc()
        return []

# ==== Conversation History ====
history = [
    {
        "role": "system",
        "content": (
            "You are a responsible and helpful assistant tasked with analyzing a transcript of a medical consultation between a doctor and a patient.\n\n"
            "Your responsibilities:\n"
            
            "- Greet users warmly. If they've told you their name earlier, greet them using their name.\n"
            "- If the user asks a general medical question (not in the transcript), answer using general knowledge but add: 'This is general information and not a substitute for professional medical advice.'\n"
            "- ONLY use the transcript to answer specific questions about the consultation.\n"
            "- If the transcript lacks the answer, say: 'The context does not provide enough information to answer this question.'\n"
            "- Be concise, neutral, and avoid giving any medical diagnosis or advice beyond what's mentioned."
        )
    }
]
user_name = None  # To store user name if provided

# ==== Answer Generation ====
def generate_answer(query: str, appointment_id: str) -> str:
    global user_name

    # Extract user name from greeting
    match = re.search(r"\b(?:i(?:'m| am)\s+([A-Z][a-z]+))", query, re.IGNORECASE)
    if match:
        user_name = match.group(1).strip().capitalize()

    # Greet if appropriate
    if query.lower() in ["hi", "hello", "hey"]:
        name_part = f", {user_name}" if user_name else ""
        greeting = f"Hello{name_part}! How can I assist you today?"
        history.append({"role": "user", "content": query})
        history.append({"role": "assistant", "content": greeting})
        return greeting

    # Add user query
    history.append({"role": "user", "content": query})
    # Add appointment ID context before calling the assistant
    history.append({
        "role": "system",
        "content": f"Appointment ID: {appointment_id}"
    })


    # First API call with function calling
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=history,
        tools=tools,
        tool_choice="auto",
    )

    message = response.choices[0].message

    # Check if tool was called
    if message.tool_calls:
        for tool_call in message.tool_calls:
            if isinstance(tool_call, ChatCompletionMessageToolCall) and tool_call.function.name == "retrieve_relevant_chunks":
                args = json.loads(tool_call.function.arguments)
                args["appointment_id"] = appointment_id
                top_k = args.get("top_k", 3)
                chunks = retrieve_relevant_chunks(args["query"], appointment_id=args["appointment_id"], top_k=top_k)

                context = "\n\n".join(chunks)

                # Add system context based on retrieved docs
                history.append({
                    "role": "system",
                    "content": f"Transcript:\n{context}"
                })

                print("🛠️ Tool called: retrieve_relevant_chunks")

                # Retry completion with transcript context
                second_response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=history
                )
                reply = second_response.choices[0].message.content.strip()
                history.append({"role": "assistant", "content": reply})
                return reply

    # If no tool used, use original model message
    reply = message.content.strip()
    print("🤖 Model replied directly without tool.")
    history.append({"role": "assistant", "content": reply})
    return reply

def summarize_key_points(docs: list[str], max_chunks: int = 5) -> str:
    context = "\n\n".join(docs[:max_chunks])  # Limit context to avoid overloading

    prompt = f"""
You are a professional assistant summarizing a medical consultation between a doctor and a patient.

Extract and organize the *key points* under the following headings:
- Symptoms
- Duration
- Triggers or Causes
- Emotional or Psychological Responses
- Doctor's Observations or Conclusions (if available)

Be concise and factual. Use bullet points under each heading. Do not include any extra explanation. Do not invent information.

Start the response with:  
*Here are the key points from the appointment:*  

Then list the extracted points under each section accordingly.

Transcript:
{context}
""".strip()

    response = client.chat.completions.create(
        model="gpt-4o-mini-01",
        messages=[
            {
                "role": "system",
                "content": "You are a professional assistant trained to summarize doctor-patient consultations into clearly grouped bullet points under proper medical categories."
            },
            {"role": "user", "content": prompt}
        ]
    )

    summary = response.choices[0].message.content.strip()
    return summary


# ==== Main Loop ====
if __name__ == "__main__":
    appointment_id = input("Enter appointment ID: ").strip()
    key_chunks = retrieve_relevant_chunks("summary", appointment_id=appointment_id, top_k=5)
    # Extract key points
    summary = summarize_key_points(key_chunks)
    print("\n📌 Key Points from the Transcript:\n")
    print(summary)
    print("🧠 Ready! Ask your medical consultation question (type 'quit' to exit):")


    while True:
        user_query = input("User: ").strip()
        if user_query.lower() == "quit":
            break

        answer = generate_answer(user_query, appointment_id)
        print("\nAssistant:", answer)
