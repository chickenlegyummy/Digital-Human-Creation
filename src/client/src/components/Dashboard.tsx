import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bot, 
  MessageSquare, 
  Plus, 
  Star, 
  Clock,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Filter,
  Lock,
  Globe,
  Trash2,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { DigitalHuman } from '../types/index';
import { socketService } from '../services/socketService';

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onSelectDigitalHuman: (digitalHuman: DigitalHuman) => void;
  onCreateNew: () => void;
}

interface DashboardData {
  user: any;
  digitalHumans: {
    userBots: DigitalHuman[];
    publicBots: DigitalHuman[];
    recentBots: DigitalHuman[];
  };
  chatSessions: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  onSelectDigitalHuman, 
  onCreateNew 
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'my-bots' | 'public' | 'recent'>('my-bots');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    bot: DigitalHuman | null;
  }>({ isOpen: false, bot: null });
  const [promptViewer, setPromptViewer] = useState<{
    isOpen: boolean;
    bot: DigitalHuman | null;
    copied: boolean;
  }>({ isOpen: false, bot: null, copied: false });

  useEffect(() => {
    // Request dashboard data when component mounts
    socketService.getDashboardData();

    // Set up dashboard data listener
    const handleDashboardData = (data: DashboardData) => {
      console.log('Received dashboard data:', data);
      setDashboardData(data);
      setIsLoading(false);
    };

    socketService.onDashboardData(handleDashboardData);

    // Set up digital human updated listener
    const handleDigitalHumanUpdated = (updatedBot: DigitalHuman) => {
      console.log('Digital human updated:', updatedBot);
      setDashboardData(prev => prev ? {
        ...prev,
        digitalHumans: {
          ...prev.digitalHumans,
          userBots: prev.digitalHumans.userBots.map(bot => 
            bot.id === updatedBot.id ? updatedBot : bot
          )
        }
      } : null);
    };

    socketService.onDigitalHumanUpdated(handleDigitalHumanUpdated);

    // Set up digital human deleted listener
    const handleDigitalHumanDeleted = (deletedBotId: string) => {
      console.log('Digital human deleted:', deletedBotId);
      setDashboardData(prev => prev ? {
        ...prev,
        digitalHumans: {
          ...prev.digitalHumans,
          userBots: prev.digitalHumans.userBots.filter(bot => bot.id !== deletedBotId),
          publicBots: prev.digitalHumans.publicBots.filter(bot => bot.id !== deletedBotId),
          recentBots: prev.digitalHumans.recentBots.filter(bot => bot.id !== deletedBotId)
        }
      } : null);
      setDeleteConfirmation({ isOpen: false, bot: null });
    };

    socketService.onDigitalHumanDeleted(handleDigitalHumanDeleted);

    return () => {
      // Note: This will need to be implemented in socket service
      // socketService.off('dashboard-data', handleDashboardData);
      // socketService.off('digital-human-updated', handleDigitalHumanUpdated);
      // socketService.off('digital-human-deleted', handleDigitalHumanDeleted);
    };
  }, []);

  // Focus trap for delete modal
  useEffect(() => {
    if (deleteConfirmation.isOpen) {
      const modal = document.querySelector('[role="dialog"]') as HTMLElement;
      if (modal) {
        modal.focus();
      }
    }
  }, [deleteConfirmation.isOpen]);

  // Focus trap for prompt viewer modal
  useEffect(() => {
    if (promptViewer.isOpen) {
      const modal = document.querySelector('[aria-labelledby="prompt-modal-title"]') as HTMLElement;
      if (modal) {
        modal.focus();
      }
    }
  }, [promptViewer.isOpen]);

  const handleBotSelect = (digitalHuman: DigitalHuman) => {
    onSelectDigitalHuman(digitalHuman);
  };

  const toggleBotVisibility = (bot: DigitalHuman, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the bot selection
    const updatedBot = { ...bot, isPublic: !bot.isPublic };
    socketService.updateDigitalHuman(updatedBot);
    
    // Update local state optimistically
    setDashboardData(prev => prev ? {
      ...prev,
      digitalHumans: {
        ...prev.digitalHumans,
        userBots: prev.digitalHumans.userBots.map(b => 
          b.id === bot.id ? updatedBot : b
        )
      }
    } : null);
  };

  const handleDeleteBot = (bot: DigitalHuman, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the bot selection
    setDeleteConfirmation({ isOpen: true, bot });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.bot) {
      socketService.deleteDigitalHuman(deleteConfirmation.bot.id);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, bot: null });
  };

  const handleViewPrompt = (bot: DigitalHuman, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the bot selection
    setPromptViewer({ isOpen: true, bot, copied: false });
  };

  const handleCopyPrompt = async () => {
    if (promptViewer.bot) {
      try {
        // Create a well-formatted prompt for external use
        const sections = [];
        
        // Header
        sections.push(`# ${promptViewer.bot.name} - Digital Human Prompt`);
        sections.push(`Generated on: ${new Date().toLocaleDateString()}`);
        sections.push('');
        
        // Basic Information
        sections.push('## Configuration');
        sections.push(`- Temperature: ${promptViewer.bot.temperature} (Controls creativity/randomness)`);
        sections.push(`- Max Tokens: ${promptViewer.bot.maxTokens} (Response length limit)`);
        sections.push(`- Visibility: ${promptViewer.bot.isPublic ? 'Public' : 'Private'}`);
        sections.push('');
        
        // Personality
        sections.push('## Personality');
        sections.push(promptViewer.bot.personality);
        sections.push('');
        
        // Main System Prompt
        sections.push('## System Prompt');
        sections.push('```');
        sections.push(promptViewer.bot.prompt);
        sections.push('```');
        sections.push('');
        
        // Rules (if any)
        if (promptViewer.bot.rules && promptViewer.bot.rules.length > 0) {
          sections.push('## Rules and Guidelines');
          promptViewer.bot.rules.forEach((rule, index) => {
            sections.push(`${index + 1}. ${rule}`);
          });
          sections.push('');
        }
        
        // Usage Instructions
        sections.push('## How to Use This Prompt');
        sections.push('1. Copy the System Prompt section above');
        sections.push('2. Paste it into your AI application as the system/instructions prompt');
        sections.push('3. Adjust the temperature and max tokens settings as needed');
        sections.push('4. The personality section can be integrated into the system prompt if desired');
        sections.push('');
        sections.push('---');
        sections.push(`Exported from Digital Human Creation Studio`);

        const fullPrompt = sections.join('\n');

        await navigator.clipboard.writeText(fullPrompt);
        setPromptViewer(prev => ({ ...prev, copied: true }));
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setPromptViewer(prev => ({ ...prev, copied: false }));
        }, 2000);
      } catch (error) {
        console.error('Failed to copy prompt:', error);
        // Fallback to simple text selection
        alert('Copy failed. Please manually select and copy the text from the modal.');
      }
    }
  };

  const handleQuickCopyPrompt = async () => {
    if (promptViewer.bot) {
      try {
        // Copy just the system prompt for quick use
        await navigator.clipboard.writeText(promptViewer.bot.prompt);
        setPromptViewer(prev => ({ ...prev, copied: true }));
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setPromptViewer(prev => ({ ...prev, copied: false }));
        }, 1500);
      } catch (error) {
        console.error('Failed to copy prompt:', error);
      }
    }
  };

  const closePromptViewer = () => {
    setPromptViewer({ isOpen: false, bot: null, copied: false });
  };

  const filterBots = (bots: DigitalHuman[]) => {
    if (!searchQuery.trim()) return bots;
    return bots.filter(bot => 
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.personality.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCurrentBots = () => {
    if (!dashboardData) return [];
    
    switch (activeTab) {
      case 'my-bots':
        return filterBots(dashboardData.digitalHumans.userBots);
      case 'public':
        return filterBots(dashboardData.digitalHumans.publicBots);
      case 'recent':
        return filterBots(dashboardData.digitalHumans.recentBots);
      default:
        return [];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Digital Human Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.username}!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onCreateNew}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Bot
            </button>
            
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700" />
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">My Bots</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardData?.digitalHumans.userBots.length || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chats</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardData?.chatSessions.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('my-bots')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'my-bots'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Bot className="h-5 w-5" />
                My Digital Humans
              </button>
              
              <button
                onClick={() => setActiveTab('public')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'public'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5" />
                Discover Public
              </button>
              
              <button
                onClick={() => setActiveTab('recent')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'recent'
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-5 w-5" />
                Recent
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Search and Filter Bar */}
          <div className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search digital humans..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Content Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {activeTab === 'my-bots' && 'My Digital Humans'}
              {activeTab === 'public' && 'Discover Public Digital Humans'}
              {activeTab === 'recent' && 'Recently Used'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'my-bots' && 'Manage your personal digital human collection'}
              {activeTab === 'public' && 'Explore digital humans created by the community'}
              {activeTab === 'recent' && 'Quick access to your recently used digital humans'}
            </p>
          </div>

          {/* Digital Humans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentBots().map((bot) => (
              <div
                key={bot.id}
                onClick={() => handleBotSelect(bot)}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group relative"
              >
                {/* Quick Action Buttons - Only for My Bots */}
                {activeTab === 'my-bots' && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => toggleBotVisibility(bot, e)}
                      className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                      title={bot.isPublic ? 'Make Private' : 'Make Public'}
                    >
                      {bot.isPublic ? (
                        <Lock className="h-3 w-3 text-gray-600" />
                      ) : (
                        <Globe className="h-3 w-3 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleViewPrompt(bot, e)}
                      className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200"
                      title="Copy Prompt"
                    >
                      <Copy className="h-3 w-3 text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteBot(bot, e)}
                      className="p-1.5 rounded-full bg-red-100 hover:bg-red-200"
                      title="Delete Bot"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1" title={bot.isPublic ? 'Public Bot' : 'Private Bot'}>
                      {bot.isPublic ? (
                        <Globe className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-500">4.5</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">
                  {bot.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {bot.personality}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(bot.updatedAt.toString())}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    {Math.round(bot.temperature * 100)}% creative
                  </div>
                </div>
                
                {/* Action Indicator */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    {bot.ownerId === user?.id || activeTab === 'my-bots' ? (
                      <span className="text-xs text-blue-600 font-medium">
                        Click to edit
                      </span>
                    ) : (
                      <span className="text-xs text-green-600 font-medium">
                        Click to chat
                      </span>
                    )}
                    {bot.ownerId !== user?.id && activeTab !== 'my-bots' && (
                      <span className="text-xs text-gray-400">
                        By {bot.ownerId ? `User ${bot.ownerId}` : 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {getCurrentBots().length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchQuery ? 'No matching digital humans found' : 'No digital humans yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : activeTab === 'my-bots' 
                    ? 'Create your first digital human to get started'
                    : 'Check back later for new digital humans'
                }
              </p>
              {activeTab === 'my-bots' && !searchQuery && (
                <button
                  onClick={onCreateNew}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Digital Human
                </button>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Prompt Viewer Modal */}
      {promptViewer.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closePromptViewer()}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] mx-4 overflow-y-auto"
            role="dialog"
            aria-labelledby="prompt-modal-title"
            aria-describedby="prompt-modal-desc"
            onKeyDown={(e) => {
              if (e.key === 'Escape') closePromptViewer();
            }}
            tabIndex={0}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 id="prompt-modal-title" className="text-xl font-semibold text-gray-900">
                    {promptViewer.bot?.name} - System Prompt
                  </h3>
                  <p className="text-sm text-gray-500">Copy this prompt to use in other applications</p>
                </div>
              </div>
              <button
                onClick={closePromptViewer}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div id="prompt-modal-desc" className="space-y-6">
              {/* Bot Info Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Digital Human Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{promptViewer.bot?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Temperature:</span>
                    <span className="ml-2 font-medium">{promptViewer.bot?.temperature}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Tokens:</span>
                    <span className="ml-2 font-medium">{promptViewer.bot?.maxTokens}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Visibility:</span>
                    <span className="ml-2 font-medium">{promptViewer.bot?.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                </div>
              </div>

              {/* Personality Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personality</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-gray-700">{promptViewer.bot?.personality}</p>
                </div>
              </div>

              {/* System Prompt Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">System Prompt</h4>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded">
                      MAIN SYSTEM PROMPT
                    </span>
                    <button
                      onClick={handleQuickCopyPrompt}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                      title="Copy just this system prompt"
                    >
                      <Copy className="h-3 w-3" />
                      Quick Copy
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {promptViewer.bot?.prompt}
                  </pre>
                </div>
              </div>

              {/* Rules Section */}
              {promptViewer.bot?.rules && promptViewer.bot.rules.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Rules</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                      {promptViewer.bot.rules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={closePromptViewer}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleQuickCopyPrompt}
                className="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Quick Copy (System Prompt Only)
              </button>
              <button
                onClick={handleCopyPrompt}
                className={`px-4 py-2 rounded-lg text-white transition-all flex items-center gap-2 ${
                  promptViewer.copied 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {promptViewer.copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Full Documentation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && cancelDelete()}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            role="dialog"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-desc"
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelDelete();
              if (e.key === 'Enter') confirmDelete();
            }}
            tabIndex={0}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900">
                Delete Digital Human
              </h3>
            </div>
            
            <p id="delete-modal-desc" className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirmation.bot?.name}"</strong>? 
              This action cannot be undone and will permanently remove all chat history with this digital human.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
