/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Mic, MicOff, VolumeX } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface VoiceToTextProps {
  onTextReceived: (_text: string) => void
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTranscriptChange?: (_transcript: string) => void
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className?: string
  size?: 'sm' | 'lg' | 'default' | 'icon'
  variant?: 'default' | 'ghost' | 'outline'
  disabled?: boolean
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

export function VoiceToText({
  onTextReceived,
  onTranscriptChange,
  className,
  size = 'default',
  variant = 'outline',
  disabled = false,
  language = 'en-US',
  continuous = false,
  interimResults = true
}: VoiceToTextProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const isMountedRef = useRef(true)
  const isRecognitionActiveRef = useRef(false)
  const finalTranscriptRef = useRef('')
  const lastToggleTimeRef = useRef(0)

  // Reset mounted ref on mount
  useEffect(() => {
    isMountedRef.current = true
  }, [])

  // Check browser support and initialize
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language

    recognition.onstart = () => {
      if (!isMountedRef.current) return
      console.log('Speech recognition started')
      isRecognitionActiveRef.current = true
      setIsListening(true)
      setTranscript('')
      setFinalTranscript('')
      finalTranscriptRef.current = ''
    }

    recognition.onend = () => {
      if (!isMountedRef.current) return
      console.log('Speech recognition ended')
      isRecognitionActiveRef.current = false
      setIsListening(false)
      
      // Send final transcript when recognition ends using ref for immediate access
      const finalText = finalTranscriptRef.current.trim()
      if (finalText) {
        console.log('Sending final text to _callback:', finalText)
        onTextReceived(finalText)
        setFinalTranscript('')
        setTranscript('')
        finalTranscriptRef.current = ''
      } else {
        console.log('No final text to send')
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (_event: any) => {
      let interimTranscript = ''
      let finalText = ''

      for (let i = _event.resultIndex; i < _event.results.length; i++) {
        const result = _event.results[i]
        const text = result[0].transcript

        if (result.isFinal) {
          finalText += text
        } else {
          interimTranscript += text
        }
      }

      if (isMountedRef.current) {
        // Calculate the updated final transcript using ref for immediate access
        const updatedFinalTranscript = finalTranscriptRef.current + finalText
        
        // Update final transcript ref and state if we have new final text
        if (finalText) {
          finalTranscriptRef.current = updatedFinalTranscript
          setFinalTranscript(updatedFinalTranscript)
          console.log('Final text _received:', finalText, 'Total final:', updatedFinalTranscript)
        }

        // Use the updated final transcript for current transcript calculation
        const currentTranscript = updatedFinalTranscript + interimTranscript
        setTranscript(currentTranscript)
        onTranscriptChange?.(currentTranscript)
        console.log('Current _transcript:', currentTranscript)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (_event: any) => {
      if (!isMountedRef.current) return
      
      isRecognitionActiveRef.current = false
      setIsListening(false)
      
      // Don't show error for "aborted" - this is expected during cleanup
      if (_event.error === 'aborted') {
        return
      }
      
      console.error('Speech recognition _error:', _event.error)
      
      let errorMessage = 'Speech recognition error'
      switch (_event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.'
          break
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.'
          break
        case 'network':
          errorMessage = 'Network error. Please check your connection.'
          break
        default:
          errorMessage = `Speech recognition error: ${_event.error}`
      }
      
      toast.error(errorMessage)
    }

    recognitionRef.current = recognition

    return () => {
      isMountedRef.current = false
      isRecognitionActiveRef.current = false
      if (recognitionRef.current) {
        try {
          // Use stop() for graceful cleanup, fallback to abort() if needed
          if (isListening) {
            recognitionRef.current.stop()
          } else {
            recognitionRef.current.abort()
          }
        } catch (_error) {
          // Ignore cleanup errors
        }
      }
    }
  }, [language, continuous, interimResults, onTextReceived, onTranscriptChange, finalTranscript])

  const toggleListening = () => {
    if (!recognitionRef.current || !isSupported || disabled) return

    // Debounce rapid clicks (prevent double-clicking issues)
    const now = Date.now()
    if (now - lastToggleTimeRef.current < 300) {
      return
    }
    lastToggleTimeRef.current = now

    try {
      if (isRecognitionActiveRef.current) {
        console.log('Stopping speech recognition')
        recognitionRef.current.abort()
        isRecognitionActiveRef.current = false
        setIsListening(false)
      } else {
        console.log('Starting speech recognition')
        isRecognitionActiveRef.current = true
        recognitionRef.current.start()
      }
    } catch (error) {
      console.error('Error toggling speech recognition:', error)
      
      // Handle specific error cases
      if (error instanceof DOMException && error.name === 'InvalidStateError') {
        console.log('Recognition already active, attempting to abort and restart')
        try {
          recognitionRef.current.abort()
          isRecognitionActiveRef.current = false
          setIsListening(false)
          
          // Wait a bit before restarting
          setTimeout(() => {
            if (isMountedRef.current && recognitionRef.current) {
              try {
                isRecognitionActiveRef.current = true
                recognitionRef.current.start()
              } catch (retryError) {
                console.error('Retry failed:', retryError)
                isRecognitionActiveRef.current = false
                setIsListening(false)
              }
            }
          }, 100)
        } catch (abortError) {
          console.error('Abort failed:', abortError)
          isRecognitionActiveRef.current = false
          setIsListening(false)
        }
      } else {
        isRecognitionActiveRef.current = false
        setIsListening(false)
        toast.error('Failed to start speech recognition')
      }
    }
  }

  if (!isSupported) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled={true}
        className={cn('cursor-not-allowed', className)}
      >
        <VolumeX className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleListening}
      disabled={disabled}
      className={cn(
        isListening && 'bg-red-500 hover:bg-red-600 text-white',
        className
      )}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  )
} 