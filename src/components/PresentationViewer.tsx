import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  Maximize,
  Image
} from 'lucide-react'
import { Presentation } from '../App'

interface PresentationViewerProps {
  presentation: Presentation
  onBack: () => void
}

const themes = [
  { id: 'modern', name: 'Modern', colors: 'from-blue-500 to-purple-600' },
  { id: 'minimal', name: 'Minimal', colors: 'from-gray-400 to-gray-600' },
  { id: 'vibrant', name: 'Vibrant', colors: 'from-pink-500 to-orange-500' },
  { id: 'professional', name: 'Professional', colors: 'from-indigo-600 to-blue-800' },
  { id: 'nature', name: 'Nature', colors: 'from-green-500 to-teal-600' }
]

export function PresentationViewer({ presentation, onBack }: PresentationViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const currentSlide = presentation.slides[currentSlideIndex]
  const themeColors = themes.find(t => t.id === presentation.theme)?.colors || 'from-gray-400 to-gray-600'

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoPlay) {
      interval = setInterval(() => {
        setCurrentSlideIndex((prev) => {
          if (prev >= presentation.slides.length - 1) {
            setIsAutoPlay(false)
            return prev
          }
          return prev + 1
        })
      }, 5000) // 5 seconds per slide
    }
    return () => clearInterval(interval)
  }, [isAutoPlay, presentation.slides.length])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextSlide()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevSlide()
          break
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen()
          } else {
            onBack()
          }
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'r':
        case 'R':
          restart()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen, nextSlide, prevSlide, onBack, toggleFullscreen, restart])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isFullscreen) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    } else {
      setShowControls(true)
    }
    return () => clearTimeout(timeout)
  }, [isFullscreen, currentSlideIndex])

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }, [currentSlideIndex, presentation.slides.length])

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }, [currentSlideIndex])

  const restart = useCallback(() => {
    setCurrentSlideIndex(0)
    setIsAutoPlay(false)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      exitFullscreen()
    }
  }, [isFullscreen])

  const exitFullscreen = () => {
    document.exitFullscreen()
    setIsFullscreen(false)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay)
  }

  const renderSlideContent = () => {
    if (!currentSlide) return null

    return (
      <div className={`h-full bg-gradient-to-br ${themeColors} p-8 text-white flex flex-col`}>
        {currentSlide.layout === 'title' && (
          <div className="h-full flex flex-col justify-center text-center">
            <h1 className="text-6xl font-bold mb-8 leading-tight">{currentSlide.title}</h1>
            <p className="text-2xl opacity-90 leading-relaxed max-w-4xl mx-auto">{currentSlide.content}</p>
          </div>
        )}
        
        {currentSlide.layout === 'content' && (
          <div className="h-full flex flex-col">
            <h2 className="text-5xl font-bold mb-8">{currentSlide.title}</h2>
            <div className="flex-1 flex items-center">
              <p className="text-xl leading-relaxed whitespace-pre-wrap">{currentSlide.content}</p>
            </div>
          </div>
        )}
        
        {currentSlide.layout === 'image' && (
          <div className="h-full flex flex-col">
            <h2 className="text-5xl font-bold mb-8">{currentSlide.title}</h2>
            <div className="flex-1 flex items-center justify-center">
              {currentSlide.imageUrl ? (
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-96 h-64 bg-white/20 rounded-lg flex items-center justify-center">
                  <Image className="h-24 w-24 opacity-50" />
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentSlide.layout === 'split' && (
          <div className="h-full flex flex-col">
            <h2 className="text-5xl font-bold mb-8">{currentSlide.title}</h2>
            <div className="flex-1 grid grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xl leading-relaxed">{currentSlide.content}</p>
              </div>
              <div className="flex items-center justify-center">
                {currentSlide.imageUrl ? (
                  <img
                    src={currentSlide.imageUrl}
                    alt={currentSlide.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                ) : (
                  <div className="w-full h-80 bg-white/20 rounded-lg flex items-center justify-center">
                    <Image className="h-20 w-20 opacity-50" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} bg-black flex flex-col`}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Controls */}
      <div className={`${showControls || !isFullscreen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${isFullscreen ? 'absolute top-0 left-0 right-0 z-10' : ''}`}>
        <div className="bg-black/80 backdrop-blur-sm text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
                <X className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div>
                <h1 className="font-semibold">{presentation.title}</h1>
                <p className="text-sm text-white/70">
                  Slide {currentSlideIndex + 1} of {presentation.slides.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {presentation.theme}
              </Badge>
              <Button variant="ghost" size="sm" onClick={restart} className="text-white hover:bg-white/20">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleAutoPlay} className="text-white hover:bg-white/20">
                {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Slide */}
      <div className="flex-1 relative">
        {renderSlideContent()}
        
        {/* Navigation Arrows */}
        <div className={`${showControls || !isFullscreen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none`}>
          <Button
            variant="ghost"
            size="lg"
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="ml-4 text-white hover:bg-white/20 pointer-events-auto disabled:opacity-30"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={nextSlide}
            disabled={currentSlideIndex === presentation.slides.length - 1}
            className="mr-4 text-white hover:bg-white/20 pointer-events-auto disabled:opacity-30"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`${showControls || !isFullscreen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${isFullscreen ? 'absolute bottom-0 left-0 right-0' : ''}`}>
        <div className="bg-black/80 backdrop-blur-sm p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{
                    width: `${((currentSlideIndex + 1) / presentation.slides.length) * 100}%`
                  }}
                />
              </div>
            </div>
            <div className="text-white text-sm font-medium">
              {currentSlideIndex + 1} / {presentation.slides.length}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {!isFullscreen && (
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg text-xs">
          <div className="space-y-1">
            <div><kbd className="bg-white/20 px-1 rounded">→</kbd> Next slide</div>
            <div><kbd className="bg-white/20 px-1 rounded">←</kbd> Previous slide</div>
            <div><kbd className="bg-white/20 px-1 rounded">F</kbd> Fullscreen</div>
            <div><kbd className="bg-white/20 px-1 rounded">R</kbd> Restart</div>
            <div><kbd className="bg-white/20 px-1 rounded">Esc</kbd> Exit</div>
          </div>
        </div>
      )}
    </div>
  )
}