// @ts-nocheck
'use client'

import { Palette } from 'lucide-react'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from './dropdown-menu'
import { useAccent, Accent } from '@/hooks/useAccent'

const ACCENTS: { value: Accent; label: string; className: string }[] = [
  { value: 'brand', label: 'Brand', className: 'bg-brand-600' },
  { value: 'blue', label: 'Blue', className: 'bg-blue-600' },
  { value: 'green', label: 'Green', className: 'bg-green-600' },
  { value: 'purple', label: 'Purple', className: 'bg-purple-600' },
  { value: 'orange', label: 'Orange', className: 'bg-orange-500' },
]

export function AccentToggle() {
  const { accent, setAccent } = useAccent()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Select accent color</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup value={accent} onValueChange={setAccent as any}>
          {ACCENTS.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value} className="flex items-center space-x-2">
              <span className={`inline-block w-3 h-3 rounded-full ${opt.className}`} />
              <span>{opt.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 