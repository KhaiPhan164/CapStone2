import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';
const CHAT_URL = `${BASE_URL}/chat`;

class ChatService {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Set();
    this.onlineUsersHandlers = new Set();
    this.connected = false;
  }

  // Kết nối WebSocket
  connect(userId) {
    if (this.connected) {
      console.log('Đã kết nối rồi, không cần kết nối lại');
      return;
    }

    console.log('Đang kết nối tới chat server với userId:', userId);
    this.socket = io(BASE_URL, {
      query: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      console.log('Đã kết nối tới chat server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Đã ngắt kết nối khỏi chat server');
      this.connected = false;
      // Thử kết nối lại sau 1 giây
      setTimeout(() => {
        if (!this.connected) {
          console.log('Thử kết nối lại...');
          this.socket.connect();
        }
      }, 1000);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Lỗi kết nối socket:', error);
      this.connected = false;
    });

    this.socket.on('newMessage', (message) => {
      console.log('Socket nhận tin nhắn mới:', message);
      if (!message.created_at) {
        message.created_at = new Date().toISOString();
      }
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('onlineUsers', (users) => {
      console.log('Socket nhận cập nhật danh sách người dùng online:', users);
      this.onlineUsersHandlers.forEach(handler => handler(users));
    });
  }

  // Đăng ký handler cho tin nhắn mới
  onNewMessage(handler) {
    console.log('Đăng ký handler cho tin nhắn mới');
    this.messageHandlers.add(handler);
    return () => {
      console.log('Hủy đăng ký handler tin nhắn');
      this.messageHandlers.delete(handler);
    };
  }

  // Đăng ký handler cho danh sách users online
  onOnlineUsersUpdate(handler) {
    console.log('Đăng ký handler cho danh sách người dùng online');
    this.onlineUsersHandlers.add(handler);
    return () => {
      console.log('Hủy đăng ký handler users online');
      this.onlineUsersHandlers.delete(handler);
    };
  }

  // Gửi tin nhắn
  sendMessage(toUserId, content) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        console.log('Đang kết nối lại...');
        this.socket?.connect();
        reject(new Error('Đang kết nối lại với server'));
        return;
      }

      const message = {
        to_user_id: toUserId,
        content: content,
        created_at: new Date().toISOString()
      };

      console.log('Đang gửi tin nhắn:', message);
      this.socket.emit('sendMessage', message, (response) => {
        console.log('Phản hồi từ server cho tin nhắn đã gửi:', response);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          // Không cần gọi handler ở đây vì server sẽ emit 'newMessage' cho cả người gửi và người nhận
          resolve(response.message || message);
        }
      });
    });
  }

  // Gửi tin nhắn với hình ảnh
  async sendMessageWithImage(toUserId, content, imageFile) {
    try {
      // Tạo form data để gửi file
      const formData = new FormData();
      formData.append('to_user_id', toUserId);
      formData.append('content', content);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Gửi request POST với form data
      const response = await axios.post(`${CHAT_URL}/message-with-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Tin nhắn với hình ảnh đã được gửi:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn với hình ảnh:', error);
      throw error;
    }
  }

  // Lấy lịch sử chat với một user
  async getChatHistory(userId, toUserId) {
    try {
      console.log('Đang lấy lịch sử chat giữa users:', userId, toUserId);
      const response = await axios.get(`${CHAT_URL}/users/${userId}/${toUserId}`);
      console.log('Phản hồi lịch sử chat:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử chat:', error);
      throw error;
    }
  }

  // Lấy danh sách liên hệ của user
  async getContacts(userId) {
    try {
      console.log('Đang lấy danh sách liên hệ của user:', userId);
      const response = await axios.get(`${CHAT_URL}/users/${userId}/contacts`);
      console.log('Phản hồi danh sách liên hệ:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách liên hệ:', error);
      throw error;
    }
  }

  // Đánh dấu tin nhắn đã đọc
  async markMessageAsRead(messageId) {
    try {
      const response = await axios.patch(`${CHAT_URL}/messages/${messageId}/read`);
      console.log('Đã đánh dấu tin nhắn như đã đọc:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
      throw error;
    }
  }

  // Lấy số tin nhắn chưa đọc
  async getUnreadCount(userId) {
    try {
      const response = await axios.get(`${CHAT_URL}/users/${userId}/unread-count`);
      console.log('Số tin nhắn chưa đọc:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy số tin nhắn chưa đọc:', error);
      throw error;
    }
  }

  // Xóa tin nhắn
  async deleteMessage(messageId) {
    try {
      const response = await axios.delete(`${CHAT_URL}/messages/${messageId}`);
      console.log('Đã xóa tin nhắn:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa tin nhắn:', error);
      throw error;
    }
  }

  // Ngắt kết nối WebSocket
  disconnect() {
    if (this.socket) {
      console.log('Đang ngắt kết nối khỏi chat server');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Kiểm tra kết nối WebSocket
  testConnection() {
    if (!this.socket) {
      throw new Error('Chưa kết nối tới chat server');
    }
    
    this.socket.emit('test', { message: 'Hello Server' }, (response) => {
      console.log('Phản hồi test:', response);
    });
  }
}

export default new ChatService(); 