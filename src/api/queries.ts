import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export interface Memory {
  id: string
  user_id: string
  title: string | null
  content: string
  ai_summary: string | null
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  user_id: string
  title: string
  remind_at: string
  completed: boolean
  status?: "pending" | "ongoing" | "completed"
  ongoing_since?: string
  shared_with?: string[]
  notification_method?: string
  deadline?: string
  priority?: "Low" | "Medium" | "High"
}

export interface ActivityLog {
  id: string
  user_id: string
  action: "create_task" | "complete_task" | "pause_task" | "resume_task" | "share_task" | "create_note" | "pin_note" | "delete_item"
  entity_title: string
  entity_type: "task" | "note" | "project"
  timestamp: string
  details?: string
}

// Mock Data for Demo Mode
const MOCK_MEMORIES: Memory[] = [
  {
    id: 'mock-1',
    user_id: 'mock-user',
    title: 'Project Ideas',
    content: 'Need to explore Vite plugin system for better build times. Also consider adding a service worker for offline support.',
    ai_summary: 'Exploring Vite plugins for build optimization and service workers for offline capabilities.',
    pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'mock-2',
    user_id: 'mock-user',
    title: 'Grocery List',
    content: 'Milk, Eggs, Bread, and Coffee beans (dark roast).',
    ai_summary: 'Shopping list: Milk, Eggs, Bread, Coffee beans.',
    pinned: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'mock-3',
    user_id: 'mock-user',
    title: 'Meeting Notes: Design Sync',
    content: 'Discussed the new dashboard layout. We agreed to move the recent activity to the right sidebar and add a prominent "Capture" button in the center.',
    ai_summary: 'Dashboard layout decisions: recent activity in right sidebar, prominent Capture button.',
    pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  }
];

let inMemoryMockData = [...MOCK_MEMORIES];

const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'mock-rem-1',
    user_id: 'mock-user',
    title: 'Design high-converting Landing Page',
    remind_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    completed: false,
    status: 'ongoing',
    ongoing_since: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    priority: 'High',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    shared_with: ['sarah@example.com', 'alex@team.io']
  },
  {
    id: 'mock-rem-2',
    user_id: 'mock-user',
    title: 'Review PR for Dashboard & Graph integration',
    remind_at: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    completed: false,
    status: 'pending',
    priority: 'Medium',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'mock-rem-3',
    user_id: 'mock-user',
    title: 'Call team for weekly sync & milestone demo',
    remind_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    completed: false,
    status: 'pending',
    priority: 'Low'
  },
  {
    id: 'mock-rem-4',
    user_id: 'mock-user',
    title: 'Setup production Supabase database environment',
    remind_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    completed: true,
    status: 'completed',
    priority: 'High'
  }
];

let inMemoryMockReminders = [...MOCK_REMINDERS];

const MOCK_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    user_id: 'mock-user',
    action: 'resume_task',
    entity_title: 'Design high-converting Landing Page',
    entity_type: 'task',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    details: 'Timer started. Task switched to Ongoing.'
  },
  {
    id: 'act-2',
    user_id: 'mock-user',
    action: 'share_task',
    entity_title: 'Design high-converting Landing Page',
    entity_type: 'task',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    details: 'Shared with sarah@example.com and alex@team.io'
  },
  {
    id: 'act-3',
    user_id: 'mock-user',
    action: 'complete_task',
    entity_title: 'Setup production Supabase database environment',
    entity_type: 'task',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    details: 'Marked as completed.'
  },
  {
    id: 'act-4',
    user_id: 'mock-user',
    action: 'pin_note',
    entity_title: 'Grocery List',
    entity_type: 'note',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    details: 'Pinned to top of Dashboard.'
  },
  {
    id: 'act-5',
    user_id: 'mock-user',
    action: 'create_note',
    entity_title: 'Project Ideas',
    entity_type: 'note',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    details: 'New memory captured via Quick Note.'
  }
];

let inMemoryMockActivities = [...MOCK_ACTIVITIES];

export function useActivityLogs() {
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: ['activity_logs', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated")
      return inMemoryMockActivities
    },
    enabled: !!user,
  })
}

export function useCreateActivityLog() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (newLog: Omit<ActivityLog, 'id' | 'user_id' | 'timestamp'>) => {
      if (!user) throw new Error("Not authenticated")
      
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .insert([
            { 
              user_id: user.id, 
              ...newLog,
              timestamp: new Date().toISOString()
            }
          ])
          .select()
          .single()
          
        if (error) throw error
        return data as ActivityLog
      } catch (e) {
        console.warn("Supabase insert failed, saving to mock data in memory.", e)
        const mockLog: ActivityLog = {
          id: `mock-act-new-${Date.now()}`,
          user_id: user.id,
          timestamp: new Date().toISOString(),
          ...newLog
        }
        inMemoryMockActivities = [mockLog, ...inMemoryMockActivities]
        return mockLog
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] })
    },
  })
}

