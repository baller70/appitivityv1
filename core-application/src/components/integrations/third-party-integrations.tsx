'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Globe, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Github, 
  Chrome,
  Smartphone,
  Cloud,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  category: 'social' | 'productivity' | 'browser' | 'cloud'
  features: string[]
}

const integrations: Integration[] = [
  {
    id: 'pocket',
    name: 'Pocket',
    description: 'Sync bookmarks with your Pocket account',
    icon: <Globe className="h-6 w-6" />,
    connected: false,
    category: 'productivity',
    features: ['Import bookmarks', 'Auto-sync', 'Offline reading']
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Share bookmarks and import saved tweets',
    icon: <Twitter className="h-6 w-6" />,
    connected: false,
    category: 'social',
    features: ['Share bookmarks', 'Import saved tweets', 'Auto-posting']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Share professional bookmarks',
    icon: <Linkedin className="h-6 w-6" />,
    connected: false,
    category: 'social',
    features: ['Professional sharing', 'Network recommendations']
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync starred repositories',
    icon: <Github className="h-6 w-6" />,
    connected: false,
    category: 'productivity',
    features: ['Import stars', 'Repository tracking', 'Code bookmarks']
  },
  {
    id: 'chrome',
    name: 'Chrome Extension',
    description: 'Browser extension for quick bookmarking',
    icon: <Chrome className="h-6 w-6" />,
    connected: true,
    category: 'browser',
    features: ['Quick save', 'Context menu', 'Tab management']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate bookmark workflows',
    icon: <Zap className="h-6 w-6" />,
    connected: false,
    category: 'productivity',
    features: ['Workflow automation', '1000+ app connections']
  }
]

export default function ThirdPartyIntegrations() {
  const [integrationStates, setIntegrationStates] = useState<Record<string, boolean>>(
    integrations.reduce((acc, integration) => ({
      ...acc,
      [integration.id]: integration.connected
    }), {})
  )

  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIntegrationStates(prev => ({
        ...prev,
        [integrationId]: enabled
      }))

      const integration = integrations.find(i => i.id === integrationId)
      toast.success(
        enabled 
          ? `Connected to ${integration?.name}` 
          : `Disconnected from ${integration?.name}`
      )
    } catch (error) {
      toast.error('Failed to update integration')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return 'bg-blue-100 text-blue-800'
      case 'productivity': return 'bg-green-100 text-green-800'
      case 'browser': return 'bg-purple-100 text-purple-800'
      case 'cloud': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const connectedCount = Object.values(integrationStates).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Third-Party Integrations</h2>
          <p className="text-muted-foreground">
            Connect your bookmark app with external services
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {connectedCount} of {integrations.length} connected
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {integration.icon}
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(integration.category)}`}
                    >
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                {integrationStates[integration.id] ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>{integration.description}</CardDescription>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {integration.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 bg-current rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium">
                  {integrationStates[integration.id] ? 'Connected' : 'Disconnected'}
                </span>
                <Switch
                  checked={integrationStates[integration.id]}
                  onCheckedChange={(checked) => 
                    handleToggleIntegration(integration.id, checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>API Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure API keys and authentication for third-party services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pocket Consumer Key</label>
              <input 
                type="password" 
                placeholder="Enter your Pocket API key"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Twitter API Key</label>
              <input 
                type="password" 
                placeholder="Enter your Twitter API key"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub Token</label>
              <input 
                type="password" 
                placeholder="Enter your GitHub personal access token"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Zapier Webhook URL</label>
              <input 
                type="url" 
                placeholder="Enter your Zapier webhook URL"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <Button className="w-full md:w-auto">
            Save API Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 