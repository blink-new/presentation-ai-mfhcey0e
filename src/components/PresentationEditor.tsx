import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { 
  ArrowLeft, 
  Play, 
  Save, 
  Plus, 
  Trash2, 
  Image, 
  Type, 
  Layout,
  Sparkles,
  Copy,
  MoveUp,
  MoveDown
} from 'lucide-react'
import { Presentation, Slide } from '../App'
import { blink } from '../lib/blink'

interface PresentationEditorProps {
  presentation: Presentation
  onSave: (presentation: Presentation) => void
  onBack: () => void
  onPresent: () => void
}

const themes = [
  { id: 'modern', name: 'Modern', colors: 'from-blue-500 to-purple-600' },
  { id: 'minimal', name: 'Minimal', colors: 'from-gray-400 to-gray-600' },
  { id: 'vibrant', name: 'Vibrant', colors: 'from-pink-500 to-orange-500' },
  { id: 'professional', name: 'Professional', colors: 'from-indigo-600 to-blue-800' },
  { id: 'nature', name: 'Nature', colors: 'from-green-500 to-teal-600' }
]

const layouts = [
  { id: 'title', name: 'Title', icon: Type },
  { id: 'content', name: 'Content', icon: Layout },
  { id: 'image', name: 'Image', icon: Image },
  { id: 'split', name: 'Split', icon: Layout }
]

