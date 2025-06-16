'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasChunkError: boolean
}

export class ChunkErrorBoundary extends React.Component<Props, State> {
  state: State = { hasChunkError: false }

  static getDerivedStateFromError(error: Error): State {
    const isChunkError =
      error.name === 'ChunkLoadError' || /Loading chunk [\d]+ failed/.test(error.message)
    return { hasChunkError: isChunkError }
  }

  componentDidUpdate() {
    if (this.state.hasChunkError) {
      window.location.reload()
    }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ChunkLoadError caught:', error, info)
  }

  render() {
    return this.state.hasChunkError ? null : this.props.children
  }
} 