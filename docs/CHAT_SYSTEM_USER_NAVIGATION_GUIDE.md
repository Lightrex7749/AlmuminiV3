# Chat System - Navigation & User Guide

## Overview
This guide helps users and developers navigate the chat system features in AlumUnity.

---

## User Navigation Paths

### Path 1: Send Message to Someone from Directory

```
1. Login to AlumUnity (/)
2. Click "Directory" in navigation
   → Opens AlumniDirectory (/directory)
3. Find a user you want to message
4. Click "Message" button on their profile
   → Opens ProfileView (/profile/{userId})
5. Click "Send Message" button
   → Navigates to MessagingPage (/messages/{userId})
6. Type your message
7. Click "Send" button
   → Message sent to database
   → Appears in conversation
   → Recipient can see when they open conversation
```

**Components Involved:**
- AlumniDirectory → ProfileView → MessagingPage
- Button handlers in ProfileView.jsx
- API call: POST /api/messages/send

---

### Path 2: View All Conversations

```
1. Login to AlumUnity (/)
2. Navigate to Messages page
   → Directly visit /messages URL
   → OR click Messages link in navigation (if added)
3. Opens ConversationsList (/messages)
4. See all your conversations:
   - User name & avatar
   - Last message preview
   - Unread message count
   - Timestamp of last message
5. Click any conversation to open chat
   → Navigates to MessagingPage (/messages/{userId})
```

**Components Involved:**
- ConversationsList page
- API call: GET /api/messages/inbox
- Click handler navigates to /messages/{userId}

---

### Path 3: Continue an Existing Conversation

```
1. On ConversationsList (/messages)
2. Click the conversation you want to continue
   → Opens MessagingPage (/messages/{userId})
3. See full chat history (auto-scrolled to bottom)
4. Type new message in input
5. Click "Send" button
   → Message sent immediately
   → Appears in your conversation
6. Original recipient sees message on next poll (2 seconds)
```

**Components Involved:**
- ConversationsList (click handler)
- MessagingPage (message display & send)
- API calls: GET /api/messages/conversation/{userId}, POST /api/messages/send

---

### Path 4: Search Conversations

```
1. On ConversationsList (/messages)
2. Click search box: "Search conversations..."
3. Start typing user's name
   → Results filter in real-time
4. See matching conversations
5. Click to open or press Enter
   → Navigates to MessagingPage
```

**Components Involved:**
- ConversationsList search feature
- Real-time filtering (local)

---

### Path 5: Delete a Conversation

```
1. On ConversationsList (/messages)
2. Hover over conversation
3. Click trash icon button
4. Confirm deletion in dialog
5. Conversation removed from list
   → Not visible to you anymore
   → Other user can still see it
```

**Components Involved:**
- ConversationsList delete button
- API call: DELETE /api/messages/conversation/{conversationId}
- Confirmation dialog

---

## Component Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                        Home (/)                              │
└────────────────┬────────────────────────────────────────────┘
                 │ Click Navigation → Directory
                 ↓
         ┌───────────────────────┐
         │  AlumniDirectory      │
         │  (/directory)         │
         │                       │
         │ - Search alumni       │
         │ - View profiles       │
         │ - Message button      │
         └───────┬───────────────┘
                 │ Click profile → View
                 ↓
         ┌───────────────────────┐
         │  ProfileView          │
         │  (/profile/{userId})  │
         │                       │
         │ - View full profile   │
         │ - Message button ───┐ │
         │ - Download CV       │ │
         └───────────────────┬─┘ │
                             │   │
                   ┌─────────┘   │
                   ↓             │
              ┌────────────────────────────────┐
              │   MessagingPage                │
              │   (/messages/{userId})         │
              │                                │
              │ - View chat history           │
              │ - Send messages               │
              │ - Read receipts (✓✓)          │
              │ - See online status           │
              │ - Typing indicator            │
              │ - Back to inbox button   ┐    │
              └────────────────────────┬─┘    │
                                       │      │
                         ┌─────────────┘      │
                         │                    │
                         ↓                    │
              ┌──────────────────────────┐    │
              │  ConversationsList       │←───┘
              │  (/messages)             │
              │                          │
              │ - All conversations      │
              │ - Unread counts          │
              │ - Search/filter          │
              │ - Delete conversation    │
              │ - New message button     │
              └──────┬───────────────────┘
                     │ Click conversation
                     ├─────────────────────→ (back to MessagingPage)
                     │
                     └─ Navigate to /directory → (back to step 1)
```

---

## Data Flow Diagram

### Sending a Message

```
User Input (MessagingPage)
       ↓
onClick handler triggers
       ↓
