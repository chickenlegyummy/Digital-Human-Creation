import React, { useState } from 'react';
import { DigitalHuman } from './types/index';
import { socketService } from './services/socketService';
import { LoginPage } from './pages/LoginPage';
import { MainDashboard } from './pages/MainDashboard';
import { ChatInterface } from './pages/ChatInterface';
import { PromptPanel } from './components/PromptPanel';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  sessionId: string;
}

type AppView = 'login' | 'dashboard' | 'chat' | 'create';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedDigitalHuman, setSelectedDigitalHuman] = useState<DigitalHuman | null>(null);
  const [savedDigitalHumans, setSavedDigitalHumans] = useState<DigitalHuman[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Set up socket event listeners after connection is established
  const setupSocketListeners = () => {
    console.log('🔌 Setting up socket event listeners after connection');
    
    // Set up socket event listeners
    socketService.onPromptGenerated((newDigitalHuman) => {
      console.log('🎉 Digital human generated:', newDigitalHuman.name);
      setSelectedDigitalHuman(newDigitalHuman);
      addNotification('success', `Digital human "${newDigitalHuman.name}" created successfully!`);
      
      // Add to saved list if not already there
      setSavedDigitalHumans(prev => {
        const exists = prev.find(dh => dh.id === newDigitalHuman.id);
        if (!exists) {
          return [newDigitalHuman, ...prev];
        }
        return prev.map(dh => dh.id === newDigitalHuman.id ? newDigitalHuman : dh);
      });
      
      // Go to chat view after creation
      setCurrentView('chat');
    });

    socketService.onDigitalHumanUpdated((updatedDigitalHuman) => {
      console.log('📝 Digital human updated:', updatedDigitalHuman.name);
      setSelectedDigitalHuman(updatedDigitalHuman);
      addNotification('success', 'Digital human updated successfully!');
      
      // Update in saved list
      setSavedDigitalHumans(prev => 
        prev.map(dh => dh.id === updatedDigitalHuman.id ? updatedDigitalHuman : dh)
      );
    });

    socketService.onUserDigitalHumans((digitalHumans) => {
      console.log('📚 Loaded user digital humans:', digitalHumans.length);
      setSavedDigitalHumans(digitalHumans);
    });

    socketService.onDigitalHumanDeleted((digitalHumanId) => {
      console.log('🗑️ Digital human deleted:', digitalHumanId);
      setSavedDigitalHumans(prev => prev.filter(dh => dh.id !== digitalHumanId));
      if (selectedDigitalHuman?.id === digitalHumanId) {
        setSelectedDigitalHuman(null);
        setCurrentView('dashboard');
      }
      addNotification('success', 'Digital human deleted successfully!');
    });

    socketService.onError((error) => {
      console.error('🚨 App received socket error:', error);
      addNotification('error', error.message);
    });

    // Request user's digital humans after setting up listeners
    console.log('📚 Requesting user digital humans...');
    socketService.loadDigitalHumans();
  };

  // Authentication handlers
  const handleLogin = async (username: string, email: string, displayName: string) => {
    try {
      await socketService.connect();
      setIsConnected(true);
      
      // Authenticate with the server
      const authenticatedUser = await socketService.authenticate({ username });
      
      // Set up socket event listeners after authentication
      setupSocketListeners();
      
      // Create user object from server response
      const newUser: User = {
        id: authenticatedUser.id,
        username: authenticatedUser.username,
        email: email,
        displayName: displayName,
        sessionId: `session_${Date.now()}`
      };
      
      setUser(newUser);
      setCurrentView('dashboard');
      addNotification('success', `Welcome, ${displayName}!`);
    } catch (error) {
      console.error('Login failed:', error);
      addNotification('error', 'Failed to authenticate with server');
      setIsConnected(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await socketService.connect();
      setIsConnected(true);
      
      // Authenticate as guest (server will create a guest user)
      const guestUser = await socketService.authenticate({ username: 'guest' });
      
      // Set up socket event listeners after authentication
      setupSocketListeners();

      const newUser: User = {
        id: guestUser.id,
        username: guestUser.username,
        email: 'guest@local',
        displayName: 'Guest User',
        sessionId: `guest_session_${Date.now()}`
      };
      
      setUser(newUser);
      setCurrentView('dashboard');
      addNotification('info', 'Welcome, Guest! Data won\'t be saved permanently.');
    } catch (error) {
      console.error('Guest login failed:', error);
      addNotification('error', 'Failed to authenticate with server');
      setIsConnected(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setSelectedDigitalHuman(null);
    setSavedDigitalHumans([]);
    socketService.disconnect();
    setIsConnected(false);
    addNotification('info', 'Logged out successfully');
  };

  // Digital Human handlers
  const handleSelectDigitalHuman = (digitalHuman: DigitalHuman) => {
    setSelectedDigitalHuman(digitalHuman);
    setCurrentView('chat');
  };

  const handleCreateNew = () => {
    setSelectedDigitalHuman(null);
    setCurrentView('create');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    // Refresh digital humans data when returning to dashboard
    if (user) {
      socketService.loadDigitalHumans();
    }
  };

  const handleDigitalHumanUpdate = (digitalHuman: DigitalHuman) => {
    setSelectedDigitalHuman(digitalHuman);
    setSavedDigitalHumans(prev => 
      prev.map(dh => dh.id === digitalHuman.id ? digitalHuman : dh)
    );
  };

  const handleSaveDigitalHuman = (digitalHuman: DigitalHuman) => {
    // Save to database via socket
    socketService.updateDigitalHuman(digitalHuman);
    
    // Add to local state if not already there
    setSavedDigitalHumans(prev => {
      const exists = prev.find(dh => dh.id === digitalHuman.id);
      if (!exists) {
        return [digitalHuman, ...prev];
      }
      return prev;
    });
    
    addNotification('success', `"${digitalHuman.name}" saved to your dashboard!`);
  };

  const handleDigitalHumanSelect = (selectedHuman: DigitalHuman) => {
    setSelectedDigitalHuman(selectedHuman);
    addNotification('info', `Switched to "${selectedHuman.name}"`);
  };

  const handleDigitalHumanDelete = (digitalHumanId: string) => {
    if (window.confirm('Are you sure you want to delete this digital human? This action cannot be undone.')) {
      socketService.deleteDigitalHuman(digitalHumanId);
    }
  };

  const handleDigitalHumanChange = (updatedHuman: DigitalHuman) => {
    setSelectedDigitalHuman(updatedHuman);
    // Update the saved list if it exists there too
    setSavedDigitalHumans(prev => 
      prev.map(human => human.id === updatedHuman.id ? updatedHuman : human)
    );
  };

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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onGuestLogin={handleGuestLogin}
          />
        );
      
      case 'dashboard':
        return user ? (
          <MainDashboard
            user={user}
            onLogout={handleLogout}
            onSelectDigitalHuman={handleSelectDigitalHuman}
            onCreateNew={handleCreateNew}
          />
        ) : null;
      
      case 'chat':
        return user && selectedDigitalHuman ? (
          <ChatInterface
            digitalHuman={selectedDigitalHuman}
            user={user}
            onBack={handleBackToDashboard}
            onDigitalHumanUpdate={handleDigitalHumanUpdate}
            savedDigitalHumans={savedDigitalHumans}
            onSave={handleSaveDigitalHuman}
          />
        ) : null;
      
      case 'create':
        return user ? (
          <div className="h-screen flex">
            <div className="w-1/2 border-r border-gray-200">
              <PromptPanel
                digitalHuman={selectedDigitalHuman}
                savedDigitalHumans={savedDigitalHumans}
                onDigitalHumanChange={handleDigitalHumanChange}
                onDigitalHumanSelect={handleDigitalHumanSelect}
                onDigitalHumanDelete={handleDigitalHumanDelete}
                isGenerating={isGenerating}
                onGenerating={setIsGenerating}
              />
            </div>
            <div className="w-1/2 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Preview will appear here</p>
                <button
                  onClick={handleBackToDashboard}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentView()}
      
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
