import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MessageCircle, Trash2 } from 'lucide-react';
import { ChatMessage, DigitalHuman, ChatRequest } from '../types/index';
import { socketService } from '../services/socketService';

interface ChatPanelProps {
  digitalHuman: DigitalHuman | null;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ digitalHuman }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (digitalHuman) {
      // Clear messages when switching digital humans
      console.log('🔄 Switching to digital human:', digitalHuman.name);
      setMessages([]);
      
      // Join the chat room for this digital human
      socketService.joinChat(digitalHuman.id);
    }
  }, [digitalHuman]);

  useEffect(() => {
    // Listen for incoming messages - set up once
    const handleMessageReceived = (message: ChatMessage) => {
      console.log('📨 ChatPanel received message:', message);
      setMessages(prev => {
        // Avoid duplicate messages
        if (prev.some(m => m.id === message.id)) {
          console.log('⚠️ Duplicate message ignored:', message.id);
          return prev;
        }
        console.log('✅ Adding new message to chat');
        return [...prev, message];
      });
      setIsTyping(false);
    };

    const handleError = (error: { message: string; code?: string }) => {
      console.error('🚨 Socket error in ChatPanel:', error);
      setIsTyping(false);
    };

    console.log('🔗 ChatPanel setting up socket listeners');
    socketService.onMessageReceived(handleMessageReceived);
    socketService.onError(handleError);

    return () => {
      console.log('🧹 ChatPanel cleaning up socket listeners');
      socketService.off('message-received', handleMessageReceived);
      socketService.off('error', handleError);
    };
  }, []); // Empty dependency array - set up once

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !digitalHuman || isTyping) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      digitalHumanId: digitalHuman.id
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);

    // Send message to server
    const request: ChatRequest = {
      message: inputMessage.trim(),
      digitalHumanId: digitalHuman.id,
      chatHistory: messages
    };

    socketService.sendMessage(request);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!digitalHuman) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No Digital Human Selected
          </h3>
          <p className="text-gray-500">
            Generate or select a digital human to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{digitalHuman.name}</h3>
              <p className="text-sm text-gray-600">{digitalHuman.personality}</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100"
            title="Clear chat"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                Start a conversation with {digitalHuman.name}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type a message to ${digitalHuman.name}...`}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};