handleSendMessage() function
       ↓
Validate (not empty)
       ↓
POST /api/messages/send
  {
    recipient_id: "user_uuid",
    message_text: "Hello!",
    attachment_url: null
  }
       ↓
Backend Endpoint
  (routes/messaging.py → send_message)
       ↓
MessagingService.send_message()
       ↓
INSERT INTO messages table
       ↓
UPDATE conversations table
       ↓
Return message object
       ↓
Frontend receives response
       ↓
Update local state (setMessages)
       ↓
Message appears in conversation
       ↓
Polling every 2 seconds
       ↓
Recipient's client polls
       ↓
Receives message in GET /api/messages/conversation/{userId}
       ↓
Message appears in recipient's view
       ↓
Recipient opens conversation
       ↓
Messages auto-marked as read
       ↓
PUT /api/messages/mark-as-read/{messageId}
       ↓
INSERT INTO message_read_receipts table
       ↓
Sender polls and sees read receipt
       ↓
✓✓ appears next to message
```

### Loading Conversations List

```
User navigates to /messages
       ↓
ConversationsList component mounts
       ↓
useEffect hook triggers
       ↓
fetchConversations() called
       ↓
GET /api/messages/inbox
       ↓
Backend Endpoint
  (routes/messaging.py → get_inbox)
       ↓
MessagingService.get_conversations_list()
       ↓
SELECT FROM conversations
       ↓
JOIN with messages for last message
       ↓
GROUP BY unread counts
       ↓
Return list with metadata
       ↓
Frontend receives response
       ↓
setConversations(data)
       ↓
Component re-renders
       ↓
List displays with:
  - Avatars
  - Names
  - Last message preview
  - Unread badges
  - Timestamps
       ↓
User can search, delete, or open
```

---

## Route Mapping

### Protected Routes (Require JWT Token)

| Path | Component | Purpose |
|------|-----------|---------|
| `/messages` | ConversationsList | View all conversations |
| `/messages/{userId}` | MessagingPage | View/send messages with user |
| `/directory` | AlumniDirectory | Find people to message |
| `/profile/{userId}` | ProfileView | View profile and message button |

### Route Configuration (App.js)

```javascript
<Route path="/messages" element={
  <ProtectedRoute>
    <ConversationsList />
  </ProtectedRoute>
} />

<Route path="/messages/:userId" element={
  <ProtectedRoute>
    <MessagingPage />
  </ProtectedRoute>
} />
```

---

## API Endpoint Reference

### Messages Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | /api/messages/send | Send message | ✓ |
| GET | /api/messages/inbox | Get conversations | ✓ |
| GET | /api/messages/conversation/{userId} | Get chat history | ✓ |
| PUT | /api/messages/mark-as-read/{messageId} | Mark as read | ✓ |
| GET | /api/messages/unread-count | Get unread count | ✓ |
| GET | /api/messages/search?q=term | Search messages | ✓ |
| DELETE | /api/messages/conversation/{conversationId} | Delete conversation | ✓ |
| POST | /api/messages/block-user | Block user | ✓ |

### Authentication Header

```
Authorization: Bearer <jwt_token>

Example:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Component State Flow

### ConversationsList.jsx

```javascript
State:
  conversations: [       // All conversations
    {
      conversation_id: 1,
      other_user_id: "uuid",
      other_user_name: "John Doe",
      photo_url: "...",
      last_message: "See you later!",
      last_message_at: "2024-12-27T10:00:00Z",
      unread_count: 2,
      last_message_from_me: false
    }
  ]
  loading: boolean       // Is loading
  searchQuery: string    // Search input
  filteredConversations: []  // Filtered results

Effects:
  - On mount: fetchConversations()
  - On searchQuery change: filter locally

Events:
  - Click conversation: navigate to /messages/{userId}
  - Click delete: DELETE conversation
  - Click search: filter conversations
  - Click new message: navigate to /directory
```

### MessagingPage.jsx

```javascript
State:
  messages: [            // Chat history
    {
      id: "msg_123",
      sender_id: "uuid",
      recipient_id: "uuid",
      message_text: "Hello!",
      sent_at: "2024-12-27T10:00:00Z",
      read: true
    }
  ]
  messageText: string    // Input text
  loading: boolean       // Loading state
  sending: boolean       // Is sending
  isTyping: boolean      // User typing status
  recipientOnline: boolean  // Other user online

Effects:
  - On mount: fetchConversation()
  - On userId change: fetchConversation()
  - On messages change: scroll to bottom
  - Auto-refresh every 2 seconds

Events:
  - Type: handleTyping() → set isTyping
  - Send: handleSendMessage() → POST /api/messages/send
  - Back: navigate to previous page
```

