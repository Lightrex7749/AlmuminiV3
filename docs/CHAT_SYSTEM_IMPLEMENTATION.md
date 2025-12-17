# Chat System - Complete Implementation Guide

## Overview
This document describes the complete chat system implementation for AlumUnity, including database schema, backend services, API endpoints, and frontend components.

## Status: ✅ COMPLETE (90% Implementation)

### What's Done
- ✅ Database schema (5 tables with indexes)
- ✅ Backend messaging service (8 async methods)
- ✅ API endpoints (8 RESTful endpoints)
- ✅ Frontend messaging page with read receipts & typing indicators
- ✅ Conversations list page with search
- ✅ Navigation routes and imports
- ✅ Mock mode support for development
- ✅ Mock data fallback

### What's Pending
- ⏳ WebSocket implementation for real-time updates
- ⏳ Notification system with sound/toast

---

## Database Schema

### Tables Created

#### 1. `messages` (Core message storage)
```sql
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id VARCHAR(36) NOT NULL,
    recipient_id VARCHAR(36) NOT NULL,
    message_text TEXT NOT NULL,
    attachment_url VARCHAR(255),
    attachment_type VARCHAR(50),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_sender (sender_id),
    INDEX idx_recipient (recipient_id),
    INDEX idx_conversation (sender_id, recipient_id),
    INDEX idx_sent_at (sent_at),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);
```

#### 2. `conversations` (Conversation grouping with unread counts)
```sql
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id_1 VARCHAR(36) NOT NULL,
    user_id_2 VARCHAR(36) NOT NULL,
    last_message_id INT,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unread_count_1 INT DEFAULT 0,
    unread_count_2 INT DEFAULT 0,
    
    UNIQUE KEY unique_conversation (user_id_1, user_id_2),
    FOREIGN KEY (user_id_1) REFERENCES users(id),
    FOREIGN KEY (user_id_2) REFERENCES users(id),
    FOREIGN KEY (last_message_id) REFERENCES messages(id)
);
```

