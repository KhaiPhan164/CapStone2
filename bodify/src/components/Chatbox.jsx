import React, { useState, useEffect, useRef } from 'react';
import ChatService from '../services/chat.service';
import { useAuth } from '../hooks/useAuth';
import './Chatbox.css';

const Chatbox = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Hàm chuyển đổi format tin nhắn
  const normalizeMessage = (message) => {
    console.log('Normalizing message:', message);
    const normalized = {
      id: message.chat_id || message.id,
      content: message.content,
      from_user_id: message.user_id || message.from_user_id,
      to_user_id: message.to_user_id,
      timestamp: message.created_at || message.timestamp,
      img_url: message.img_url
    };
    console.log('Normalized result:', normalized);
    return normalized;
  };

  useEffect(() => {
    if (!user?.user_id) {
      console.log('No user ID found:', user);
      return;
    }
    console.log('Current user:', user);

    const fetchContacts = async () => {
      try {
        const contactsList = await ChatService.getContacts(user.user_id);
        console.log('Fetched contacts:', contactsList);
        if (Array.isArray(contactsList)) {
          setContacts(contactsList);
        } else {
          console.error('Contacts list is not an array:', contactsList);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    ChatService.connect(user.user_id);

    const unsubscribeMessage = ChatService.onNewMessage((message) => {
      console.log('New message received:', message);
      if (!selectedUser) {
        console.log('No selected user, skipping message');
        return;
      }
      
      const selectedUserId = selectedUser.id || selectedUser.user_id;
      console.log('Selected user ID:', selectedUserId);
      console.log('Message user_id:', message.user_id);
      console.log('Message to_user_id:', message.to_user_id);
      
      if (message.user_id === selectedUserId || message.to_user_id === selectedUserId) {
        setMessages(prev => {
          console.log('Current messages state:', prev);
          const normalizedMessage = normalizeMessage(message);
          console.log('Normalized new message:', normalizedMessage);
          
          const messageExists = prev.some(m => {
            const exists = m.id === normalizedMessage.id || 
              (m.content === normalizedMessage.content && 
               m.from_user_id === normalizedMessage.from_user_id && 
               m.timestamp === normalizedMessage.timestamp);
            console.log('Checking message exists:', exists, m);
            return exists;
          });
          
          if (!messageExists) {
            console.log('Adding new message to state');
            const newMessages = [...prev, normalizedMessage];
            console.log('New messages state:', newMessages);
            return newMessages;
          }
          return prev;
        });
        scrollToBottom();
      }
    });

    const unsubscribeOnlineUsers = ChatService.onOnlineUsersUpdate((users) => {
      console.log('Online users updated:', users);
      setOnlineUsers(users || []);
    });

    fetchContacts();

    return () => {
      unsubscribeMessage();
      unsubscribeOnlineUsers();
      ChatService.disconnect();
    };
  }, [user?.user_id]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedUser || !user?.user_id) {
        console.log('Missing user or selected user for chat history');
        return;
      }

      try {
        const selectedUserId = selectedUser.id || selectedUser.user_id;
        console.log('Fetching chat history between users:', user.user_id, selectedUserId);
        const history = await ChatService.getChatHistory(user.user_id, selectedUserId);
        console.log('Raw chat history from server:', history);
        
        let normalizedMessages = [];
        if (Array.isArray(history)) {
          console.log('History is an array, normalizing directly');
          normalizedMessages = history.map(msg => {
            const normalized = normalizeMessage(msg);
            console.log('Normalized history message:', normalized);
            return normalized;
          });
        } else if (history && typeof history === 'object') {
          console.log('History is an object, extracting messages array');
          const messagesArray = history.messages || history.data || [];
          normalizedMessages = messagesArray.map(msg => {
            const normalized = normalizeMessage(msg);
            console.log('Normalized history message from object:', normalized);
            return normalized;
          });
        }
        
        console.log('Final normalized messages to set:', normalizedMessages);
        setMessages(normalizedMessages);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setMessages([]);
      }
    };

    if (selectedUser) {
      console.log('Selected user changed:', selectedUser);
      setMessages([]); // Clear messages when switching users
      fetchChatHistory();
    }
  }, [selectedUser, user?.user_id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const selectedUserId = selectedUser.id || selectedUser.user_id;
      console.log('Sending message to:', selectedUserId);
      const sentMessage = await ChatService.sendMessage(selectedUserId, newMessage.trim());
      console.log('Server response for sent message:', sentMessage);
      
      const messageToAdd = normalizeMessage({
        chat_id: sentMessage?.id || Date.now(),
        content: newMessage.trim(),
        user_id: user.user_id,
        to_user_id: selectedUserId,
        created_at: new Date().toISOString(),
        img_url: null,
        ...sentMessage
      });
      
      console.log('Normalized message to add:', messageToAdd);
      setMessages(prev => {
        const newMessages = [...prev, messageToAdd];
        console.log('New messages state after sending:', newMessages);
        return newMessages;
      });
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUserSelect = (contact) => {
    console.log('Selecting user:', contact);
    setSelectedUser(contact);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return '';
    }
  };

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.includes(userId);
  };

  // Debug log cho messages state
  useEffect(() => {
    console.log('Current messages state:', messages);
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="contacts-list">
        <h2>Contacts</h2>
        {contacts.map((contact) => {
          const contactId = contact.id || contact.user_id;
          return (
            <div
              key={contactId}
              className={`contact-item ${selectedUser && (selectedUser.id === contactId || selectedUser.user_id === contactId) ? 'selected' : ''}`}
              onClick={() => handleUserSelect(contact)}
            >
              <div className="contact-info">
                <div className="contact-name">{contact.name || contact.username}</div>
                <div className={`status-indicator ${isUserOnline(contactId) ? 'online' : 'offline'}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-content">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h3>{selectedUser.name || selectedUser.username}</h3>
              <span className={`status ${isUserOnline(selectedUser.id || selectedUser.user_id) ? 'online' : 'offline'}`}>
                {isUserOnline(selectedUser.id || selectedUser.user_id) ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">No messages yet</div>
              ) : (
                messages.map((message, index) => {
                  console.log('Rendering message:', message);
                  const isCurrentUser = Number(message.from_user_id) === Number(user.user_id);
                  console.log('Is current user message:', isCurrentUser, message.from_user_id, user.user_id);
                  return (
                    <div
                      key={message.id || index}
                      className={`message ${isCurrentUser ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">{message.content}</div>
                      <div className="message-timestamp">{formatTimestamp(message.timestamp)}</div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbox; 