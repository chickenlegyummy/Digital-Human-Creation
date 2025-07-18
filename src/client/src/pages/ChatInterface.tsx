import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Share2, Heart, Trash2, Save, BookmarkPlus } from 'lucide-react';
import { DigitalHuman } from '../types/index';
import { ChatPanel } from '../components/ChatPanel';
import { PromptPanel } from '../components/PromptPanel';
import { socketService } from '../services/socketService';

interface ChatInterfaceProps {
  digitalHuman: DigitalHuman;
  user: any;
  onBack: () => void;
  onDigitalHumanUpdate: (digitalHuman: DigitalHuman) => void;
  savedDigitalHumans?: DigitalHuman[];
  onSave?: (digitalHuman: DigitalHuman) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  digitalHuman,
  user,
  onBack,
  onDigitalHumanUpdate,
  savedDigitalHumans = [],
  onSave
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Check if this digital human is already saved
  useEffect(() => {
    const alreadySaved = savedDigitalHumans.some(saved => saved.id === digitalHuman.id);
    setIsSaved(alreadySaved);
  }, [savedDigitalHumans, digitalHuman.id]);

  const handleSave = () => {
    if (!isSaved && onSave) {
      onSave(digitalHuman);
      setIsSaved(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {digitalHuman.name}
              </h1>
              <p className="text-sm text-gray-600">{digitalHuman.personality}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                isSaved 
                  ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              }`}
              title={isSaved ? 'Already saved' : 'Save to dashboard'}
            >
              {isSaved ? (
                <>
                  <BookmarkPlus className="h-5 w-5" />
                  <span className="text-sm font-medium">Saved</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span className="text-sm font-medium">Save</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Like"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Panel */}
        {showSettings && (
          <div className="w-1/3 border-r border-gray-200 overflow-hidden">
            <PromptPanel
              digitalHuman={digitalHuman}
              savedDigitalHumans={[]}
              onDigitalHumanChange={onDigitalHumanUpdate}
              onDigitalHumanSelect={() => {}}
              onDigitalHumanDelete={() => {}}
              isGenerating={isGenerating}
              onGenerating={setIsGenerating}
            />
          </div>
        )}

        {/* Chat Panel */}
        <div className="flex-1 overflow-hidden">
          <ChatPanel digitalHuman={digitalHuman} />
        </div>
      </div>
    </div>
  );
};
