import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  initials: string;
  message: string;
  timestamp: string;
}

interface DiscussionsPanelProps {
  requirementId: string;
}

export const DiscussionsPanel = ({ requirementId }: DiscussionsPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '2',
      user: 'Sarah Johnson',
      initials: 'SJ',
      message: 'Agreed. Should we also consider the calendar sync frequency?',
      timestamp: '1 hour ago'
    },
    {
      id: '1',
      user: 'John Smith',
      initials: 'JS',
      message: 'I think we need to clarify the integration requirements with Outlook API.',
      timestamp: '2 hours ago'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: 'Current User',
        initials: 'CU',
        message: newMessage,
        timestamp: 'Just now'
      };
      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header - Fixed Height */}
      <div className="h-16 flex-shrink-0 p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Discussions</h3>
        <p className="text-sm text-muted-foreground">REQ-{requirementId}</p>
      </div>

      {/* Messages - Scrollable Middle */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {message.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{message.user}</span>
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                </div>
                <p className="text-sm text-foreground break-words">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input - Fixed Height */}
      <div className="h-20 flex-shrink-0 p-4 bg-background border-t border-border">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button onClick={handleSendMessage} size="icon" className="h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};