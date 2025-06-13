'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  RotateCcw, 
  Languages, 
  Copy,
  CheckCircle,
  Loader2,
  ArrowRight,
  Globe
} from 'lucide-react'

interface TranslationResult {
  original: string
  translated: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
]

export default function BookmarkTranslator() {
  const [sourceText, setSourceText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('auto')
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)

  const translateText = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate')
      return
    }

    setIsTranslating(true)
    try {
      // Simulate translation API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockTranslation: TranslationResult = {
        original: sourceText,
        translated: `[Translated to ${languages.find(l => l.code === targetLanguage)?.name}] ${sourceText}`,
        sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
        targetLanguage,
        confidence: 0.95
      }
      
      setTranslationResult(mockTranslation)
      toast.success('Translation completed!')
    } catch (error) {
      toast.error('Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const swapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      setTargetLanguage(sourceLanguage)
      setSourceLanguage(targetLanguage)
      if (translationResult) {
        setSourceText(translationResult.translated)
        setTranslationResult(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
                     <h2 className="text-2xl font-bold flex items-center space-x-2">
             <RotateCcw className="h-6 w-6" />
             <span>Bookmark Translator</span>
           </h2>
          <p className="text-muted-foreground">
            Translate bookmark titles, descriptions, and content
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Translation Settings</span>
          </CardTitle>
          <CardDescription>
            Select source and target languages for translation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Source language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Auto-detect</span>
                    </div>
                  </SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <div className="flex items-center space-x-2">
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={swapLanguages}
                disabled={sourceLanguage === 'auto'}
                className="mb-2"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Target language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <div className="flex items-center space-x-2">
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Source Text */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Source Text</span>
              {sourceLanguage !== 'auto' && (
                <Badge variant="outline">
                  {languages.find(l => l.code === sourceLanguage)?.flag}{' '}
                  {languages.find(l => l.code === sourceLanguage)?.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter bookmark title, description, or content to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {sourceText.length} characters
              </span>
              <Button onClick={translateText} disabled={isTranslating || !sourceText.trim()}>
                {isTranslating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Translating...
                  </>
                                 ) : (
                   <>
                     <RotateCcw className="h-4 w-4 mr-2" />
                     Translate
                   </>
                 )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Translation Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Translation</span>
              {translationResult && (
                <Badge variant="outline">
                  {languages.find(l => l.code === targetLanguage)?.flag}{' '}
                  {languages.find(l => l.code === targetLanguage)?.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Translation will appear here..."
              value={translationResult?.translated || ''}
              readOnly
              rows={8}
              className="resize-none bg-gray-50"
            />
            <div className="flex items-center justify-between">
              {translationResult && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">
                    {Math.round((translationResult.confidence || 0) * 100)}% confidence
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => copyToClipboard(translationResult?.translated || '')}
                disabled={!translationResult}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Translation Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>
            Common bookmark content for quick translation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {[
              'React Documentation - Learn React',
              'JavaScript Tutorial for Beginners',
              'Best Practices for Web Development',
              'Machine Learning Resources',
              'Design System Guidelines',
              'API Documentation and Examples'
            ].map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setSourceText(template)}
                className="justify-start text-left h-auto p-3"
              >
                {template}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 