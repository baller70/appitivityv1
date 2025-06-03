// Bookmark TODO Service - Manages checklist items within bookmark notes
// Uses the existing notes field with structured data format

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  completedAt?: string
}

export interface TodoList {
  items: TodoItem[]
  metadata: {
    totalItems: number
    completedItems: number
    lastUpdated: string
  }
}

export interface BookmarkNotes {
  textContent: string
  todos: TodoItem[]
  lastUpdated: string
}

class BookmarkTodoService {
  
  // Parse notes field to extract TODO items and regular text
  parseBookmarkNotes(notesField: string | null): BookmarkNotes {
    if (!notesField) {
      return {
        textContent: '',
        todos: [],
        lastUpdated: new Date().toISOString()
      }
    }

    try {
      // Try to parse as structured JSON
      const parsed = JSON.parse(notesField)
      if (parsed.textContent !== undefined && parsed.todos !== undefined) {
        return {
          textContent: parsed.textContent || '',
          todos: parsed.todos || [],
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        }
      }
    } catch {
      // If not JSON, treat as plain text and extract TODO items
      const todos = this.extractTodosFromText(notesField)
      const textContent = this.removeInlineTodos(notesField)
      
      return {
        textContent,
        todos,
        lastUpdated: new Date().toISOString()
      }
    }

    // Fallback to plain text
    return {
      textContent: notesField,
      todos: [],
      lastUpdated: new Date().toISOString()
    }
  }

  // Convert BookmarkNotes back to string for storage
  serializeBookmarkNotes(notes: BookmarkNotes): string {
    return JSON.stringify({
      textContent: notes.textContent,
      todos: notes.todos,
      lastUpdated: new Date().toISOString()
    })
  }

  // Extract TODO items from plain text (markdown-style checkboxes)
  private extractTodosFromText(text: string): TodoItem[] {
    const todoRegex = /^\s*[-*+]?\s*\[([x\s])\]\s*(.+)$/gim
    const todos: TodoItem[] = []
    let match

    while ((match = todoRegex.exec(text)) !== null) {
      const completed = match[1].toLowerCase() === 'x'
      const text = match[2].trim()
      
      todos.push({
        id: this.generateTodoId(),
        text,
        completed,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        completedAt: completed ? new Date().toISOString() : undefined
      })
    }

    return todos
  }

  // Remove inline TODO items from text content
  private removeInlineTodos(text: string): string {
    const todoRegex = /^\s*[-*+]?\s*\[([x\s])\]\s*(.+)$/gim
    return text.replace(todoRegex, '').replace(/\n\n+/g, '\n\n').trim()
  }

  // Generate unique ID for TODO items
  private generateTodoId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Add a new TODO item
  addTodoItem(notes: BookmarkNotes, todoText: string, priority: 'low' | 'medium' | 'high' = 'medium'): BookmarkNotes {
    const newTodo: TodoItem = {
      id: this.generateTodoId(),
      text: todoText.trim(),
      completed: false,
      priority,
      createdAt: new Date().toISOString()
    }

    return {
      ...notes,
      todos: [...notes.todos, newTodo],
      lastUpdated: new Date().toISOString()
    }
  }

  // Update an existing TODO item
  updateTodoItem(notes: BookmarkNotes, todoId: string, updates: Partial<Pick<TodoItem, 'text' | 'completed' | 'priority'>>): BookmarkNotes {
    const updatedTodos = notes.todos.map(todo => {
      if (todo.id === todoId) {
        const updated: TodoItem = {
          ...todo,
          ...updates
        }
        
        // Set completion timestamp if marking as completed
        if (updates.completed === true && !todo.completed) {
          updated.completedAt = new Date().toISOString()
        }
        
        // Remove completion timestamp if marking as incomplete
        if (updates.completed === false && todo.completed) {
          updated.completedAt = undefined
        }
        
        return updated
      }
      return todo
    })

    return {
      ...notes,
      todos: updatedTodos,
      lastUpdated: new Date().toISOString()
    }
  }

