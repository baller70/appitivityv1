import React from 'react'

declare module '@tanstack/react-query' {
  export * from 'react-query'
}

declare module '@tanstack/react-query-devtools' {
  export const ReactQueryDevtools: React.ComponentType<any>
} 