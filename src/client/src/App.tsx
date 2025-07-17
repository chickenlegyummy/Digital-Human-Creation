import React, { useState, useEffect } from 'react';
import { PromptPanel } from './components/PromptPanel';
import { ChatPanel } from './components/ChatPanel';
import { DigitalHuman } from './types/index';
import { socketService } from './services/socketService';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function App() {
  const [digitalHuman, setDigitalHuman] = useState<DigitalHuman | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], message: string) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = { id, type, message };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Connect to socket server
    const connectToServer = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        addNotification('success', 'Connected to server');
      } catch (error) {
        console.error('Failed to connect to server:', error);
        setIsConnected(false);
        addNotification('error', 'Failed to connect to server');
      }
    };

    connectToServer();

    // Set up event listeners only once
    socketService.onPromptGenerated((newDigitalHuman) => {
      console.log('🎉 Digital human generated:', newDigitalHuman.name);
      setDigitalHuman(newDigitalHuman);
      setIsGenerating(false);
      addNotification('success', `Digital human "${newDigitalHuman.name}" created successfully!`);
    });

    socketService.onDigitalHumanUpdated((updatedDigitalHuman) => {
      console.log('📝 Digital human updated:', updatedDigitalHuman.name);
      setDigitalHuman(updatedDigitalHuman);
      addNotification('success', 'Digital human updated successfully!');
    });

    socketService.onError((error) => {
      console.error('🚨 App received socket error:', error);
      setIsGenerating(false);
      addNotification('error', error.message);
    });

    // Don't disconnect on unmount during development to avoid reconnection issues
    // return () => {
    //   socketService.disconnect();
    // };
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Digital Human Creation Studio
          </h1>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  Disconnected
                </>
              )}
            </div>
            {digitalHuman && (
              <div className="text-sm text-gray-600">
                Current: <span className="font-medium">{digitalHuman.name}</span>
              </div>
            )}
            <button
              onClick={() => socketService.testConnection()}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Test Socket
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Prompt Configuration */}
        <div className="w-1/3 border-r border-gray-200 overflow-hidden">
          <PromptPanel
            digitalHuman={digitalHuman}
            onDigitalHumanChange={setDigitalHuman}
            isGenerating={isGenerating}
            onGenerating={setIsGenerating}
          />
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel digitalHuman={digitalHuman} />
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-80 ${getNotificationBgColor(notification.type)}`}
          >
            {getNotificationIcon(notification.type)}
            <span className="flex-1 text-sm font-medium text-gray-800">
              {notification.message}
            </span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
