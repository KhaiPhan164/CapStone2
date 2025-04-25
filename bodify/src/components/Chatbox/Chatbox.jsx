import React, { useState, useRef, useEffect } from 'react';
import AuthService from '../../services/auth.service';
import ChatService from '../../services/chat.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes, faChevronDown, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

// Add Roboto font
const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

.chatbox-container {
  font-family: 'Roboto', sans-serif;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-toggle {
  background: #0084ff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.chat-window {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px;
  background: #0084ff;
  color: white;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin: 2px 0;
  width: fit-content;
}

.message-content {
  padding: 8px 12px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
  font-size: 14px;
  line-height: 1.4;
}

.message.sent {
  align-self: flex-end;
  margin-left: auto;
}

.message.received {
  align-self: flex-start;
  margin-right: auto;
}

.message.sent .message-content {
  background: #0084ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.received .message-content {
  background: #e4e6eb;
  color: black;
  border-bottom-left-radius: 4px;
}

.message .time {
  font-size: 11px;
  margin-top: 2px;
  opacity: 0.7;
}

.message.sent .time {
  text-align: right;
  color: #8e8e8e;
}

.message.received .time {
  text-align: left;
  color: #8e8e8e;
}

.message-group {
  margin: 12px 0;
}

.date-separator {
  text-align: center;
  margin: 16px 0;
  position: relative;
}

.date-separator::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #e4e6eb;
  z-index: 1;
}

.date-separator span {
  background: white;
  padding: 0 10px;
  color: #65676b;
  font-size: 12px;
  position: relative;
  z-index: 2;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.chat-input button {
  background: #0084ff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
}

.contacts-list {
  max-height: 300px;
  overflow-y: auto;
}

.contact-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-item:hover {
  background: #f8f9fa;
}

.online-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #28a745;
  display: inline-block;
  margin-right: 5px;
}

