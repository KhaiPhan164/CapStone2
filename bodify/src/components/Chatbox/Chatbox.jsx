import React, { useState, useRef, useEffect } from 'react';
import AuthService from '../../services/auth.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';

// Add Roboto font
const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.chatbox-container {
  font-family: 'Roboto', sans-serif;
}
`;
document.head.appendChild(style);

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  // List of users to chat with
  const chatUsers = [
    { id: 1, name: "Quốc Thái", avatar: "QT" },
    { id: 2, name: "Khải Phan", avatar: "KP" }
  ];

  useEffect(() => {
    // Check login status when component mounts and when it changes
    const checkLoginStatus = () => {
      const loggedIn = AuthService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
    // Set up interval to check login status
    const interval = setInterval(checkLoginStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && selectedUser) {
      setMessages([...messages, { text: inputMessage, sender: 'user', receiver: selectedUser.name }]);
      setInputMessage('');
      // Here you would typically make an API call to your backend
      // For now, we'll just simulate a response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: `This is a simulated response from ${selectedUser.name}`, 
          sender: 'bot',
          receiver: 'user'
        }]);
      }, 1000);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setIsDropdownOpen(false);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setIsDropdownOpen(false);
    // Clear messages when switching users
    setMessages([]);
  };

  // Only render if user is logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Chat Container - Wraps both button and window */}
      <div className="fixed bottom-4 right-4 flex items-end gap-4 z-40 chatbox-container">
        {/* Chat Window */}
        {isChatOpen && (
          <div className="w-96 bg-white rounded-lg shadow-lg animate-fade-in">
            {/* Chat Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="relative flex-1">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 hover:bg-blue-700 px-2 py-1 rounded-lg transition-colors w-full"
                  >
                    <span className="text-lg font-medium">
                      {selectedUser ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-sm font-medium">
                            {selectedUser.avatar}
                          </div>
                          <span>{selectedUser.name}</span>
                        </div>
                      ) : (
                        'Chat with'
                      )}
                    </span>
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                      {chatUsers.map(user => (
                        <button
                          key={user.id}
                          onClick={() => selectUser(user)}
                          className="flex items-center gap-2 w-full p-3 hover:bg-gray-100 transition-colors text-gray-800"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center text-sm font-medium">
                            {user.avatar}
                          </div>
                          <span className="font-normal">{user.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={toggleChat}
                  className="ml-4 text-white hover:text-gray-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-4">
              {!selectedUser ? (
                <div className="flex items-center justify-center h-full text-gray-500 font-normal">
                  Select a user to start chatting
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        } font-normal`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={selectedUser ? "Type your message..." : "Select a user to start chatting"}
                  disabled={!selectedUser}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-normal"
                />
                <button
                  type="submit"
                  disabled={!selectedUser}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Chat Button */}
        <button
          onClick={toggleChat}
          className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all transform hover:scale-110"
          title={isChatOpen ? "Close chat" : "Open chat"}
        >
          <FontAwesomeIcon 
            icon={faComments} 
            className="text-xl"
          />
        </button>
      </div>
    </>
  );
};

export default Chatbox; 