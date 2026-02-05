# SmartAssist Chatbot Widget

A modern, responsive chatbot widget built with React (frontend) and Flask (backend). This embeddable widget provides an AI powered conversational interface for customer support, lead generation, and user engagement.


## 📋 Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Getting Your OpenRouter API Key](#getting-your-openrouter-api-key)
- [Using the Chatbot](#using-the-chatbot)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup (Python/Flask)](#backend-setup-pythonflask)
  - [Frontend Setup (React)](#frontend-setup-react)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Current Features

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Real time Chat**: Instant messaging with typing indicators and read receipts
- **Quick Replies**: Context-aware quick action buttons for common queries
- **Mobile Responsive**: Full-screen on mobile, floating widget on desktop
- **Conversation Memory**: Maintains chat history throughout the session
- **User Information Collection**: Captures user details (name, email) during conversation
- **Multi-stage Conversation Flow**: Intelligent conversation management
- **Visual Feedback**: Loading states, timestamps, and read indicators
- **Accessibility**: ARIA labels and keyboard navigation support

## 🎯 How It Works

### Architecture Overview

The SmartAssist chatbot follows a client-server architecture with OpenRouter AI integration:

```
┌─────────────────┐         HTTP/REST API        ┌─────────────────┐         OpenRouter API
│                 │◄──────────────────────────────►│                 │◄─────────────────────────┐
│  React Frontend │         (Port 5173)            │  Flask Backend  │                          │
│   (Vite + UI)   │                                │   (Port 5000)   │                          │
│                 │         JSON Messages          │                 │                          ▼
└─────────────────┘                                └─────────────────┘                  ┌───────────────┐
        │                                                   │                            │  OpenRouter   │
        │                                                   │                            │   AI Models   │
        ▼                                                   ▼                            │ (GPT/Claude)  │
┌─────────────────┐                                ┌─────────────────┐                  └───────────────┘
│  Browser State  │                                │  Chat Logic &   │
│  - Messages     │                                │  AI Integration │
│  - User Info    │                                │  - OpenRouter   │
└─────────────────┘                                └─────────────────┘
```

### What is OpenRouter?

**OpenRouter** is a unified API gateway that provides access to multiple AI models (GPT-4, Claude, Llama, etc.) through a single API endpoint. Instead of managing multiple API keys for different AI providers, you only need one OpenRouter API key.

**Benefits:**
- Access to 100+ AI models with one API key
- Automatic fallback if one model is unavailable
- Cost optimization by choosing models based on price/performance
- Simple integration with OpenAI-compatible API format

### Communication Flow with OpenRouter

1. **User Interaction**: User types a message or clicks a quick reply button
2. **Frontend Processing**: React component captures the input and adds it to the message history
3. **API Request to Backend**: Frontend sends POST request to `/chat` endpoint with:
   - Current message
   - Conversation history
4. **Backend Processing**: Flask server:
   - Receives the message
   - Prepares conversation context with chat history
   - **Calls OpenRouter API** with:
     - API Key (from environment variable)
     - Selected AI model (e.g., "anthropic/claude-3-sonnet", "openai/gpt-4")
     - System prompt for chatbot personality
     - User message and conversation history
5. **OpenRouter Processing**: 
   - Routes request to selected AI model
   - AI generates intelligent, context-aware response
   - Returns response to backend
6. **Response Processing**: Backend:
   - Receives AI-generated response
   - Extracts user information if mentioned (name, email)
   - Updates conversation stage
   - Formats response for frontend
7. **API Response**: Backend sends JSON response with:
   - AI generated bot reply text
   - Updated user information
   - Current conversation stage
8. **UI Update**: Frontend displays the bot's response with animations

### OpenRouter Integration Details

**API Endpoint**: `https://openrouter.ai/api/v1/chat/completions`

**Request Format**:
```json
{
  "model": "anthropic/claude-3-sonnet",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant..."},
    {"role": "user", "content": "Hello!"},
    {"role": "assistant", "content": "Hi! How can I help?"},
    {"role": "user", "content": "What are your services?"}
  ]
}
```

**Response Format**:
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "We offer web development, AI integration..."
      }
    }
  ]
}
```

### Available Models on OpenRouter

You can choose from various models based on your needs:

**Most Popular:**
- `anthropic/claude-3-sonnet` - Balanced performance and cost
- `anthropic/claude-3-opus` - Most capable, higher cost
- `openai/gpt-4-turbo` - OpenAI's latest model
- `openai/gpt-3.5-turbo` - Fast and economical
- `meta-llama/llama-3-70b` - Open-source alternative

**Selection Criteria:**
- **Cost**: GPT-3.5 < Claude Sonnet < GPT-4 < Claude Opus
- **Intelligence**: Claude Opus > GPT-4 > Claude Sonnet > GPT-3.5
- **Speed**: GPT-3.5 > Llama > Claude Sonnet > GPT-4

### Conversation Stages

The chatbot manages conversations through different stages:

- **Greeting**: Initial welcome and name collection
- **Information Gathering**: Collecting user email and understanding their needs
- **Query Handling**: Responding to specific requests (Services, Pricing, Support)
- **Engagement**: Maintaining conversation flow with context-aware responses

## 🔑 Getting Your OpenRouter API Key

### Step-by-Step Guide

1. **Sign Up**:
   - Visit [https://openrouter.ai](https://openrouter.ai)
   - Click "Sign In" and create an account
   - You can sign up with Google, GitHub, or email

2. **Get API Key**:
   - Go to "API Keys" in your dashboard
   - Click "Create Key"
   - Give it a name (e.g., "SmartAssist Chatbot")
   - Copy the API key (starts with `sk-or-v1-...`)
   - **Important**: Save it securely - you won't see it again!

3. **Add Credits** (Optional):
   - OpenRouter offers free credits for testing
   - Add payment method for production use
   - Monitor usage in the dashboard

4. **Configure in Your App**:
   - Add API key to your `.env` file (see Configuration section)
   - Never commit API keys to version control
   - Use environment variables for security

### Pricing

OpenRouter uses **pay-per-use** pricing:
- Charged per 1M tokens (input + output)
- Prices vary by model ($0.15 to $15 per 1M tokens)
- Free credits available for new users
- Set spending limits in dashboard

**Example Costs** (approximate):
- 100 conversations with GPT-3.5: ~$0.10
- 100 conversations with Claude Sonnet: ~$0.50
- 100 conversations with GPT-4: ~$1.50

## 📖 Using the Chatbot

### For End Users

1. **Opening the Chat**:
   - Click the blue "Chat with us" button in the bottom-right corner
   - On mobile: Opens full screen overlay
   - On desktop: Opens floating chat window

2. **Starting a Conversation**:
   - The bot greets you and asks for your name
   - Type your name or use quick reply buttons
   - Answer follow-up questions (email, etc.)

3. **Getting Help**:
   - **Quick Replies**: Click pre defined buttons for common queries:
     - "Our Services" - Learn about available services
     - "Pricing" - Get pricing information
     - "Contact Us" - Contact details
     - "Get Support" - Technical support options
   - **Custom Messages**: Type your own questions in the input field

4. **Chat Features**:
   - **Typing Indicator**: See when the bot is preparing a response
   - **Read Receipts**: Double checkmark (✓✓) shows message was read
   - **Timestamps**: View when each message was sent
   - **User Info Card**: See your collected information at the top

5. **Closing the Chat**:
   - Click the ✕ button in the header
   - Your conversation is saved during the session
   - Reopen anytime to continue

## 📁 Project Structure

```
chatbot-widget/
├── backend/
│   ├── app.py                  # Flask backend server
│   └── _env                    # Environment variables (create this)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main application component
│   │   ├── ChatWidget.jsx     # Chat widget component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── index.html             # HTML template
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── postcss.config.js      # PostCSS configuration
│   └── vite.config.js         # Vite build configuration
│
└── README.md                   # This file
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Python**: Version 3.8 or higher
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **pip**: Python package installer