export function useMemories() {
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: ['memories', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated")
      
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data as Memory[]
      } catch (e) {
        console.warn("Supabase query failed, falling back to mock data.", e)
        return inMemoryMockData
      }
    },
    enabled: !!user,
  })
}

export function useCreateMemory() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated")
      
      const title = content.split('\n')[0].substring(0, 50) + (content.length > 50 ? '...' : '')
      
      try {
        const { data, error } = await supabase
          .from('memories')
          .insert([
            { 
              user_id: user.id, 
              content,
              title,
            }
          ])
          .select()
          .single()
          
        if (error) throw error
        return data as Memory
      } catch (e) {
        console.warn("Supabase insert failed, saving to mock data in memory.", e)
        const newMemory: Memory = {
          id: `mock-new-${Date.now()}`,
          user_id: user.id,
          title,
          content,
          ai_summary: "AI summary pending (mocked)",
          pinned: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        inMemoryMockData = [newMemory, ...inMemoryMockData]
        return newMemory
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}

export function useUpdateMemory() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Memory> }) => {
      if (!user) throw new Error("Not authenticated")
      
      try {
        const { data, error } = await supabase
          .from('memories')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
          
        if (error) throw error
        return data as Memory
      } catch (e) {
        console.warn("Supabase update failed, updating mock data in memory.", e)
        const index = inMemoryMockData.findIndex(m => m.id === id)
        if (index > -1) {
          const updatedArray = [...inMemoryMockData]
          updatedArray[index] = { ...updatedArray[index], ...updates, updated_at: new Date().toISOString() }
          inMemoryMockData = updatedArray
          return updatedArray[index]
        }
        throw new Error("Memory not found in mock data")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}

export function useDeleteMemory() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated")
      
      try {
        const { error } = await supabase
          .from('memories')
          .delete()
          .eq('id', id)
          
        if (error) throw error
        return id
      } catch (e) {
        console.warn("Supabase delete failed, deleting from mock data.", e)
        inMemoryMockData = inMemoryMockData.filter(m => m.id !== id)
        return id
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })
}

export function useReminders() {
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: ['reminders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated")
      
      try {
        const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .order('remind_at', { ascending: true })
        
        if (error) throw error
        return data as Reminder[]
      } catch (e) {
        console.warn("Supabase query failed, falling back to mock data.", e)
        return inMemoryMockReminders
      }
    },
    enabled: !!user,
  })
}

export function useCreateReminder() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async ({ title, notification_method, deadline, priority }: { title: string, notification_method?: string, deadline?: string, priority?: "Low" | "Medium" | "High" }) => {
      if (!user) throw new Error("Not authenticated")
      
      try {
        const { data, error } = await supabase
          .from('reminders')
          .insert([
            { 
              user_id: user.id, 
              title,
              notification_method,
              deadline,
              priority,
              remind_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
            }
          ])
          .select()
          .single()
          
        if (error) throw error
        return data as Reminder
      } catch (e) {
        console.warn("Supabase insert failed, saving to mock data in memory.", e)
        const newReminder: Reminder = {
          id: `mock-rem-new-${Date.now()}`,
          user_id: user.id,
          title,
          notification_method,
          deadline,
          priority,
          remind_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          completed: false,
        }
        inMemoryMockReminders = [newReminder, ...inMemoryMockReminders]
        return newReminder
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}

export function useUpdateReminder() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Reminder> }) => {
      if (!user) throw new Error("Not authenticated")
      try {
        const { data, error } = await supabase
          .from('reminders')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data as Reminder
      } catch (e) {
        console.warn("Supabase update failed, updating mock reminder.", e)
        const idx = inMemoryMockReminders.findIndex(r => r.id === id)
        if (idx > -1) {
          const updatedArray = [...inMemoryMockReminders]
          updatedArray[idx] = { ...updatedArray[idx], ...updates }
          inMemoryMockReminders = updatedArray
          return updatedArray[idx]
        }
        throw new Error("Reminder not found in mock data")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}

export function useDeleteReminder() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated")
      try {
        const { error } = await supabase.from('reminders').delete().eq('id', id)
        if (error) throw error
        return id
      } catch (e) {
        console.warn("Supabase delete failed, deleting from mock reminders.", e)
        inMemoryMockReminders = inMemoryMockReminders.filter(r => r.id !== id)
        return id
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}
