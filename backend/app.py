from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import time
import json
import re
from datetime import datetime
from pathlib import Path

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Create logs directory if it doesn't exist
LOGS_DIR = Path("conversation_logs")
LOGS_DIR.mkdir(exist_ok=True)
CONVERSATIONS_FILE = LOGS_DIR / "conversations.json"

print("\n================ BACKEND STARTING ================")
print(f"OPENROUTER_API_KEY found: {'YES' if OPENROUTER_API_KEY else 'NO'}")
print(f"Logs directory: {LOGS_DIR.absolute()}")
print(f"Conversations file: {CONVERSATIONS_FILE.absolute()}")
print("Server running on: http://127.0.0.1:5000")
print("=================================================\n")


def load_conversations():
    """Load existing conversations from JSON file"""
    if CONVERSATIONS_FILE.exists():
        try:
            with open(CONVERSATIONS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print("Warning: conversations.json is corrupted, starting fresh")
            return {"conversations": []}
    return {"conversations": []}


def save_conversation(conversation_data):
    """Save a conversation to the JSON file"""
    try:
        # Load existing data
        data = load_conversations()
        
        # Add new conversation
        data["conversations"].append(conversation_data)
        
        # Save back to file with pretty formatting
        with open(CONVERSATIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"Conversation saved. Total conversations: {len(data['conversations'])}")
        
    except Exception as e:
        print(f"Error saving conversation: {e}")


def create_conversation_log(history, user_message, ai_reply, user_info, stage, response_time):
    """Create a structured conversation log entry"""
    return {
        "conversation_id": f"conv_{int(time.time())}_{hash(user_message) % 10000}",
        "timestamp": datetime.now().isoformat(),
        "user_info": {
            "name": user_info.get("name"),
            "email": user_info.get("email"),
            "query_type": user_info.get("query_type")
        },
        "conversation_stage": stage,
        "message_count": len(history) + 1,  # +1 for current message
        "last_user_message": user_message,
        "last_ai_response": ai_reply,
        "full_history": [
            {
                "role": msg.get("role"),
                "text": msg.get("text"),
                "timestamp": msg.get("timestamp")
            }
            for msg in history
        ] + [
            {
                "role": "user",
                "text": user_message,
                "timestamp": datetime.now().isoformat()
            },
            {
                "role": "bot",
                "text": ai_reply,
                "timestamp": datetime.now().isoformat()
            }
        ],
        "metadata": {
            "response_time_seconds": response_time,
            "model_used": "openai/gpt-3.5-turbo",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "time": datetime.now().strftime("%H:%M:%S")
        }
    }


def extract_user_info(history):
    """Extract name and email from conversation history"""
    user_info = {
        "name": None,
        "email": None,
        "query_type": None
    }
    
    # Look through user messages for name and email patterns
    for msg in history:
        if msg.get("role") == "user":
            text = msg.get("text", "")
            
            # Extract name (simple pattern: capitalized word(s))
            if not user_info["name"]:
                # Look for "I'm [Name]", "My name is [Name]", or standalone capitalized names
                name_patterns = [
                    r"(?:i'm|i am|my name is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
                    r"^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$"
                ]
                for pattern in name_patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        user_info["name"] = match.group(1).title()
                        break
            
            # Extract email
            if not user_info["email"]:
                email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
                if email_match:
                    user_info["email"] = email_match.group(0)
    
    return user_info


def determine_conversation_stage(history, user_info):
    """Determine what stage of conversation we're in"""
    if not user_info["name"]:
        return "greeting"
    elif not user_info["email"]:
        return "collect_email"
    else:
        return "assistance"


def build_system_prompt(stage, user_info, user_message=""):
    """Build context-aware system prompt based on conversation stage"""
    
    base_context = """You are SmartAssist, a friendly customer service chatbot for a digital services company.

Our Services:
- Website Design & Development (Starting at $2,999)
  • Custom responsive design
  • Mobile-first approach
  • SEO optimization
  • 4-6 week delivery

- Digital Marketing & SEO (Starting at $499/month)
  • Social media management
  • Content marketing
  • Google Ads campaigns
  • Monthly analytics reports

- E-commerce Solutions (Custom pricing)
  • Shopify/WooCommerce setup
  • Payment gateway integration
  • Inventory management
  • Order tracking systems

- Mobile App Development (Starting at $4,999)
  • iOS and Android apps
  • Native or React Native
  • App store submission
  • Post-launch support

- Content Creation & Management (Starting at $299/month)
  • Blog writing
  • Social media posts
  • Email newsletters
  • Graphic design

Support Information:
- Business Hours: Monday-Friday, 9 AM - 6 PM EST
- Response Time: Within 24 hours
- Email: support@smartassist.com
- Phone: +1 (555) 123-4567

Contact Information:
- Sales: sales@smartassist.com
- Support: support@smartassist.com  
- Phone: +1 (555) 123-4567
- Address: 123 Tech Street, San Francisco, CA 94103

IMPORTANT: When user asks about specific topics:
- "Our Services" / "Services" → List all services with brief descriptions
- "Pricing" → Provide starting prices for each service
- "Contact Us" / "Contact" → Share email, phone, address, and business hours
- "Get Support" / "Support" → Share support hours, contact methods, and response times
"""

    if stage == "service_first":
        # User asked about service before giving name - answer then ask for name
        return base_context + """

IMPORTANT INSTRUCTIONS:
1. The user asked about services/pricing/contact BEFORE providing their name.
2. Answer their question FIRST with helpful information.
3. After answering, politely ask for their name so you can assist them better.
4. Keep it conversational and natural.

Example: 
"[Answer their service question]

I'd love to help you further! What's your name?"
"""

    if stage == "greeting":
        return base_context + """

IMPORTANT INSTRUCTIONS:
1. You just greeted the user. Now ask for their name in a friendly, conversational way.
2. Keep it brief - just one sentence asking for their name.
3. Don't ask multiple questions at once.
4. Be warm and welcoming.

Example: "I'd love to help you today! What's your name?"
"""

    elif stage == "collect_email":
        name = user_info.get("name", "")
        
        # Handle "Skip for now"
        if "skip" in user_message.lower():
            return base_context + f"""

IMPORTANT INSTRUCTIONS:
1. The user's name is {name} but they want to skip providing email.
2. Say that's totally fine and you can still help them.
3. Ask what they'd like to know about.
4. Be friendly and accommodating.

Example: "No problem, {name}! I can still help you. What would you like to know about our services?"
"""
        
        return base_context + f"""

IMPORTANT INSTRUCTIONS:
1. The user's name is {name}. Use it naturally in conversation.
2. Now you need to collect their email address.
3. Explain briefly why you need it (to send information or follow up).
4. Keep it conversational and friendly.
5. Don't ask multiple questions at once.

Example: "Great to meet you, {name}! Could I get your email address so I can send you detailed information?"
"""

    else:  # assistance stage
        name = user_info.get("name", "")
        email = user_info.get("email", "")
        
        return base_context + f"""

IMPORTANT INSTRUCTIONS:
1. User information collected:
   - Name: {name}
   - Email: {email if email else "Not provided"}

2. Now help them with their query. They've already provided their contact info.
3. Provide specific, helpful information about our services.
4. Be concise but informative.
5. If they ask about pricing, refer to the pricing list above.
6. If they ask about support, provide the support information above.
7. Always be professional and friendly.

Remember: Use their name ({name}) naturally in conversation.
"""


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "")
        history = data.get("history", [])

        print("\n🔹 ---- NEW CHAT REQUEST RECEIVED ----")
        print(f"📝 User message: {user_message}")
        print(f"⏰ Request time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"💬 Chat history length: {len(history)} messages")

        if not OPENROUTER_API_KEY:
            print("❌ ERROR: OPENROUTER_API_KEY is MISSING!")
            return jsonify({"reply": "Server error: API key missing."}), 500

        # Check if user is asking about services/pricing/contact before name collection
        service_queries = ["services", "pricing", "contact", "support", "hours", "quote"]
        is_service_query = any(query.lower() in user_message.lower() for query in service_queries)

        # Extract user information from history
        user_info = extract_user_info(history)
        print(f"👤 Extracted user info: {user_info}")

        # Determine conversation stage
        stage = determine_conversation_stage(history, user_info)
        
        # If user asks service query during greeting/email stage, answer but still collect info
        if is_service_query and stage in ["greeting", "collect_email"]:
            print(f"🔍 Service query detected during {stage} stage")
            stage = "service_first"  # Special mode: answer service query then collect info
        
        print(f"📊 Conversation stage: {stage}")

        # Build context aware system prompt
        system_prompt = build_system_prompt(stage, user_info, user_message)

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }

        # Convert frontend history to OpenRouter format
        messages = [{"role": "system", "content": system_prompt}]

        for msg in history:
            role = "assistant" if msg["role"] == "bot" else "user"
            messages.append({"role": role, "content": msg["text"]})

        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": "openai/gpt-3.5-turbo",
            "messages": messages,
            "temperature": 0.7,
        }

        print("🚀 Sending request to OpenRouter...")
        print(f"📍 Using stage: {stage}")

        start_time = time.time()

        r = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers=headers,
            timeout=25,
        )

        response_time = round(time.time() - start_time, 2)
        print(f"⚡ OpenRouter response time: {response_time} seconds")
        print(f"📡 OpenRouter status code: {r.status_code}")

        if r.status_code != 200:
            print("OpenRouter ERROR response:")
            print(r.text)
            return jsonify(
                {"reply": "AI service is currently unavailable. Please try again."}
            ), 500

        response_json = r.json()
        reply = response_json["choices"][0]["message"]["content"]

        print("AI Reply:")
        print(reply)

        # ===== SAVE CONVERSATION TO JSON =====
        conversation_log = create_conversation_log(
            history=history,
            user_message=user_message,
            ai_reply=reply,
            user_info=user_info,
            stage=stage,
            response_time=response_time
        )
        save_conversation(conversation_log)
        # ====================================

        # Return reply with user info for frontend
        response_data = {
            "reply": reply,
            "userInfo": user_info,
            "stage": stage if stage != "service_first" else "greeting"  # Keep original stage for frontend
        }

        print(f"Sending response with user info: {user_info}")
        print(" ---- END REQUEST ----\n")

        return jsonify(response_data)

    except Exception as e:
        print("CRITICAL ERROR:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify(
            {"reply": "Server error. Please try again later."}
        ), 500