## 📦 Installation

### Backend Setup (Python/Flask)

1. **Navigate to the backend directory** (or create one):
```bash
mkdir backend
cd backend
```

2. **Create a virtual environment** (recommended):
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install Python dependencies**:

```bash
pip install flask==3.0.0
pip install flask-cors==4.0.0
pip install python-dotenv==1.0.0
pip install requests==2.31.0
```

**Or use requirements.txt**:

```bash
pip install -r requirements.txt
```

4. **Create environment file**:

Create a `_env` or `.env` file in the backend directory:
```env

# OpenRouter API Configuration (REQUIRED)
OPENROUTER_API_KEY=sk-or-v1-your_api_key_here



```

**Important Notes:**
- Get your OpenRouter API key from [https://openrouter.ai](https://openrouter.ai)
- Never commit this file to version control (add to `.gitignore`)
- Choose a model that fits your budget and performance needs

### Frontend Setup (React)

1. **Navigate to the frontend directory**:
```bash
cd frontend
# Or if files are in root
cd ..
```

2. **Install Node.js dependencies**:
```bash
npm install
```

This will install:
- `react` (^18.2.0)
- `react-dom` (^18.2.0)
- `axios` (^1.6.0)
- `@vitejs/plugin-react` (^5.1.3)
- `vite` (^4.3.9)
- `tailwindcss` (^3.3.2)
- `autoprefixer` (^10.4.14)
- `postcss` (^8.4.21)

3. **Create frontend environment file**:

Create a `.env` file in the frontend directory:
```env
VITE_BACKEND_URL=http://localhost:5000
```

## ⚙️ Configuration

### Backend Configuration

- **OpenRouter API Integration**: The backend should include:
  ```python
  import os
  import requests
  from flask import Flask, request, jsonify
  from flask_cors import CORS
  from dotenv import load_dotenv
  
  load_dotenv()
  
  app = Flask(__name__)
  CORS(app, origins=["http://localhost:5173"])
  
  OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
  OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3-sonnet")
  
  @app.route('/chat', methods=['POST'])
  def chat():
      data = request.json
      user_message = data.get('message')
      history = data.get('history', [])
      
      # Prepare messages for OpenRouter
      messages = []
      for msg in history:
          role = "assistant" if msg['role'] == 'bot' else 'user'
          messages.append({"role": role, "content": msg['text']})
      messages.append({"role": "user", "content": user_message})
      
      # Call OpenRouter API
      response = requests.post(
          "https://openrouter.ai/api/v1/chat/completions",
          headers={
              "Authorization": f"Bearer {OPENROUTER_API_KEY}",
              "Content-Type": "application/json"
          },
          json={
              "model": OPENROUTER_MODEL,
              "messages": messages
          }
      )
      
      ai_reply = response.json()['choices'][0]['message']['content']
      
      return jsonify({
          "reply": ai_reply,
          "userInfo": {},
          "stage": "conversation"
      })
  ```


### Frontend Configuration

Edit configuration files as needed:
- **Tailwind CSS**: Customize colors, fonts in `tailwind.config.js`
- **API Endpoint**: Update `VITE_BACKEND_URL` in `.env`
- **Widget Appearance**: Modify `ChatWidget.jsx` for custom styling

## 🚀 Running the Application

### Development Mode

1. **Start the Backend**:
```bash
cd backend
# Activate virtual environment if not already active
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Run Flask server
python app.py
# Backend will run on http://localhost:5000
```

2. **Start the Frontend** (in a new terminal):
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

3. **Access the application**:
   - Open your browser to `http://localhost:5173`
   - Click the chat button in the bottom-right corner


## 🌐 Deployment

### Recommended Hosting Options

**Frontend:**
- Vercel (recommended for Vite/React)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Backend:**
- Railway
- Render
- Heroku
- AWS EC2/ECS
- Google Cloud Run
- DigitalOcean App Platform

### Environment Variables for Production

Ensure you set these environment variables on your hosting platform:
- `VITE_BACKEND_URL` (frontend)
- `FLASK_ENV=production` (backend)
- `SECRET_KEY` (backend)
- API keys for any AI services

## 🔮 Future Improvements

### High Priority

1. **AI Integration**
   - Integrate OpenAI GPT-4 or Anthropic Claude for intelligent responses
   - Implement RAG (Retrieval-Augmented Generation) for knowledge base
   - Add intent recognition and entity extraction
   - Support for multilingual conversations

2. **Database Integration**
   - Store conversation history in PostgreSQL/MongoDB
   - User authentication and session management
   - Analytics dashboard for conversation insights
   - Export conversation logs

3. **Enhanced Features**
   - File upload support (images, PDFs, documents)
   - Voice input/output capabilities
   - Rich media responses (images, videos, carousels)
   - Suggested responses based on user input
   - Sentiment analysis

### Medium Priority

4. **User Experience**
   - Dark mode support
   - Customizable themes and branding
   - Multiple language support (i18n)
   - Emoji picker
   - Message reactions
   - Conversation search functionality

5. **Advanced Functionality**
   - Live agent handoff
   - Chatbot training interface
   - A/B testing for responses
   - Integration with CRM systems (Salesforce, HubSpot)
   - Webhook support for external integrations
   - Scheduled messages and follow-ups

6. **Performance Optimization**
   - Implement message pagination/infinite scroll
   - WebSocket support for real-time updates
   - Message caching with Redis
   - CDN integration for static assets
   - Lazy loading for chat history

### Low Priority (Polish)

7. **Analytics & Monitoring**
   - User engagement metrics
   - Conversation funnel analysis
   - Error tracking (Sentry integration)
   - Performance monitoring
   - A/B testing framework

8. **Security Enhancements**
   - Rate limiting
   - Input sanitization and validation
   - CSRF protection
   - Content Security Policy (CSP)
   - End-to-end encryption for sensitive conversations

9. **Developer Experience**
   - SDK for easy widget embedding
   - Comprehensive API documentation
   - Widget customization via props
   - Testing suite (Jest, Cypress)
   - CI/CD pipeline setup

10. **Mobile Apps**
    - Native iOS app (React Native/Swift)
    - Native Android app (React Native/Kotlin)
    - Offline support with local storage

### Code Quality Improvements

- **Testing**:
  - Unit tests for components (Jest, React Testing Library)
  - Integration tests for API endpoints
  - E2E tests (Playwright/Cypress)
  - Test coverage >80%

- **Documentation**:
  - API documentation (Swagger/OpenAPI)
  - Component documentation (Storybook)
  - Contributing guidelines
  - Code of conduct

- **Code Organization**:
  - Implement state management (Redux/Zustand)
  - Custom hooks for reusable logic
  - Error boundary components
  - Logging system

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👥 Support

For support, email me or open an issue on GitHub.

## 🙏 Acknowledgments

- Icons from Emoji
- UI inspiration from modern chat applications
- Built with React, Vite, Tailwind CSS, and Flask

---


