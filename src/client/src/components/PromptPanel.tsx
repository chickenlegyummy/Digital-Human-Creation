import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  RefreshCw, 
  Save, 
  Settings, 
  User, 
  Brain, 
  Zap,
  Plus
} from 'lucide-react';
import { DigitalHuman, GeneratePromptRequest } from '../types/index';
import { socketService } from '../services/socketService';

interface PromptPanelProps {
  digitalHuman: DigitalHuman | null;
  savedDigitalHumans: DigitalHuman[];
  onDigitalHumanChange: (digitalHuman: DigitalHuman) => void;
  onDigitalHumanSelect: (digitalHuman: DigitalHuman) => void;
  onDigitalHumanDelete: (digitalHumanId: string) => void;
  isGenerating: boolean;
  onGenerating: (generating: boolean) => void;
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  digitalHuman,
  savedDigitalHumans,
  onDigitalHumanChange,
  onDigitalHumanSelect,
  onDigitalHumanDelete,
  isGenerating,
  onGenerating
}) => {
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [domain, setDomain] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Local state for editing
  const [localHuman, setLocalHuman] = useState<DigitalHuman | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (digitalHuman) {
      setLocalHuman(digitalHuman);
      setHasChanges(false);
    }
  }, [digitalHuman]);

  const handleGenerate = () => {
    if (!description.trim()) {
      alert('Please provide a description for your digital human');
      return;
    }

    onGenerating(true);
    
    const request: GeneratePromptRequest = {
      description: description.trim(),
      personality: personality.trim() || undefined,
      domain: domain.trim() || undefined,
      specialInstructions: specialInstructions.trim() || undefined,
      isPublic: isPublic
    };

    socketService.generatePrompt(request);
  };

  const handleRegenerate = () => {
    if (!digitalHuman) return;
    
    onGenerating(true);
    
    const request: GeneratePromptRequest = {
      description: `Regenerate and improve this digital human: ${digitalHuman.name}`,
      personality: personality.trim() || digitalHuman.personality,
      domain: domain.trim() || undefined,
      specialInstructions: specialInstructions.trim() || undefined
    };

    socketService.generatePrompt(request);
  };

  const handleSaveChanges = () => {
    if (localHuman && hasChanges) {
      socketService.updateDigitalHuman(localHuman);
      onDigitalHumanChange(localHuman);
      setHasChanges(false);
    }
  };

  const updateLocalHuman = (updates: Partial<DigitalHuman>) => {
    if (localHuman) {
      const updated = { ...localHuman, ...updates };
      setLocalHuman(updated);
      setHasChanges(true);
    }
  };

  const addRule = () => {
    if (localHuman) {
      const newRule = 'New rule';
      updateLocalHuman({
        rules: [...localHuman.rules, newRule]
      });
    }
  };

  const updateRule = (index: number, value: string) => {
    if (localHuman) {
      const newRules = [...localHuman.rules];
      newRules[index] = value;
      updateLocalHuman({ rules: newRules });
    }
  };

  const removeRule = (index: number) => {
    if (localHuman) {
      const newRules = localHuman.rules.filter((_, i) => i !== index);
      updateLocalHuman({ rules: newRules });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Digital Human Studio
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Saved Digital Humans */}
        {savedDigitalHumans.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Digital Humans ({savedDigitalHumans.length})
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedDigitalHumans.map((savedHuman) => (
                <div
                  key={savedHuman.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    digitalHuman?.id === savedHuman.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onDigitalHumanSelect(savedHuman)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{savedHuman.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{savedHuman.personality}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(savedHuman.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDigitalHumanDelete(savedHuman.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete digital human"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generation Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Create New Digital Human
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the digital human you want to create (e.g., 'A friendly customer service representative for a tech company')"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personality
              </label>
              <input
                type="text"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="e.g., Professional, Friendly, Witty"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain Expertise
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., Technology, Healthcare, Education"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any specific behaviors, constraints, or capabilities you want to emphasize"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded ${isPublic ? 'bg-green-500' : 'bg-gray-400'} flex items-center justify-center`}>
                  {isPublic ? (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {isPublic ? 'Others can discover and use this digital human' : 'Only you can access this digital human'}
              </span>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate
                </>
              )}
            </button>
            
            {digitalHuman && (
              <button
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Current Digital Human Editor */}
        {localHuman && (
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-5 w-5" />
                Current Digital Human
              </h3>
              {hasChanges && (
                <button
                  onClick={handleSaveChanges}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={localHuman.name}
                onChange={(e) => updateLocalHuman({ name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personality
              </label>
              <input
                type="text"
                value={localHuman.personality}
                onChange={(e) => updateLocalHuman({ personality: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={localHuman.prompt}
                onChange={(e) => updateLocalHuman({ prompt: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={6}
              />
            </div>

            {/* Rules Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rules & Guidelines
                </label>
                <button
                  onClick={addRule}
                  className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Rule
                </button>
              </div>
              <div className="space-y-2">
                {localHuman.rules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => updateRule(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={() => removeRule(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <Settings className="h-4 w-4" />
                Advanced Settings
                <span className="ml-1">{showAdvanced ? '▼' : '▶'}</span>
              </button>
              
              {showAdvanced && (
                <div className="mt-3 space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature: {localHuman.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={localHuman.temperature}
                      onChange={(e) => updateLocalHuman({ temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="4000"
                      value={localHuman.maxTokens}
                      onChange={(e) => updateLocalHuman({ maxTokens: parseInt(e.target.value) || 1000 })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
