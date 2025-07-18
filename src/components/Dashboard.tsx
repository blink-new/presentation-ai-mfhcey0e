import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'
import { Plus, Presentation, Calendar, Sparkles, FileText, Image, BarChart3 } from 'lucide-react'
import { Presentation as PresentationType } from '../App'

interface DashboardProps {
  presentations: PresentationType[]
  onCreatePresentation: (title: string, prompt: string) => void
  onOpenPresentation: (id: string) => void
  loading: boolean
}

const templates = [
  {
    id: 'business',
    title: 'Business Pitch',
    description: 'Professional presentation for business proposals',
    icon: BarChart3,
    prompt: 'Create a business pitch presentation with market analysis, solution overview, business model, and financial projections'
  },
  {
    id: 'product',
    title: 'Product Launch',
    description: 'Showcase your new product or feature',
    icon: Sparkles,
    prompt: 'Create a product launch presentation with problem statement, solution features, benefits, and go-to-market strategy'
  },
  {
    id: 'report',
    title: 'Project Report',
    description: 'Present project results and insights',
    icon: FileText,
    prompt: 'Create a project report presentation with objectives, methodology, key findings, and recommendations'
  },
  {
    id: 'marketing',
    title: 'Marketing Campaign',
    description: 'Present marketing strategies and campaigns',
    icon: Image,
    prompt: 'Create a marketing campaign presentation with target audience, strategy, creative concepts, and success metrics'
  }
]

export function Dashboard({ presentations, onCreatePresentation, onOpenPresentation, loading }: DashboardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!title.trim() || !prompt.trim()) return
    
    setIsCreating(true)
    try {
      await onCreatePresentation(title, prompt)
      setIsCreateOpen(false)
      setTitle('')
      setPrompt('')
    } finally {
      setIsCreating(false)
    }
  }

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setTitle(template.title)
    setPrompt(template.prompt)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">ALLWEONE AI</h1>
              <p className="text-sm text-muted-foreground">Presentation Generator</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Presentation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Presentation</DialogTitle>
                  <DialogDescription>
                    Use AI to generate a beautiful presentation in minutes
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Presentation Title</label>
                    <Input
                      placeholder="e.g., Q4 Business Review"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">AI Prompt</label>
                    <Textarea
                      placeholder="Describe what you want your presentation to cover..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Quick Templates</label>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((template) => {
                        const Icon = template.icon
                        return (
                          <Card
                            key={template.id}
                            className="cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Icon className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-sm">{template.title}</h4>
                                  <p className="text-xs text-muted-foreground">{template.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreate} 
                      disabled={!title.trim() || !prompt.trim() || isCreating}
                      className="gap-2"
                    >
                      {isCreating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {presentations.length === 0 ? (
          <div className="text-center py-16">
            <Presentation className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No presentations yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first AI-powered presentation and start impressing your audience
            </p>
            <Button size="lg" onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Presentation
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Presentations</h2>
              <Badge variant="secondary">{presentations.length} presentations</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presentations.map((presentation) => (
                <Card
                  key={presentation.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => onOpenPresentation(presentation.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{presentation.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(presentation.updatedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{Array.isArray(presentation.slides) ? presentation.slides.length : 0} slides</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Theme: {presentation.theme}
                      </div>
                      <div className="flex gap-1">
                        {Array.isArray(presentation.slides) && presentation.slides.slice(0, 4).map((_, index) => (
                          <div
                            key={index}
                            className="w-8 h-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded border"
                          />
                        ))}
                        {Array.isArray(presentation.slides) && presentation.slides.length > 4 && (
                          <div className="w-8 h-6 bg-muted rounded border flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{presentation.slides.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}