---

## Key Features & How to Use

### Feature 1: Read Receipts
**How it works:**
1. You send message → ✓ appears
2. Recipient opens conversation
3. Message auto-marked as read
4. ✓✓ appears in your view
5. Next poll shows updated status

**Implementation:**
- Database: message_read_receipts table
- Auto-triggered when opening conversation
- Shows in MessagingPage with CheckCheck icon

---

### Feature 2: Unread Count
**How it works:**
1. Recipient receives message
2. Unread count increases
3. Badge shows number on ConversationsList
4. Opening conversation marks as read
5. Badge disappears

**Implementation:**
- Database: conversations.unread_count_1/2
- Updated when message sent
- Decremented when opening conversation

---

### Feature 3: Search
**How it works:**
1. Open ConversationsList (/messages)
2. Click search box
3. Type username or partial name
4. Results filter in real-time
5. Click to open

**Implementation:**
- Client-side filtering (no API call)
- Filters by other_user_name
- Case-insensitive

---

### Feature 4: Typing Indicator
**How it works:**
1. User types in message input
2. Animated dots appear: "..."
3. Stops after 1 second of no typing
4. Other user sees on next poll

**Current Status:**
- Local only (your typing status)
- Real-time coming with WebSocket

**Implementation:**
- handleTyping() sets isTyping state
- setTimeout clears after 1 second
- Rendered as animation in message area

---

### Feature 5: Delete Conversation
**How it works:**
1. Open ConversationsList (/messages)
2. Find conversation
3. Click trash icon
4. Confirm deletion
5. Conversation removed from list

**Implementation:**
- DELETE /api/messages/conversation/{conversationId}
- Removes from your list
- Doesn't affect other user's copy
- Messages are preserved (soft delete)

---

## Keyboard Shortcuts (Future)

Currently not implemented, but can be added:

| Shortcut | Action |
|----------|--------|
| Ctrl+M | Open messages |
| Ctrl+K | Open search |
| Enter | Send message |
| Esc | Close message / go back |

---

## Mobile Experience

### Responsive Design
- ✅ Works on iPhone, iPad, Android
- ✅ Conversation list collapses to single column
- ✅ Messages fit screen width
- ✅ Buttons are touch-friendly
- ✅ Scroll-to-bottom on mobile

### Known Limitations
- ⏳ No mobile app (web app only)
- ⏳ No offline message queueing
- ⏳ No image/media upload yet

---

## Common User Actions

### Action 1: Send a Quick Message
```
Time: ~10 seconds
Steps:
1. Click message button on profile
2. Type message
3. Click send
4. Done
```

### Action 2: Check All Messages
```
Time: ~5 seconds
Steps:
1. Go to /messages
2. See all conversations
3. Click one to open
```

### Action 3: Search for Someone to Message
```
Time: ~20 seconds
Steps:
1. Go to /directory
2. Search/filter
3. Click profile
4. Click message
5. Type and send
```

### Action 4: Clean Up Old Conversations
```
Time: ~1 minute per conversation
Steps:
1. Go to /messages
2. Hover conversation
3. Click delete
4. Confirm
```

---

## Troubleshooting Navigation

### Problem: Can't find message button
**Solution:** 
- Opened your own profile? Message button won't show
- Try viewing someone else's profile

### Problem: Conversation doesn't appear
**Solution:**
- You haven't sent a message to them yet
- Check /messages - should be empty
- Send first message from directory

### Problem: Messages not refreshing
**Solution:**
- Polling happens every 2 seconds
- Wait 2-3 seconds after sender sends
- Refresh page to force update
- Check auth token is valid

### Problem: Read receipts not showing
**Solution:**
- Recipient must open the conversation
- Messages auto-marked as read on open
- Refresh to see updated checkmarks
- Real-time coming with WebSocket

### Problem: Can't send message
**Solution:**
- Check message isn't empty
- Verify backend is running
- Check auth token in localStorage
- Try mock mode to test without database

---

## Summary

**Easy Ways to Start Messaging:**
1. Directory → Click Message button (recommended)
2. /messages → Click "New Message" button
3. /messages → Click existing conversation

**Main Pages:**
- `/messages` - See all conversations
- `/messages/{userId}` - Chat with one person

**Main Features:**
- Send/receive messages
- See unread counts
- Search conversations
- Read receipts (✓✓)
- Delete conversations

**Need Help?**
- See CHAT_SYSTEM_IMPLEMENTATION.md for technical details
- See QUICK_START_GUIDE_CHAT_SYSTEM.md for setup
- Check error messages in browser console

---

Last Updated: December 27, 2024
