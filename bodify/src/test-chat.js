import chatService from './services/chat.service';

async function testChat() {
    try {
        // Connect as user 1
        chatService.connect(1);
        
        // Register message handler to log new messages
        chatService.onNewMessage((message) => {
            console.log('New message received:', message);
        });

        // Register online users handler
        chatService.onOnlineUsersUpdate((users) => {
            console.log('Online users updated:', users);
        });

        // Get chat history between users 1 and 6
        console.log('Fetching chat history between users 1 and 6...');
        const chatHistory = await chatService.getChatHistory(1, 6);
        console.log('Chat history:', chatHistory);

        // Get contacts for user 1
        console.log('Fetching contacts for user 1...');
        const contacts = await chatService.getContacts(1);
        console.log('Contacts:', contacts);

        // Get unread messages count for user 1
        console.log('Fetching unread count for user 1...');
        const unreadCount = await chatService.getUnreadCount(1);
        console.log('Unread messages:', unreadCount);

        // Send a test message from user 1 to user 6
        console.log('Sending test message to user 6...');
        await chatService.sendMessage(6, 'Hello from user 1!');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testChat(); 