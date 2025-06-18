/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { VoiceToText } from './voice-to-text'
import { cn } from '../../lib/utils'

interface VoiceInputProps {
  value: string
  onChange: (_value: string) => void
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  placeholder?: string
  className?: string
  disabled?: boolean
  multiline?: boolean
  rows?: number
  language?: string
  voiceButtonSize?: 'sm' | 'lg' | 'default' | 'icon'
  voiceButtonVariant?: 'default' | 'ghost' | 'outline'
  showVoiceButton?: boolean
  onVoiceStart?: () => void
  onVoiceEnd?: () => void
}

export function VoiceInput({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  multiline = false,
  rows = 3,
  language = 'en-US',
  voiceButtonSize = 'sm',
  voiceButtonVariant = 'ghost',
  showVoiceButton = true,
  onVoiceStart,
  onVoiceEnd
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const handleVoiceText = (_text: string) => {
    console.log('VoiceInput received _text:', _text)
    // Append the voice text to the current value
    const newValue = value ? `${value} ${_text}` : _text
    console.log('VoiceInput updating value _from:', value, 'to:', newValue)
    onChange(newValue)
    setCurrentTranscript('')
    onVoiceEnd?.()
  }

  const handleTranscriptChange = (_transcript: string) => {
    console.log('VoiceInput transcript _change:', _transcript)
    setCurrentTranscript(_transcript)
    if (!isListening && _transcript) {
      onVoiceStart?.()
      setIsListening(true)
    } else if (isListening && !_transcript) {
      setIsListening(false)
      onVoiceEnd?.()
    }
  }

  // Display value includes the current transcript for real-time feedback
  const displayValue = currentTranscript ? 
    (value ? `${value} ${currentTranscript}` : currentTranscript) : 
    value

  const InputComponent = multiline ? Textarea : Input

  return (
    <div className="relative">
      <InputComponent
        ref={inputRef as any}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        className={cn(
          showVoiceButton && 'pr-10',
          currentTranscript && 'text-blue-600',
          className
        )}
      />
      
      {showVoiceButton && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <VoiceToText
            onTextReceived={handleVoiceText}
            onTranscriptChange={handleTranscriptChange}
            size={voiceButtonSize}
            variant={voiceButtonVariant}
            disabled={disabled}
            language={language}
            continuous={false}
            interimResults={true}
          />
        </div>
      )}
    </div>
  )
} 