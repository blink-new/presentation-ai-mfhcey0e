import { useState, useEffect, useCallback } from 'react'
import { blink } from './lib/blink'
import { Dashboard } from './components/Dashboard'
import { PresentationEditor } from './components/PresentationEditor'
import { PresentationViewer } from './components/PresentationViewer'
import { Button } from './components/ui/button'
import { Loader2 } from 'lucide-react'

export interface Slide {
  id: string
  title: string
  content: string
  imageUrl?: string
  theme: string
  layout: 'title' | 'content' | 'image' | 'split'
}

export interface Presentation {
  id: string
  title: string
  slides: Slide[]
  theme: string
  createdAt: string
  updatedAt: string
}

type View = 'dashboard' | 'editor' | 'viewer'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null)
  const [presentations, setPresentations] = useState<Presentation[]>([])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const loadPresentations = useCallback(async () => {
    if (!user) return
    
    try {
      const data = await blink.db.presentations.list({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
      })
      setPresentations(data)
    } catch (error) {
      console.error('Failed to load presentations:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadPresentations()
    }
  }, [user, loadPresentations])



  const createPresentation = async (title: string, prompt: string) => {
    try {
      setLoading(true)
      
      // Generate slides using AI
      const { object: slideData } = await blink.ai.generateObject({
        prompt: `Create a presentation about "${title}" based on this prompt: "${prompt}". Generate 5-8 slides with titles and content.`,
        schema: {
          type: 'object',
          properties: {
            slides: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  layout: { type: 'string', enum: ['title', 'content', 'image', 'split'] }
                },
                required: ['title', 'content', 'layout']
              }
            }
          },
          required: ['slides']
        }
      })

      const slides: Slide[] = slideData.slides.map((slide: any, index: number) => ({
        id: `slide-${Date.now()}-${index}`,
        title: slide.title,
        content: slide.content,
        theme: 'modern',
        layout: slide.layout
      }))

      const presentation: Presentation = {
        id: `pres-${Date.now()}`,
        title,
        slides,
        theme: 'modern',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to database
      await blink.db.presentations.create({
        id: presentation.id,
        title: presentation.title,
        slides: JSON.stringify(presentation.slides),
        theme: presentation.theme,
        userId: user.id,
        createdAt: presentation.createdAt,
        updatedAt: presentation.updatedAt
      })

      setCurrentPresentation(presentation)
      setCurrentView('editor')
      await loadPresentations()
    } catch (error) {
      console.error('Failed to create presentation:', error)
    } finally {
      setLoading(false)
    }
  }

  const openPresentation = async (presentationId: string) => {
    try {
      const data = await blink.db.presentations.list({
        where: { id: presentationId, userId: user.id }
      })
      
      if (data.length > 0) {
        const presentation: Presentation = {
          ...data[0],
          slides: JSON.parse(data[0].slides)
        }
        setCurrentPresentation(presentation)
        setCurrentView('editor')
      }
    } catch (error) {
      console.error('Failed to open presentation:', error)
    }
  }

  const savePresentation = async (presentation: Presentation) => {
    try {
      await blink.db.presentations.update(presentation.id, {
        title: presentation.title,
        slides: JSON.stringify(presentation.slides),
        theme: presentation.theme,
        updatedAt: new Date().toISOString()
      })
      setCurrentPresentation(presentation)
      await loadPresentations()
    } catch (error) {
      console.error('Failed to save presentation:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading ALLWEONE AI...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">ALLWEONE AI</h1>
            <p className="text-xl text-muted-foreground">Presentation Generator</p>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Create beautiful presentations in minutes with AI-powered content and design generation.
            </p>
            <Button onClick={() => blink.auth.login()} size="lg" className="w-full">
              Sign In to Get Started
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'dashboard' && (
        <Dashboard
          presentations={presentations}
          onCreatePresentation={createPresentation}
          onOpenPresentation={openPresentation}
          loading={loading}
        />
      )}
      
      {currentView === 'editor' && currentPresentation && (
        <PresentationEditor
          presentation={currentPresentation}
          onSave={savePresentation}
          onBack={() => setCurrentView('dashboard')}
          onPresent={() => setCurrentView('viewer')}
        />
      )}
      
      {currentView === 'viewer' && currentPresentation && (
        <PresentationViewer
          presentation={currentPresentation}
          onBack={() => setCurrentView('editor')}
        />
      )}
    </div>
  )
}

export default App