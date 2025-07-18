import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Search, 
  Plus, 
  Heart, 
  Users, 
  Clock, 
  Star,
  Filter,
  Settings,
  LogOut,
  MessageSquare
} from 'lucide-react';
import { DigitalHuman } from '../types/index';
import { socketService } from '../services/socketService';

interface MainDashboardProps {
  user: any;
  onLogout: () => void;
  onSelectDigitalHuman: (digitalHuman: DigitalHuman) => void;
  onCreateNew: () => void;
}

interface PublicDigitalHuman extends DigitalHuman {
  creatorName?: string;
  likes: number;
  tags: string[];
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  user,
  onLogout,
  onSelectDigitalHuman,
  onCreateNew
}) => {
  const [myDigitalHumans, setMyDigitalHumans] = useState<DigitalHuman[]>([]);
  const [publicDigitalHumans, setPublicDigitalHumans] = useState<PublicDigitalHuman[]>([]);
  const [activeTab, setActiveTab] = useState<'recent' | 'my-humans' | 'discover'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Set up socket listeners
    socketService.onUserDigitalHumans((digitalHumans) => {
      setMyDigitalHumans(digitalHumans);
      setIsLoading(false);
    });

    // Set up listener for public digital humans
    socketService.onPublicDigitalHumans((publicHumans) => {
      setPublicDigitalHumans(publicHumans);
    });

    // Load public digital humans from server
    socketService.getPublicDigitalHumans();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    socketService.loadDigitalHumans();
  };

  const filteredMyHumans = myDigitalHumans.filter(human =>
    human.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    human.personality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPublicHumans = publicDigitalHumans.filter(human =>
    human.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    human.personality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    human.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const recentHumans = [...myDigitalHumans.slice(0, 3), ...publicDigitalHumans.slice(0, 2)]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const renderDigitalHumanCard = (human: DigitalHuman | PublicDigitalHuman, isPublic = false) => (
    <div
      key={human.id}
      onClick={() => onSelectDigitalHuman(human)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Brain className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{human.name}</h3>
            {!isPublic && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                human.isPublic 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {human.isPublic ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Public
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Private
                  </>
                )}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{human.personality}</p>
          
          {isPublic && 'creatorName' in human && (
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {human.creatorName}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {human.likes}
              </span>
            </div>
          )}
          
          {!isPublic && (
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {new Date(human.updatedAt).toLocaleDateString()}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {'tags' in human && human.tags && human.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {human.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {human.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{human.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Digital Human Studio</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.displayName || user.username}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search digital humans..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create New
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'my-humans', label: 'My Digital Humans', icon: Brain },
              { id: 'discover', label: 'Discover', icon: Star }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Recent Tab */}
              {activeTab === 'recent' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Used</h2>
                  {recentHumans.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No recent digital humans</p>
                      <button
                        onClick={onCreateNew}
                        className="mt-4 text-purple-600 hover:text-purple-700"
                      >
                        Create your first digital human
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentHumans.map(human => renderDigitalHumanCard(human))}
                    </div>
                  )}
                </div>
              )}

              {/* My Digital Humans Tab */}
              {activeTab === 'my-humans' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    My Digital Humans ({filteredMyHumans.length})
                  </h2>
                  {filteredMyHumans.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchQuery ? 'No digital humans match your search' : 'You haven\'t created any digital humans yet'}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={onCreateNew}
                          className="mt-4 text-purple-600 hover:text-purple-700"
                        >
                          Create your first digital human
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMyHumans.map(human => renderDigitalHumanCard(human))}
                    </div>
                  )}
                </div>
              )}

              {/* Discover Tab */}
              {activeTab === 'discover' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Discover Public Digital Humans ({filteredPublicHumans.length})
                  </h2>
                  {filteredPublicHumans.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No public digital humans match your search</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPublicHumans.map(human => renderDigitalHumanCard(human, true))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