  // Delete a TODO item
  deleteTodoItem(notes: BookmarkNotes, todoId: string): BookmarkNotes {
    return {
      ...notes,
      todos: notes.todos.filter(todo => todo.id !== todoId),
      lastUpdated: new Date().toISOString()
    }
  }

  // Get TODO statistics
  getTodoStatistics(notes: BookmarkNotes): TodoList['metadata'] {
    const totalItems = notes.todos.length
    const completedItems = notes.todos.filter(todo => todo.completed).length
    
    return {
      totalItems,
      completedItems,
      lastUpdated: notes.lastUpdated
    }
  }

  // Sort TODOs by various criteria
  sortTodos(todos: TodoItem[], sortBy: 'created' | 'priority' | 'status' | 'alphabetical'): TodoItem[] {
    const sortedTodos = [...todos]
    
    switch (sortBy) {
      case 'created':
        return sortedTodos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return sortedTodos.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      
      case 'status':
        return sortedTodos.sort((a, b) => {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1 // Incomplete items first
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      
      case 'alphabetical':
        return sortedTodos.sort((a, b) => a.text.localeCompare(b.text))
      
      default:
        return sortedTodos
    }
  }

  // Filter TODOs by status
  filterTodos(todos: TodoItem[], filter: 'all' | 'pending' | 'completed'): TodoItem[] {
    switch (filter) {
      case 'pending':
        return todos.filter(todo => !todo.completed)
      case 'completed':
        return todos.filter(todo => todo.completed)
      case 'all':
      default:
        return todos
    }
  }

  // Get priority color for UI
  getPriorityColor(priority: TodoItem['priority']): string {
    switch (priority) {
      case 'high':
        return '#ef4444' // red-500
      case 'medium':
        return '#f59e0b' // amber-500
      case 'low':
        return '#10b981' // emerald-500
      default:
        return '#6b7280' // gray-500
    }
  }

  // Get priority label for UI
  getPriorityLabel(priority: TodoItem['priority']): string {
    switch (priority) {
      case 'high':
        return 'High Priority'
      case 'medium':
        return 'Medium Priority'
      case 'low':
        return 'Low Priority'
      default:
        return 'Normal'
    }
  }

  // Convert TODOs to markdown checklist format
  todosToMarkdown(todos: TodoItem[]): string {
    if (todos.length === 0) return ''
    
    const sortedTodos = this.sortTodos(todos, 'status')
    
    return sortedTodos.map(todo => {
      const checkbox = todo.completed ? '[x]' : '[ ]'
      const priorityTag = todo.priority !== 'medium' ? ` (${todo.priority} priority)` : ''
      return `- ${checkbox} ${todo.text}${priorityTag}`
    }).join('\n')
  }

  // Create a combined content with text and TODOs
  createCombinedContent(notes: BookmarkNotes): string {
    const parts: string[] = []
    
    if (notes.textContent.trim()) {
      parts.push(notes.textContent.trim())
    }
    
    if (notes.todos.length > 0) {
      const todoMarkdown = this.todosToMarkdown(notes.todos)
      if (todoMarkdown) {
        parts.push('### Tasks')
        parts.push(todoMarkdown)
      }
    }
    
    return parts.join('\n\n')
  }

  // Quick add multiple TODOs from text input
  addMultipleTodos(notes: BookmarkNotes, todoText: string): BookmarkNotes {
    const lines = todoText.split('\n').filter(line => line.trim())
    let updatedNotes = notes
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed) {
        // Extract priority from text like "Fix bug (high)" or "Review docs (low priority)"
        const priorityMatch = trimmed.match(/\((high|medium|low)(\s+priority)?\)\s*$/i)
        const priority = priorityMatch ? priorityMatch[1].toLowerCase() as TodoItem['priority'] : 'medium'
        const text = priorityMatch ? trimmed.replace(/\((high|medium|low)(\s+priority)?\)\s*$/i, '').trim() : trimmed
        
        updatedNotes = this.addTodoItem(updatedNotes, text, priority)
      }
    }
    
    return updatedNotes
  }
}

export const bookmarkTodoService = new BookmarkTodoService()
export default bookmarkTodoService 