@app.route("/conversations", methods=["GET"])
def get_conversations():
    """API endpoint to retrieve all logged conversations"""
    try:
        data = load_conversations()
        return jsonify({
            "total_conversations": len(data["conversations"]),
            "conversations": data["conversations"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/conversations/stats", methods=["GET"])
def get_stats():
    """API endpoint to get conversation statistics"""
    try:
        data = load_conversations()
        conversations = data["conversations"]
        
        total = len(conversations)
        
        # Calculate stats
        stages = {}
        users_with_email = 0
        users_with_name = 0
        avg_messages = 0
        
        if total > 0:
            for conv in conversations:
                # Stage distribution
                stage = conv.get("conversation_stage", "unknown")
                stages[stage] = stages.get(stage, 0) + 1
                
                # User info completion
                if conv["user_info"].get("email"):
                    users_with_email += 1
                if conv["user_info"].get("name"):
                    users_with_name += 1
                
                # Average messages
                avg_messages += conv.get("message_count", 0)
            
            avg_messages = round(avg_messages / total, 2)
        
        return jsonify({
            "total_conversations": total,
            "users_with_name": users_with_name,
            "users_with_email": users_with_email,
            "average_messages_per_conversation": avg_messages,
            "stage_distribution": stages,
            "email_capture_rate": f"{round((users_with_email / total * 100) if total > 0 else 0, 1)}%"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)