export function PresentationEditor({ presentation, onSave, onBack, onPresent }: PresentationEditorProps) {
  const [currentPresentation, setCurrentPresentation] = useState<Presentation>(presentation)
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setCurrentPresentation(presentation)
  }, [presentation])

  const selectedSlide = currentPresentation.slides[selectedSlideIndex]

  const updateSlide = (updates: Partial<Slide>) => {
    const updatedSlides = currentPresentation.slides.map((slide, index) =>
      index === selectedSlideIndex ? { ...slide, ...updates } : slide
    )
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides })
  }

  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: 'New Slide',
      content: 'Add your content here...',
      theme: currentPresentation.theme,
      layout: 'content'
    }
    const updatedSlides = [...currentPresentation.slides, newSlide]
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides })
    setSelectedSlideIndex(updatedSlides.length - 1)
  }

  const duplicateSlide = () => {
    const slideToClone = currentPresentation.slides[selectedSlideIndex]
    const newSlide: Slide = {
      ...slideToClone,
      id: `slide-${Date.now()}`,
      title: `${slideToClone.title} (Copy)`
    }
    const updatedSlides = [
      ...currentPresentation.slides.slice(0, selectedSlideIndex + 1),
      newSlide,
      ...currentPresentation.slides.slice(selectedSlideIndex + 1)
    ]
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides })
    setSelectedSlideIndex(selectedSlideIndex + 1)
  }

  const deleteSlide = () => {
    if (currentPresentation.slides.length <= 1) return
    
    const updatedSlides = currentPresentation.slides.filter((_, index) => index !== selectedSlideIndex)
    setCurrentPresentation({ ...currentPresentation, slides: updatedSlides })
    setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1))
  }

  const moveSlide = (direction: 'up' | 'down') => {
    const slides = [...currentPresentation.slides]
    const currentIndex = selectedSlideIndex
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex < 0 || newIndex >= slides.length) return
    
    [slides[currentIndex], slides[newIndex]] = [slides[newIndex], slides[currentIndex]]
    setCurrentPresentation({ ...currentPresentation, slides })
    setSelectedSlideIndex(newIndex)
  }

  const generateImage = async () => {
    if (!selectedSlide.title && !selectedSlide.content) return
    
    setIsGeneratingImage(true)
    try {
      const prompt = `Create a professional presentation image for: ${selectedSlide.title}. ${selectedSlide.content.substring(0, 100)}`
      const { data } = await blink.ai.generateImage({
        prompt,
        size: '1024x1024',
        quality: 'high'
      })
      
      if (data[0]?.url) {
        updateSlide({ imageUrl: data[0].url })
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(currentPresentation)
    } finally {
      setIsSaving(false)
    }
  }

  const getSlidePreview = (slide: Slide, theme: string) => {
    const themeColors = themes.find(t => t.id === theme)?.colors || 'from-gray-400 to-gray-600'
    
    return (
      <div className={`w-full h-full bg-gradient-to-br ${themeColors} p-3 text-white rounded`}>
        <div className="space-y-2">
          <div className="text-xs font-semibold line-clamp-1">{slide.title}</div>
          <div className="text-[10px] opacity-80 line-clamp-3">{slide.content}</div>
          {slide.imageUrl && (
            <div className="w-full h-4 bg-white/20 rounded"></div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <Input
                value={currentPresentation.title}
                onChange={(e) => setCurrentPresentation({ ...currentPresentation, title: e.target.value })}
                className="text-lg font-semibold border-none p-0 h-auto bg-transparent"
              />
              <p className="text-sm text-muted-foreground">
                {currentPresentation.slides.length} slides
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={onPresent}>
              <Play className="h-4 w-4 mr-2" />
              Present
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Slide Thumbnails */}
        <div className="w-64 border-r bg-muted/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Slides</h3>
              <Button size="sm" onClick={addSlide}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {currentPresentation.slides.map((slide, index) => (
                  <Card
                    key={slide.id}
                    className={`cursor-pointer transition-all ${
                      index === selectedSlideIndex ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedSlideIndex(index)}
                  >
                    <CardContent className="p-2">
                      <div className="aspect-video mb-2">
                        {getSlidePreview(slide, currentPresentation.theme)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Slide {index + 1}</span>
                        <Badge variant="outline" className="text-xs">
                          {slide.layout}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1 p-8 bg-muted/20">
            <div className="max-w-4xl mx-auto">
              <Card className="aspect-video shadow-lg">
                <CardContent className="p-0 h-full">
                  <div className={`h-full bg-gradient-to-br ${themes.find(t => t.id === currentPresentation.theme)?.colors} p-8 text-white rounded-lg`}>
                    {selectedSlide.layout === 'title' && (
                      <div className="h-full flex flex-col justify-center text-center">
                        <h1 className="text-4xl font-bold mb-4">{selectedSlide.title}</h1>
                        <p className="text-xl opacity-90">{selectedSlide.content}</p>
                      </div>
                    )}
                    
                    {selectedSlide.layout === 'content' && (
                      <div className="h-full flex flex-col">
                        <h2 className="text-3xl font-bold mb-6">{selectedSlide.title}</h2>
                        <div className="flex-1">
                          <p className="text-lg leading-relaxed whitespace-pre-wrap">{selectedSlide.content}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedSlide.layout === 'image' && (
                      <div className="h-full flex flex-col">
                        <h2 className="text-3xl font-bold mb-6">{selectedSlide.title}</h2>
                        <div className="flex-1 flex items-center justify-center">
                          {selectedSlide.imageUrl ? (
                            <img
                              src={selectedSlide.imageUrl}
                              alt={selectedSlide.title}
                              className="max-w-full max-h-full object-contain rounded"
                            />
                          ) : (
                            <div className="w-full h-64 bg-white/20 rounded flex items-center justify-center">
                              <Image className="h-16 w-16 opacity-50" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedSlide.layout === 'split' && (
                      <div className="h-full flex flex-col">
                        <h2 className="text-3xl font-bold mb-6">{selectedSlide.title}</h2>
                        <div className="flex-1 grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-lg leading-relaxed">{selectedSlide.content}</p>
                          </div>
                          <div className="flex items-center justify-center">
                            {selectedSlide.imageUrl ? (
                              <img
                                src={selectedSlide.imageUrl}
                                alt={selectedSlide.title}
                                className="max-w-full max-h-full object-contain rounded"
                              />
                            ) : (
                              <div className="w-full h-48 bg-white/20 rounded flex items-center justify-center">
                                <Image className="h-12 w-12 opacity-50" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 border-l bg-background p-4">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {/* Slide Actions */}
                <div>
                  <h3 className="font-medium mb-3">Slide Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={duplicateSlide}>
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={deleteSlide}
                      disabled={currentPresentation.slides.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => moveSlide('up')}
                      disabled={selectedSlideIndex === 0}
                    >
                      <MoveUp className="h-4 w-4 mr-1" />
                      Move Up
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => moveSlide('down')}
                      disabled={selectedSlideIndex === currentPresentation.slides.length - 1}
                    >
                      <MoveDown className="h-4 w-4 mr-1" />
                      Move Down
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Content */}
                <div>
                  <h3 className="font-medium mb-3">Content</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Title</label>
                      <Input
                        value={selectedSlide.title}
                        onChange={(e) => updateSlide({ title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Content</label>
                      <Textarea
                        value={selectedSlide.content}
                        onChange={(e) => updateSlide({ content: e.target.value })}
                        rows={6}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Layout */}
                <div>
                  <h3 className="font-medium mb-3">Layout</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {layouts.map((layout) => {
                      const Icon = layout.icon
                      return (
                        <Button
                          key={layout.id}
                          size="sm"
                          variant={selectedSlide.layout === layout.id ? 'default' : 'outline'}
                          onClick={() => updateSlide({ layout: layout.id as any })}
                          className="flex flex-col gap-1 h-auto py-3"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs">{layout.name}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Image */}
                <div>
                  <h3 className="font-medium mb-3">Image</h3>
                  <div className="space-y-3">
                    {selectedSlide.imageUrl && (
                      <div className="aspect-video bg-muted rounded overflow-hidden">
                        <img
                          src={selectedSlide.imageUrl}
                          alt="Slide image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <Button
                      size="sm"
                      onClick={generateImage}
                      disabled={isGeneratingImage}
                      className="w-full"
                    >
                      {isGeneratingImage ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate AI Image
                        </>
                      )}
                    </Button>
                    {selectedSlide.imageUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSlide({ imageUrl: undefined })}
                        className="w-full"
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Theme */}
                <div>
                  <h3 className="font-medium mb-3">Theme</h3>
                  <div className="space-y-2">
                    {themes.map((theme) => (
                      <Button
                        key={theme.id}
                        size="sm"
                        variant={currentPresentation.theme === theme.id ? 'default' : 'outline'}
                        onClick={() => setCurrentPresentation({ ...currentPresentation, theme: theme.id })}
                        className="w-full justify-start"
                      >
                        <div className={`w-4 h-4 rounded bg-gradient-to-r ${theme.colors} mr-2`} />
                        {theme.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}