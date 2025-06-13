'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  Globe, 
  Languages, 
  Settings,
  CheckCircle,
  Loader2,
  Download,
  Upload
} from 'lucide-react'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  rtl?: boolean
}

const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
]

interface TranslationSettings {
  autoTranslate: boolean
  translateTitles: boolean
  translateDescriptions: boolean
  translateTags: boolean
  preferredLanguages: string[]
}

export default function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [translationSettings, setTranslationSettings] = useState<TranslationSettings>({
    autoTranslate: false,
    translateTitles: true,
    translateDescriptions: true,
    translateTags: false,
    preferredLanguages: ['en', 'es', 'fr']
  })
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationProgress, setTranslationProgress] = useState(0)

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
    const language = supportedLanguages.find(lang => lang.code === languageCode)
    
    // Apply RTL if needed
    if (language?.rtl) {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
    
    toast.success(`Language changed to ${language?.name}`)
  }

  const handleSettingChange = (setting: keyof TranslationSettings, value: boolean | string[]) => {
    setTranslationSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const translateAllBookmarks = async () => {
    setIsTranslating(true)
    setTranslationProgress(0)
    
    try {
      // Simulate translation progress
      for (let i = 0; i <= 100; i += 10) {
        setTranslationProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      toast.success('All bookmarks translated successfully!')
    } catch (error) {
      toast.error('Translation failed')
    } finally {
      setIsTranslating(false)
      setTranslationProgress(0)
    }
  }

  const exportTranslations = () => {
    // Simulate export
    toast.success('Translation file exported!')
  }

  const importTranslations = () => {
    // Simulate import
    toast.success('Translation file imported!')
  }

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Globe className="h-6 w-6" />
            <span>Multilingual Settings</span>
          </h2>
          <p className="text-muted-foreground">
            Configure language preferences and translation settings
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center space-x-2">
          <span>{currentLang?.flag}</span>
          <span>{currentLang?.nativeName}</span>
        </Badge>
      </div>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Interface Language</span>
          </CardTitle>
          <CardDescription>
            Select your preferred language for the application interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.flag}</span>
                    <div>
                      <div className="font-medium">{language.name}</div>
                      <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Translation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Translation Settings</span>
          </CardTitle>
          <CardDescription>
            Configure automatic translation for bookmark content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto-translate new bookmarks</label>
                <p className="text-sm text-muted-foreground">
                  Automatically translate bookmark content when added
                </p>
              </div>
              <Switch
                checked={translationSettings.autoTranslate}
                onCheckedChange={(checked) => handleSettingChange('autoTranslate', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Translate titles</label>
                <p className="text-sm text-muted-foreground">
                  Include bookmark titles in translation
                </p>
              </div>
              <Switch
                checked={translationSettings.translateTitles}
                onCheckedChange={(checked) => handleSettingChange('translateTitles', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Translate descriptions</label>
                <p className="text-sm text-muted-foreground">
                  Include bookmark descriptions in translation
                </p>
              </div>
              <Switch
                checked={translationSettings.translateDescriptions}
                onCheckedChange={(checked) => handleSettingChange('translateDescriptions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Translate tags</label>
                <p className="text-sm text-muted-foreground">
                  Include bookmark tags in translation
                </p>
              </div>
              <Switch
                checked={translationSettings.translateTags}
                onCheckedChange={(checked) => handleSettingChange('translateTags', checked)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="font-medium mb-3 block">Preferred Languages</label>
            <p className="text-sm text-muted-foreground mb-3">
              Select languages to prioritize for translation
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {supportedLanguages.map((language) => (
                <div
                  key={language.code}
                  className={`p-2 border rounded-lg cursor-pointer transition-all ${
                    translationSettings.preferredLanguages.includes(language.code)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    const newPreferred = translationSettings.preferredLanguages.includes(language.code)
                      ? translationSettings.preferredLanguages.filter(code => code !== language.code)
                      : [...translationSettings.preferredLanguages, language.code]
                    handleSettingChange('preferredLanguages', newPreferred)
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{language.flag}</span>
                    <span className="text-sm font-medium">{language.name}</span>
                    {translationSettings.preferredLanguages.includes(language.code) && (
                      <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Translation Actions</span>
          </CardTitle>
          <CardDescription>
            Manage translations for existing bookmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={translateAllBookmarks}
              disabled={isTranslating}
              className="flex-1 min-w-48"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating... {translationProgress}%
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Translate All Bookmarks
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={exportTranslations}>
              <Download className="h-4 w-4 mr-2" />
              Export Translations
            </Button>
            
            <Button variant="outline" onClick={importTranslations}>
              <Upload className="h-4 w-4 mr-2" />
              Import Translations
            </Button>
          </div>

          {isTranslating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Translation Progress</span>
                <span>{translationProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${translationProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Statistics</CardTitle>
          <CardDescription>
            Overview of translated content in your bookmark collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-muted-foreground">Total Bookmarks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">89</div>
              <div className="text-sm text-muted-foreground">Translated</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">67</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 