.offline-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #dc3545;
  display: inline-block;
  margin-right: 5px;
}
`;
document.head.appendChild(style);

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const currentUser = AuthService.getCurrentUser();

  // Kết nối WebSocket và thiết lập test data
  useEffect(() => {
    if (!currentUser?.user_id) return;

    // Kết nối chat
    console.log('Kết nối chat với user ID:', currentUser.user_id);
    ChatService.connect(currentUser.user_id);

    // Đăng ký lắng nghe tin nhắn mới ngay khi kết nối
    const removeNewMessageHandler = ChatService.onNewMessage((message) => {
      console.log('Nhận tin nhắn mới:', message);
      
      // Ensure we have all required fields
      if (!message.content) {
        console.error('Invalid message format:', message);
        return;
      }

      // Add timestamp if missing
      if (!message.created_at) {
        message.created_at = new Date().toISOString();
      }

      // Always update messages state with new message
      setMessages(prev => {
        // Simple duplicate check based on exact content and timestamp
        const isDuplicate = prev.some(m => 
          m.content === message.content && 
          Math.abs(new Date(m.created_at) - new Date(message.created_at)) < 500
        );
        
        if (isDuplicate) {
          console.log('Duplicate message detected, skipping');
          return prev;
        }

        const newMessages = [...prev, message];
        return newMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });
      
      // Auto scroll to new message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    // Đăng ký lắng nghe cập nhật trạng thái online
    const removeOnlineUsersHandler = ChatService.onOnlineUsersUpdate((users) => {
      console.log('Cập nhật người dùng online:', users);
      setOnlineUsers(users);
    });

    // Lắng nghe sự kiện selectUser từ nút Liên hệ
    const handleSelectUser = (event) => {
      const contact = event.detail;
      if (contact) {
        // Thêm contact mới vào danh sách nếu chưa có
        setContacts(prev => {
          const exists = prev.some(c => c.id === contact.id);
          if (!exists) {
            return [...prev, contact];
          }
          return prev;
        });
        selectUser(contact);
      }
    };
    document.querySelector('.chatbox-container')?.addEventListener('selectUser', handleSelectUser);

    // Lấy danh sách người dùng đã chat
    const fetchChatUsers = async () => {
      try {
        const response = await ChatService.getAllChatUsers(currentUser.user_id);
        console.log('Danh sách người dùng đã chat:', response);
        
        // Kiểm tra và lấy mảng users từ response
        let chatUsers = [];
        if (response.data && Array.isArray(response.data)) {
          chatUsers = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          chatUsers = response.data.data;
        }

        // Chuyển đổi format dữ liệu để phù hợp với contacts
        const formattedContacts = chatUsers.map(user => ({
          id: user.user_id,
          name: user.name || user.username,
          avatar: user.avatar_url
        }));
        console.log('Formatted contacts:', formattedContacts);
        setContacts(formattedContacts);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng đã chat:', error);
      }
    };

    fetchChatUsers();

    return () => {
      removeNewMessageHandler();
      removeOnlineUsersHandler();
      document.querySelector('.chatbox-container')?.removeEventListener('selectUser', handleSelectUser);
      ChatService.disconnect();
    };
  }, [currentUser?.user_id]); // Chỉ phụ thuộc vào currentUser.user_id

  const selectUser = async (user) => {
    setSelectedUser(user);
    try {
      console.log('Lấy lịch sử chat với user:', user.id);
      const history = await ChatService.getChatHistory(currentUser.user_id, user.id);
      console.log('Lịch sử chat:', history);
      console.log('Current user ID:', currentUser.user_id);
      setMessages(history || []);
      // Auto scroll xuống tin nhắn mới nhất
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUser || !currentUser) return;

    const messageContent = inputMessage.trim();
    setInputMessage(''); // Clear input immediately for better UX

    try {
      // Create message object
      const newMessage = {
        content: messageContent,
        to_user_id: selectedUser.id,
        from_user_id: currentUser.user_id,
        created_at: new Date().toISOString()
      };

      // Update UI immediately for sender
      setMessages(prev => {
        const newMessages = [...prev, newMessage];
        return newMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });

      // Auto scroll to new message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      // Send message to server
      await ChatService.sendMessage(selectedUser.id, messageContent);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      
      // Remove failed message from UI
      setMessages(prev => prev.filter(msg => 
        msg.content !== messageContent || 
        msg.created_at !== newMessage.created_at
      ));
      setInputMessage(messageContent); // Restore failed message to input
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = formatMessageDate(msg.created_at || new Date());
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  if (!currentUser) return null;

  return (
    <div className="chatbox-container">
      <button className="chat-toggle" onClick={toggleChat}>
        <FontAwesomeIcon icon={faComments} />
      </button>

      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>
              {selectedUser ? (
                <>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    onClick={() => setSelectedUser(null)}
                    style={{ cursor: 'pointer', marginRight: '10px' }}
                  />
                  {selectedUser.name}
                </>
              ) : 'Chọn người dùng'}
            </span>
            <FontAwesomeIcon 
              icon={faTimes} 
              onClick={toggleChat}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {!selectedUser ? (
            <div className="contacts-list">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className="contact-item"
                  onClick={() => selectUser(contact)}
                >
                  <span className={onlineUsers.includes(contact.id) ? 'online-indicator' : 'offline-indicator'} />
                  {contact.name}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="chat-messages">
                {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
                  <div key={date} className="message-group">
                    <div className="date-separator">
                      <span>{date}</span>
                    </div>
                    {dateMessages.map((msg, index) => {
                      // Nếu to_user_id là selectedUser.id -> tin nhắn mình gửi -> bên phải xanh
                      // Nếu to_user_id là currentUser.id -> tin nhắn người khác gửi -> bên trái xám
                      const isSent = Number(msg.to_user_id) === Number(selectedUser.id);
                      
                      const showTime = index === dateMessages.length - 1 || 
                          dateMessages[index + 1]?.to_user_id !== msg.to_user_id;
                      
                      console.log('Message:', {
                          content: msg.content,
                          to_user_id: msg.to_user_id,
                          currentUserId: currentUser.user_id,
                          selectedUserId: selectedUser.id,
                          isSent: isSent
                      });
                      
                      return (
                        <div
                          key={index}
                          className={`message ${isSent ? 'sent' : 'received'}`}
                        >
                          <div className="message-content">
                            {msg.content}
                          </div>
                          {showTime && (
                            <div className="time">
                              {formatMessageTime(msg.created_at || new Date())}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                />
                <button type="submit">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbox; 