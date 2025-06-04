'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Save, 
  Download, 
  Share2, 
  Copy, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Link, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Type, 
  Heading1, 
  Heading2, 
  Heading3
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface DocumentEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave?: (content: string, title: string) => void;
  onClose?: () => void;
}

interface EditorState {
  title: string;
  content: string;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  isDarkMode: boolean;
  wordCount: number;
  characterCount: number;
  isModified: boolean;
}

// Document formatting utilities
const formatters = {
  bold: (text: string) => `**${text}**`,
  italic: (text: string) => `*${text}*`,
  underline: (text: string) => `<u>${text}</u>`,
  strikethrough: (text: string) => `~~${text}~~`,
  heading1: (text: string) => `# ${text}`,
  heading2: (text: string) => `## ${text}`,
  heading3: (text: string) => `### ${text}`,
  link: (text: string, url: string) => `[${text}](${url})`,
};

// Word processing functions
const processText = (text: string) => {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const characters = text.length;
  return { wordCount: words.length, characterCount: characters };
};

export function DocumentEditor({ 
  initialContent = '', 
  initialTitle = 'Untitled Document',
  onSave,
  onClose 
}: DocumentEditorProps) {
  const [editorState, setEditorState] = useState<EditorState>({
    title: initialTitle,
    content: initialContent,
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'left',
    isDarkMode: false,
    wordCount: 0,
    characterCount: 0,
    isModified: false
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && editorState.isModified && onSave) {
      const timeoutId = setTimeout(() => {
        onSave(editorState.content, editorState.title);
        setEditorState(prev => ({ ...prev, isModified: false }));
        toast.success('Document auto-saved');
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [editorState.content, editorState.title, editorState.isModified, autoSaveEnabled, onSave]);

  // Update word and character count when content changes
  useEffect(() => {
    const { wordCount, characterCount } = processText(editorState.content);
    setEditorState(prev => ({ 
      ...prev, 
      wordCount, 
      characterCount,
      isModified: true
    }));
  }, [editorState.content]);

  const updateContent = useCallback((newContent: string) => {
    setEditorState(prev => ({ ...prev, content: newContent }));
  }, []);

  const updateTitle = useCallback((newTitle: string) => {
    setEditorState(prev => ({ ...prev, title: newTitle }));
  }, []);

  const handleTextSelection = useCallback(() => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = editorState.content.substring(start, end);
      setSelectedText(selected);
    }
  }, [editorState.content]);



  const applyFormatting = useCallback((type: keyof typeof formatters, url?: string) => {
    if (selectedText) {
      let formattedText: string;
      
      if (type === 'link' && url) {
        formattedText = formatters[type](selectedText, url);
      } else if (type !== 'link') {
        formattedText = formatters[type](selectedText);
      } else {
        return; // Don't apply link formatting without URL
      }
      
      const start = textareaRef.current?.selectionStart || 0;
      const end = textareaRef.current?.selectionEnd || 0;
      const beforeSelection = editorState.content.substring(0, start);
      const afterSelection = editorState.content.substring(end);
      const newContent = beforeSelection + formattedText + afterSelection;
      
      updateContent(newContent);
      toast.success(`Applied ${type} formatting`);
    } else {
      toast.error('Please select text first');
    }
  }, [selectedText, editorState.content, updateContent]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(editorState.content, editorState.title);
      setEditorState(prev => ({ ...prev, isModified: false }));
      toast.success('Document saved successfully');
    }
  }, [editorState.content, editorState.title, onSave]);

  const handleDownload = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([editorState.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${editorState.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Document downloaded');
  }, [editorState.content, editorState.title]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editorState.content);
    toast.success('Content copied to clipboard');
  }, [editorState.content]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: editorState.title,
        text: editorState.content,
      });
    } else {
      handleCopy();
    }
  }, [editorState.title, editorState.content, handleCopy]);

  return (
    <div className={`flex flex-col h-screen ${editorState.isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <Input
            value={editorState.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-lg font-semibold border-none bg-transparent"
            placeholder="Document title..."
          />
          {editorState.isModified && (
            <Badge variant="secondary">Unsaved</Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <Trash2 className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <Tabs defaultValue="formatting" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="formatting">Format</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formatting" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">TEXT FORMATTING</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => applyFormatting('bold')}>
                    <Bold className="h-4 w-4 mr-1" />
                    Bold
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyFormatting('italic')}>
                    <Italic className="h-4 w-4 mr-1" />
                    Italic
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyFormatting('underline')}>
                    <Underline className="h-4 w-4 mr-1" />
                    Underline
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyFormatting('strikethrough')}>
                    <Strikethrough className="h-4 w-4 mr-1" />
                    Strike
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">HEADINGS</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => applyFormatting('heading1')}>
                    <Heading1 className="h-4 w-4 mr-2" />
                    Heading 1
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => applyFormatting('heading2')}>
                    <Heading2 className="h-4 w-4 mr-2" />
                    Heading 2
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => applyFormatting('heading3')}>
                    <Heading3 className="h-4 w-4 mr-2" />
                    Heading 3
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">ALIGNMENT</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={editorState.textAlign === 'left' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setEditorState(prev => ({ ...prev, textAlign: 'left' }))}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={editorState.textAlign === 'center' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setEditorState(prev => ({ ...prev, textAlign: 'center' }))}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={editorState.textAlign === 'right' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setEditorState(prev => ({ ...prev, textAlign: 'right' }))}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Font Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Font Family</label>
                    <Select value={editorState.fontFamily} onValueChange={(value) => setEditorState(prev => ({ ...prev, fontFamily: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Font Size: {editorState.fontSize}px</label>
                    <Slider
                      value={[editorState.fontSize]}
                      onValueChange={([value]) => setEditorState(prev => ({ ...prev, fontSize: value }))}
                      min={12}
                      max={24}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Dark Mode</label>
                  <Switch
                    checked={editorState.isDarkMode}
                    onCheckedChange={(checked) => setEditorState(prev => ({ ...prev, isDarkMode: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto Save</label>
                  <Switch
                    checked={autoSaveEnabled}
                    onCheckedChange={setAutoSaveEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Fullscreen</label>
                  <Switch
                    checked={isFullscreen}
                    onCheckedChange={setIsFullscreen}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Words</span>
                      <span className="font-semibold">{editorState.wordCount}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Characters</span>
                      <span className="font-semibold">{editorState.characterCount}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Reading Time</span>
                      <span className="font-semibold">{Math.ceil(editorState.wordCount / 200)} min</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Quick Actions</h3>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Insert Image
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Link className="h-4 w-4 mr-2" />
                  Insert Link
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-1">
              <Type className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedText ? `Selected: "${selectedText.substring(0, 20)}${selectedText.length > 20 ? '...' : ''}"` : 'Select text to format'}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <ScrollArea className="h-full">
                <Textarea
                  ref={textareaRef}
                  value={editorState.content}
                  onChange={(e) => updateContent(e.target.value)}
                  onSelect={handleTextSelection}
                  placeholder="Start writing your document..."
                  className="min-h-[600px] border-none resize-none focus:ring-0 text-lg leading-relaxed"
                  style={{
                    fontSize: `${editorState.fontSize}px`,
                    fontFamily: editorState.fontFamily,
                    textAlign: editorState.textAlign,
                  }}
                />
              </ScrollArea>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>{editorState.wordCount} words</span>
              <span>{editorState.characterCount} characters</span>
              <span>Reading time: ~{Math.ceil(editorState.wordCount / 200)} min</span>
            </div>
            <div className="flex items-center space-x-4">
              {autoSaveEnabled && editorState.isModified && (
                <span className="text-blue-600 dark:text-blue-400">Auto-saving...</span>
              )}
              <span>Last saved: just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedText && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Selected text:</span>
            <Badge variant="secondary">{selectedText.length} chars</Badge>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-4 left-4 md:hidden">
        <Button
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="rounded-full h-12 w-12"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      {/* Sample Document Preview */}
      <div className="hidden">
        <div className="max-w-2xl mx-auto p-8 bg-white">
          <h1 className="text-3xl font-bold mb-6">Sample Document</h1>
          <p className="text-gray-600 mb-4">
            This is a sample document to demonstrate the document editor capabilities.
          </p>
          <Image 
            src="/api/placeholder/400/200" 
            alt="Sample document image"
            width={400}
            height={200}
            className="mb-4 rounded-lg" 
          />
          <p className="mb-4">
            The editor supports various formatting options including <strong>bold text</strong>, 
            <em>italic text</em>, and <u>underlined text</u>.
          </p>
          <h2 className="text-xl font-semibold mb-3">Features</h2>
          <ul className="list-disc list-inside mb-4">
            <li>Real-time word and character counting</li>
            <li>Auto-save functionality</li>
            <li>Multiple export formats</li>
            <li>Dark mode support</li>
          </ul>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
            &ldquo;The best documents are those that communicate clearly and effectively.&rdquo;
          </blockquote>
        </div>
      </div>
    </div>
  );
} 