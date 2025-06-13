'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  ThirdPartyIntegrationService, 
  IntegrationProvider, 
  IntegrationConfig,
  SyncResult 
} from '@/lib/services/third-party-integrations'
import { 
  Plug, 
  Download, 
  Upload, 
  Share2, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Zap,
  Clock,
  TrendingUp,
  Users,
  Database,
  Globe
} from 'lucide-react'

interface IntegrationsDialogProps {
  trigger?: React.ReactNode
}

const categoryIcons = {
  bookmark: Database,
  productivity: Zap,
  storage: Upload,
  social: Users
}

const categoryColors = {
  bookmark: 'bg-blue-100 text-blue-800 border-blue-200',
  productivity: 'bg-green-100 text-green-800 border-green-200',
  storage: 'bg-purple-100 text-purple-800 border-purple-200',
  social: 'bg-orange-100 text-orange-800 border-orange-200'
}

export function IntegrationsDialog({ trigger }: IntegrationsDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  const [providers, setProviders] = useState<IntegrationProvider[]>([])
  const [connectedIntegrations, setConnectedIntegrations] = useState<IntegrationConfig[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const allProviders = ThirdPartyIntegrationService.getSupportedProviders()
      setProviders(allProviders)

      const integrationStats = await ThirdPartyIntegrationService.getIntegrationStats('current-user')
      setStats(integrationStats)

      // Mock connected integrations
      setConnectedIntegrations([
        {
          providerId: 'pocket',
          userId: 'current-user',
          credentials: { token: 'mock-token' },
          settings: { autoSync: true },
          isActive: true,
          lastSync: new Date(),
          syncFrequency: 'daily'
        },
        {
          providerId: 'notion',
          userId: 'current-user',
          credentials: { token: 'mock-token' },
          settings: { databaseId: 'mock-db' },
          isActive: true,
          lastSync: new Date(Date.now() - 86400000),
          syncFrequency: 'weekly'
        }
      ])
    } catch (error) {
      console.error('Error loading integration data:', error)
      toast({
        title: "Loading Failed",
        description: "Unable to load integration data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (provider: IntegrationProvider) => {
    setIsLoading(true)
    try {
      if (provider.authType === 'oauth') {
        const { authUrl } = await ThirdPartyIntegrationService.initiateOAuth(
          provider.id,
          'current-user'
        )
        window.open(authUrl, '_blank', 'width=600,height=600')
        
        toast({
          title: "OAuth Started",
          description: `Opening ${provider.name} authorization window...`,
        })
      } else if (provider.authType === 'api_key') {
        setSelectedProvider(provider)
      } else if (provider.authType === 'webhook') {
        const webhookUrl = `${window.location.origin}/api/integrations/webhook/${provider.id}`
        const { success, webhookId } = await ThirdPartyIntegrationService.setupWebhook(
          provider.id,
          'current-user',
          webhookUrl,
          ['bookmark.created', 'bookmark.updated']
        )

        if (success) {
          toast({
            title: "Webhook Setup",
            description: `Webhook configured for ${provider.name}. ID: ${webhookId}`,
          })
        }
      }
    } catch (error) {
      console.error('Error connecting to provider:', error)
      toast({
        title: "Connection Failed",
        description: `Unable to connect to ${provider.name}. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async (providerId: string, action: 'import' | 'export') => {
    setIsLoading(true)
    try {
      const config = connectedIntegrations.find(c => c.providerId === providerId)
      if (!config) {
        throw new Error('Integration not found')
      }

      let result: SyncResult
      if (action === 'import') {
        result = await ThirdPartyIntegrationService.importBookmarks(
          providerId,
          'current-user',
          config
        )
      } else {
        // Mock bookmarks for export
        const mockBookmarks = [
          { id: '1', title: 'Test Bookmark', url: 'https://example.com', tags: [{ name: 'test' }] }
        ]
        result = await ThirdPartyIntegrationService.exportBookmarks(
          providerId,
          'current-user',
          mockBookmarks,
          config
        )
      }

      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `${action === 'import' ? 'Imported' : 'Exported'} ${
            action === 'import' ? result.itemsImported : result.itemsExported
          } items.`,
        })
      } else {
        throw new Error(result.errors.join(', '))
      }
    } catch (error) {
      console.error('Error syncing:', error)
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async (providerId: string) => {
    setIsLoading(true)
    try {
      const config = connectedIntegrations.find(c => c.providerId === providerId)
      if (!config) {
        throw new Error('Integration not found')
      }

      const { success, message } = await ThirdPartyIntegrationService.testConnection(
        providerId,
        config
      )

      toast({
        title: success ? "Connection Test Passed" : "Connection Test Failed",
        description: message,
        variant: success ? "default" : "destructive"
      })
    } catch (error) {
      console.error('Error testing connection:', error)
      toast({
        title: "Test Failed",
        description: "Unable to test connection. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isConnected = (providerId: string) => {
    return connectedIntegrations.some(c => c.providerId === providerId && c.isActive)
  }

  const getProvidersByCategory = (category: IntegrationProvider['category']) => {
    return providers.filter(p => p.category === category)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Plug className="h-4 w-4" />
            Integrations
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Third-Party Integrations
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[60vh] mt-4">
            <TabsContent value="browse" className="space-y-6">
              {/* Bookmark Services */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Bookmark Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getProvidersByCategory('bookmark').map((provider) => (
                    <Card key={provider.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{provider.icon}</span>
                            <div>
                              <CardTitle className="text-sm">{provider.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {provider.description}
                              </CardDescription>
                            </div>
                          </div>
                          {isConnected(provider.id) && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {provider.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant={isConnected(provider.id) ? "outline" : "default"}
                          onClick={() => handleConnect(provider)}
                          disabled={isLoading || isConnected(provider.id)}
                          className="w-full"
                        >
                          {isConnected(provider.id) ? 'Connected' : 'Connect'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Productivity Services */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Productivity Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getProvidersByCategory('productivity').map((provider) => (
                    <Card key={provider.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{provider.icon}</span>
                            <div>
                              <CardTitle className="text-sm">{provider.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {provider.description}
                              </CardDescription>
                            </div>
                          </div>
                          {isConnected(provider.id) && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {provider.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant={isConnected(provider.id) ? "outline" : "default"}
                          onClick={() => handleConnect(provider)}
                          disabled={isLoading || isConnected(provider.id)}
                          className="w-full"
                        >
                          {isConnected(provider.id) ? 'Connected' : 'Connect'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Social Services */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Social Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getProvidersByCategory('social').map((provider) => (
                    <Card key={provider.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{provider.icon}</span>
                            <div>
                              <CardTitle className="text-sm">{provider.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {provider.description}
                              </CardDescription>
                            </div>
                          </div>
                          {isConnected(provider.id) && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {provider.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant={isConnected(provider.id) ? "outline" : "default"}
                          onClick={() => handleConnect(provider)}
                          disabled={isLoading || isConnected(provider.id)}
                          className="w-full"
                        >
                          {isConnected(provider.id) ? 'Connected' : 'Connect'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="connected" className="space-y-4">
              {connectedIntegrations.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No Connected Integrations</h3>
                  <p className="text-gray-500 mb-4">Connect to third-party services to get started.</p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse Integrations
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedIntegrations.map((integration) => {
                    const provider = providers.find(p => p.id === integration.providerId)
                    if (!provider) return null

                    return (
                      <Card key={integration.providerId}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{provider.icon}</span>
                              <div>
                                <CardTitle className="text-sm">{provider.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  Last sync: {integration.lastSync?.toLocaleDateString() || 'Never'}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={integration.isActive ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {integration.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Switch 
                                checked={integration.isActive}
                                onCheckedChange={(checked) => {
                                  // Update integration status
                                  setConnectedIntegrations(prev => 
                                    prev.map(int => 
                                      int.providerId === integration.providerId 
                                        ? { ...int, isActive: checked }
                                        : int
                                    )
                                  )
                                }}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2 mb-4">
                            {provider.features.includes('import') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSync(integration.providerId, 'import')}
                                disabled={isLoading || !integration.isActive}
                                className="gap-2"
                              >
                                <Download className="h-3 w-3" />
                                Import
                              </Button>
                            )}
                            {provider.features.includes('export') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSync(integration.providerId, 'export')}
                                disabled={isLoading || !integration.isActive}
                                className="gap-2"
                              >
                                <Upload className="h-3 w-3" />
                                Export
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestConnection(integration.providerId)}
                              disabled={isLoading}
                              className="gap-2"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Test
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500">
                            Sync frequency: {integration.syncFrequency}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              {stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
                        <div className="text-xs text-gray-500">Total Integrations</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{stats.activeIntegrations}</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.totalSyncs}</div>
                        <div className="text-xs text-gray-500">Total Syncs</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {stats.lastSyncTime ? new Date(stats.lastSyncTime).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-xs text-gray-500">Last Sync</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Provider Statistics</h3>
                    {stats.providerStats.map((providerStat: any) => (
                      <Card key={providerStat.providerId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{providerStat.name}</span>
                            <Badge variant={providerStat.isActive ? "default" : "secondary"}>
                              {providerStat.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Imported:</span>
                              <span className="ml-2 font-medium">{providerStat.itemsImported}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Exported:</span>
                              <span className="ml-2 font-medium">{providerStat.itemsExported}</span>
                            </div>
                          </div>
                          {providerStat.lastSync && (
                            <div className="text-xs text-gray-500 mt-2">
                              Last sync: {new Date(providerStat.lastSync).toLocaleString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 