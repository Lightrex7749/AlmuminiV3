import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import MainNavbar from '@/components/layout/MainNavbar';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const MessagingPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const recipientName = location.state?.recipientName || 'User';
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [recipientOnline, setRecipientOnline] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchConversation();
  }, [userId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversation = async () => {
    if (!userId) {
      console.error('User ID is undefined');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${BACKEND_URL}/api/messages/conversation/${userId}`;
      
      console.log('Fetching conversation from:', url);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${BACKEND_URL}/api/messages/send`;
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('recipient_id', userId);
      formData.append('message_text', messageText);
      
      const response = await axios.post(
        url,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setMessageText('');
        toast.success('Message sent');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    // Clear existing timeout
    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    setTypingTimeout(timeout);
    setIsTyping(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MainNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading conversation...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNavbar />

      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Messages Card */}
          <Card className="h-[600px] flex flex-col shadow-lg">
            {/* Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={recipientName} />
                    <AvatarFallback>
                      {recipientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{recipientName}</CardTitle>
                    <p className={`text-xs ${
                      recipientOnline ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}>
                      {recipientOnline ? '🟢 Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/messages')}
                >
                  ← Back to inbox
                </Button>
              </div>
            </CardHeader>

            {/* Messages Container */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-lg ${
                          msg.sender_id === currentUser.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="break-words">{msg.message_text || msg.message}</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(msg.sent_at || msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {msg.sender_id === currentUser.id && (
                            msg.read_at ? (
                              <CheckCheck className="h-4 w-4 opacity-70" />
                            ) : (
                              <Check className="h-4 w-4 opacity-70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Input Footer */}
            <div className="border-t p-4 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={handleTyping}
                  disabled={sending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MessagingPage;