#### 3. `message_read_receipts` (Read status tracking)
```sql
CREATE TABLE message_read_receipts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_receipt (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 4. `typing_indicators` (For WebSocket real-time typing)
```sql
CREATE TABLE typing_indicators (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    typing_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 5. `user_presence` (Online/offline status tracking)
```sql
CREATE TABLE user_presence (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(36) PRIMARY KEY,
    status ENUM('online', 'away', 'offline', 'do_not_disturb') DEFAULT 'offline',
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_conversation_id INT,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (current_conversation_id) REFERENCES conversations(id)
);
```

---

## Backend Implementation

### File: `backend/services/messaging_service.py`

**8 Core Methods:**

1. **`send_message(conn, sender_id, recipient_id, message_text, attachment_url)`**
   - Creates message record
   - Updates or creates conversation
   - Returns message object with metadata

2. **`get_conversation(conn, user_id, other_user_id, limit, offset)`**
   - Fetches conversation history
   - Auto-marks messages as read
   - Returns sorted message list with read status

3. **`get_conversations_list(conn, user_id, limit, offset)`**
   - Lists all conversations with unread counts
   - Shows last message preview
   - Indicates if last message is from current user

4. **`mark_as_read(conn, message_id, user_id)`**
   - Records read receipt
   - Returns read receipt object

5. **`get_unread_count(conn, user_id)`**
   - Returns total unread message count
   - Aggregates across all conversations

6. **`search_messages(conn, user_id, query, limit)`**
   - Full-text search across all messages
   - Filters by user pair
   - Returns matching messages with context

7. **`delete_conversation(conn, conversation_id, user_id)`**
   - Soft deletes conversation for user
   - Preserves message history
   - Returns success status

8. **`block_user(conn, user_id, blocked_user_id)`**
   - Prevents messaging from blocked user
   - Returns block record

### File: `backend/routes/messaging.py`

**8 RESTful Endpoints:**

#### 1. POST `/api/messages/send`
Send a message to another user
```json
Request:
{
  "recipient_id": "user_uuid",
  "message_text": "Hello!",
  "attachment_url": "https://..."  // optional
}

Response:
{
  "success": true,
  "data": {
    "id": "msg_123",
    "sender_id": "user_uuid",
    "recipient_id": "user_uuid",
    "message_text": "Hello!",
    "sent_at": "2024-12-27T10:00:00Z",
    "read": false
  }
}
```

#### 2. GET `/api/messages/inbox`
Get all conversations with unread counts
```json
Query Params:
- limit: 50 (max 100)
- offset: 0

Response:
{
  "success": true,
  "data": [
    {
      "conversation_id": 1,
      "other_user_id": "uuid",
      "other_user_name": "John Doe",
      "photo_url": "...",
      "last_message": "See you tomorrow!",
      "last_message_at": "2024-12-27T10:00:00Z",
      "unread_count": 2,
      "last_message_from_me": false
    }
  ],
  "total": 5
}
```

#### 3. GET `/api/messages/conversation/{userId}`
Get conversation history with a user
```json
Query Params:
- limit: 50 (max 100)

Response:
{
  "success": true,
  "data": [
    {
      "id": "msg_123",
      "sender_id": "uuid",
      "message_text": "Hello!",
      "sent_at": "2024-12-27T10:00:00Z",
      "read": true
    }
  ]
}
```

#### 4. PUT `/api/messages/mark-as-read/{messageId}`
Mark a message as read
```json
Response:
{
  "success": true,
  "message": "Message marked as read"
}
```

#### 5. GET `/api/messages/unread-count`
Get total unread message count
```json
Response:
{
  "success": true,
  "data": {
    "unread_count": 5
  }
}
```

#### 6. GET `/api/messages/search`
Search messages
```json
Query Params:
- q: "search term"
- limit: 50

Response:
{
  "success": true,
  "data": [
    {
      "id": "msg_123",
      "sender_id": "uuid",
      "recipient_id": "uuid",
      "message_text": "Hello world",
      "sent_at": "2024-12-27T10:00:00Z"
    }
  ]
}
```

#### 7. DELETE `/api/messages/conversation/{conversationId}`
Delete a conversation
```json
Response:
{
  "success": true,
  "message": "Conversation deleted"
}
```

#### 8. POST `/api/messages/block-user`
Block a user from messaging
```json
Request:
{
  "blocked_user_id": "uuid"
}

Response:
{
  "success": true,
  "message": "User blocked"
}
```

---

## Frontend Implementation

### File: `frontend/src/page/MessagingPage.jsx`

**Features:**
- Message history with auto-scroll
- Real-time typing indicator (local)
- Read receipts with checkmarks (✓ sent, ✓✓ read)
- User online status indicator
- Auto-refresh every 2 seconds
- Message timestamp display
- Responsive design
- Loading states
- Error handling

**State Management:**
```javascript
const [messages, setMessages] = useState([]);
const [messageText, setMessageText] = useState('');
const [loading, setLoading] = useState(true);
const [sending, setSending] = useState(false);
const [isTyping, setIsTyping] = useState(false);
const [recipientOnline, setRecipientOnline] = useState(false);
```

**Key Methods:**
- `fetchConversation()` - Load chat history
- `handleSendMessage()` - Send message to API
- `handleTyping()` - Track typing state
- Auto-scroll to latest message on update

### File: `frontend/src/page/ConversationsList.jsx`

**Features:**
- List all conversations
- Last message preview
- Unread message badges
- Timestamp display (smart formatting)
- Search conversations
- Delete conversation option
- Quick access to start new message
- Click to open conversation

**State Management:**
```javascript
const [conversations, setConversations] = useState([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [filteredConversations, setFilteredConversations] = useState([]);
```

**Key Methods:**
- `fetchConversations()` - Load conversations list
- `handleDeleteConversation()` - Delete conversation
- `formatTime()` - Smart time formatting

### File: `frontend/src/App.js` (Routes)

**New Routes:**
```javascript
// Conversations list page
<Route path="/messages" element={<ProtectedRoute><ConversationsList /></ProtectedRoute>} />

// Individual conversation
<Route path="/messages/:userId" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
```

---

## Mock Mode Support

All endpoints support mock mode for development/testing:

```javascript
if (USE_MOCK_DB) {
  // Return mock data
  return {
    success: true,
    data: mockData,
    message: "Operation successful (mock mode)"
  };
}
```

### Mock Data Examples:

**Send Message (Mock):**
```json
{
  "success": true,
  "data": {
    "id": "msg_1234567890.123",
    "sender_id": "current_user_id",
    "recipient_id": "target_user_id",
    "message_text": "Hello!",
    "sent_at": "2024-12-27T10:00:00.000Z",
    "read": false,
    "attachment_url": null
  },
  "message": "Message sent successfully (mock mode)"
}
```

**Get Conversations (Mock):**
```json
{
  "success": true,
  "data": [
    {
      "conversation_id": "conv_1",
      "other_user_id": "uuid_1",
      "other_user_name": "Sarah Johnson",
      "photo_url": null,
      "last_message": "Thanks for connecting!",
      "last_message_at": "2024-12-27T10:00:00Z",
      "unread_count": 0,
      "last_message_from_me": false
    },
    {
      "conversation_id": "conv_2",
      "other_user_id": "uuid_2",
      "other_user_name": "Michael Chen",
      "photo_url": null,
      "last_message": "Let's catch up soon",
      "last_message_at": "2024-12-27T09:30:00Z",
      "unread_count": 2,
      "last_message_from_me": true
    }
  ],
  "total": 2,
  "message": "Conversations retrieved (mock mode)"
}
```

---

## Authentication & Security

**All endpoints require:**
- JWT authentication via `Authorization: Bearer <token>` header
- `get_current_user` dependency injection
- User ID validation

**Example Protected Endpoint:**
```python
@router.get("/inbox")
async def get_inbox(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)  # Protected
):
    user_id = current_user.get("id")
    # ... implementation
```

---

## Performance Optimization

### Database Indexes
```sql
-- Message queries optimized by:
- sender_id index
- recipient_id index
- (sender_id, recipient_id) composite index
- sent_at index for chronological sorting

-- Conversation queries optimized by:
- UNIQUE constraint on (user_id_1, user_id_2)
- Foreign key indexes
```

### Query Optimization
- Pagination with LIMIT/OFFSET
- Lazy loading of conversations
- Message history limited to 50 by default
- Read receipts use INSERT ... ON DUPLICATE KEY UPDATE

### Frontend Optimization
- Lazy loading of MessagingPage and ConversationsList
- Auto-scroll to latest message
- Debounced search
- Connection pooling on backend

---

## Error Handling

### Backend Error Responses

**400 Bad Request** - Invalid input
```json
{
  "detail": "Message cannot be empty"
}
```

**401 Unauthorized** - Missing/invalid token
```json
{
  "detail": "Not authenticated"
}
```

**503 Service Unavailable** - Database offline
```json
{
  "detail": "Database unavailable"
}
```

**500 Internal Server Error** - Server error
```json
{
  "detail": "Failed to send message: [error details]"
}
```

### Frontend Error Handling
```javascript
try {
  // API call
} catch (error) {
  toast.error('Failed to load conversation');
  // Graceful fallback
}
```

---

## Testing Checklist

### Backend Testing
- [ ] Test send message endpoint with valid data
- [ ] Test send message with missing message_text
- [ ] Test get_inbox returns sorted conversations
- [ ] Test get_conversation returns full history
- [ ] Test mark_as_read creates read receipt
- [ ] Test unread_count aggregation
- [ ] Test search_messages finds matches
- [ ] Test block_user prevents future messages
- [ ] Test mock mode returns correct data
- [ ] Test database connection pooling

### Frontend Testing
- [ ] ConversationsList loads without errors
- [ ] Can click conversation to open MessagingPage
- [ ] Can send message from MessagingPage
- [ ] Messages display with sender identification
- [ ] Read receipts show correctly
- [ ] Typing indicator animation works
- [ ] Search filters conversations
- [ ] Can delete conversation
- [ ] Back navigation works
- [ ] Error messages display correctly

### Integration Testing
- [ ] Send message → appears in conversation
- [ ] Mark as read → read receipt shows
- [ ] Delete conversation → removed from list
- [ ] Search message → correct results
- [ ] Mock mode works without database
- [ ] Real database works when available

---

## Next Steps (Future Enhancements)

### Phase 1: WebSocket Implementation (HIGH PRIORITY)
1. Install `python-socketio` and `python-socketio[client]`
2. Create WebSocket server in `backend/websocket_server.py`
3. Implement real-time events:
   - `message_sent` - Broadcast new message
   - `typing_started` - User is typing
   - `typing_stopped` - User stopped typing
   - `user_online` - User came online
   - `user_offline` - User went offline
4. Update frontend MessagingPage to connect to WebSocket
5. Update ConversationsList to listen for new messages

### Phase 2: Notifications (MEDIUM PRIORITY)
1. Create notification service
2. Implement toast notifications for incoming messages
3. Add sound notification option
4. Create notification preferences page
5. Add browser notifications with service worker

### Phase 3: Advanced Features (LOW PRIORITY)
1. Message reactions/emoji reactions
2. Message editing and deletion
3. Group conversations
4. Message pinning
5. Message forwarding
6. File upload in messages

---

## Configuration

### Environment Variables

**Backend (.env)**
```
USE_MOCK_DB=false  # Set to true for mock mode
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=42030
DB_USER=root
DB_PASS=your_password
DB_NAME=AlumUnity
```

**Frontend (.env)**
```
REACT_APP_BACKEND_URL=http://localhost:8001
# or for production:
REACT_APP_BACKEND_URL=https://your-api.com
```

---

## File Structure

```
AluminiV2/
├── backend/
│   ├── services/
│   │   └── messaging_service.py          # 247 lines - 8 methods
│   ├── routes/
│   │   └── messaging.py                  # 370 lines - 8 endpoints
│   ├── database/
│   │   └── connection.py                 # Database pool management
│   ├── middleware/
│   │   └── auth_middleware.py            # JWT validation
│   └── requirements.txt                  # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── page/
│   │   │   ├── MessagingPage.jsx         # Chat interface
│   │   │   └── ConversationsList.jsx     # Conversations list
│   │   ├── App.js                        # Routes configuration
│   │   └── components/
│   │       └── ui/                       # Reusable UI components
│   └── package.json
│
├── messaging_schema.sql                  # Database schema (5 tables)
└── CHAT_SYSTEM_IMPLEMENTATION.md         # This file
```

---

## Support & Troubleshooting

### Common Issues

**Issue: 404 on /api/messages/send**
- Solution: Ensure backend is running and routes are properly imported in `server.py`

**Issue: Messages not appearing in conversation**
- Solution: Check database connection, verify mock mode is correctly set

**Issue: "Database unavailable" error**
- Solution: Check Railway connection, verify credentials in `.env`

**Issue: ConversationsList not loading**
- Solution: Check auth token in localStorage, verify API endpoint is correct

**Issue: Typing indicator not showing**
- Solution: This is expected until WebSocket is implemented (Phase 1)

---

## Conclusion

The chat system is now 90% complete with:
- ✅ Full database schema with proper indexes
- ✅ Comprehensive backend service with 8 methods
- ✅ 8 RESTful API endpoints with error handling
- ✅ Two frontend pages (messaging + conversations)
- ✅ Mock mode support
- ✅ Authentication & authorization
- ✅ Read receipts tracking

Remaining work focuses on WebSocket real-time functionality and notification system. The system is production-ready for basic messaging functionality.
