import ChatWidget from "./ChatWidget";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            SmartAssist Demo
          </h1>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <span className="hover:text-blue-600 cursor-pointer">Home</span>
            <span className="hover:text-blue-600 cursor-pointer">Features</span>
            <span className="hover:text-blue-600 cursor-pointer">Pricing</span>
            <span className="hover:text-blue-600 cursor-pointer">Contact</span>
          </nav>
          
          <button className="md:hidden text-gray-600 p-2" aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            AI Powered Customer Assistant
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            This is a live demo website showcasing an embeddable chatbot widget.
            Click the chat button in the bottom right corner to interact with SmartAssist.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12">
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border hover:shadow-md transition">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Instant AI Support</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Get real time AI responses to your questions without waiting.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border hover:shadow-md transition">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Smart Suggestions</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Use quick replies like Services, Support, or Pricing for guided help.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border hover:shadow-md transition sm:col-span-2 md:col-span-1">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Embeddable Widget</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Designed to be easily integrated into any website.
            </p>
          </div>
        </div>

        
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border max-w-5xl mx-auto">
          <h3 className="font-semibold mb-3 text-sm sm:text-base">How This Works</h3>
          <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">1.</span>
              <span>Click the blue chat button in the bottom right corner.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">2.</span>
              <span>Use quick replies or type your own message.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">3.</span>
              <span>Watch SmartAssist respond in real time.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs sm:text-sm text-gray-500">
          © {new Date().getFullYear()} SmartAssist • Chatbot Widget Demo
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}