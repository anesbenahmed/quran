import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react'
import { Batch, Farm, Cost, Task, CostCategory, TaskCategory } from '@renderer/types'
import {
  LayoutDashboard,
  Warehouse,
  Egg,
  DollarSign,
  Calendar,
  FileText,
  LucideIcon
} from 'lucide-react'
import { format, isSameDay, parseISO, differenceInDays, addDays } from 'date-fns'
import { ar } from 'date-fns/locale'

// Mock Data
const mockFarms: Farm[] = [
  {
    id: 1,
    name: 'مزرعة الوفاء',
    location: 'سطيف',
    size: 100,
    batches: 3,
    poultryCount: 5000,
    lastUpdated: '2023-11-25'
  },
  {
    id: 2,
    name: 'مزرعة البركة',
    location: 'قسنطينة',
    size: 75,
    batches: 2,
    poultryCount: 3000,
    lastUpdated: '2023-11-24'
  },
  {
    id: 3,
    name: 'مزرعة النور',
    location: 'عنابة',
    size: 50,
    batches: 1,
    poultryCount: 2000,
    lastUpdated: '2023-11-23'
  }
]

const mockBatches: Batch[] = [
  {
    id: 1,
    name: 'دفعة الربيع',
    type: 'Broiler',
    chickPrice: 50,
    farmId: 1,
    poultryCount: 1000,
    startDate : '2024-11-1',
    details: {
      initialChickCost: 120,
      mortalityRate: 3,
      startDate: '2024-01-01',
      expectedEndDate: '2024-02-12',
      growthPeriod: 42,
      targetWeight: 2.5,
      sellingPricePerKg: 450,
      feedConversionRatio: 1.7,
      currentWeight: 1.2,
      dailyRecords: [],
      feedRecords: [
        {
          type: 'علف البداية',
          quantity: 500,
          costPerKg: 140,
          startAge: 0,
          endAge: 2
        },
        {
          type: 'علف النمو',
          quantity: 800,
          costPerKg: 130,
          startAge: 3,
          endAge: 4
        }
      ]
    }
  },
  {
    id: 2,
    name: 'دفعة الصيف',
    type: 'Broiler',
    chickPrice: 60,
    farmId: 2,
    poultryCount: 1500,
    startDate : '2024-10-20',
    details: {
      initialChickCost: 115,
      mortalityRate: 2.5,
      startDate: '2024-01-15',
      expectedEndDate: '2024-02-26',
      growthPeriod: 42,
      targetWeight: 2.3,
      sellingPricePerKg: 460,
      feedConversionRatio: 1.65,
      currentWeight: 0.9,
      dailyRecords: [],
      feedRecords: [
        {
          type: 'علف البداية',
          quantity: 600,
          costPerKg: 140,
          startAge: 0,
          endAge: 2
        }
      ]
    }
  },
  {
    id: 3,
    name: 'دفعة الخريف',
    type: 'Layer',
    chickPrice: 40,
    farmId: 3,
    poultryCount: 2000,
    startDate : '2024-10-1',
    details: {
      initialChickCost: 130,
      mortalityRate: 4,
      startDate: '2023-12-01',
      expectedEndDate: '2024-12-01',
      eggProductionStart: 20,
      layingRate: 85,
      dailyEggCount: 1700,
      eggSellingPrice: 15,
      dailyRecords: [],
      feedRecords: [
        {
          type: 'علف البياض',
          quantity: 1000,
          costPerKg: 120,
          startAge: 18,
          endAge: 20
        }
      ]
    }
  }
]

const mockCosts: Cost[] = [
  { id: 1, type: 'Feed', categoryId: 1, amount: 5000, date: '2023-11-20', batchId: 1 },
  { id: 2, type: 'Vaccination', categoryId: 2, amount: 1000, date: '2023-11-15', batchId: 2 },
  { id: 3, type: 'Labor', categoryId: 4, amount: 2000, date: '2023-11-18', batchId: 3 },
  { id: 4, type: 'Utilities', categoryId: 3, amount: 500, date: '2023-11-22', batchId: 1 }
]

const mockTasks: Task[] = [
  {
    id: 1,
    type: 'Feeding',
    date: '2023-11-26',
    batchId: 1,
    notes: 'Morning feed',
    category: 'Daily'
  },
  {
    id: 2,
    type: 'Vaccination',
    date: '2023-11-27',
    notes: 'Second round',
    batchId: 2,
    category: 'Health'
  },
  {
    id: 3,
    type: 'Health Check',
    date: '2023-11-28',
    notes: 'Weekly check-up',
    batchId: 3,
    category: 'Daily'
  }
]

const mockCostCategories: CostCategory[] = [
  { id: 1, name: 'Feed' },
  { id: 2, name: 'Vaccination' },
  { id: 3, name: 'Utilities' },
  { id: 4, name: 'Labor' }
]

const mockTaskCategories: TaskCategory[] = [
  { name: 'Daily', color: '#BFDBFE', textColor: '#1E40AF' },
  { name: 'Health', color: '#BBF7D0', textColor: '#15803D' },
  { name: 'Maintenance', color: '#FEF08A', textColor: '#854D0E' }
]



interface NavItem {
  id: string
  icon: LucideIcon
  label: string
}

interface FarmFormData {
  name: string
  location: string
  size: number
  description?: string
}

// Add Cost Form Types
interface CostFormData {
  id?: number
  type: string
  amount: string | number
  date: string
  batchId: string | number
  categoryId?: number | undefined
}

interface CostFormErrors {
  type?: string
  amount?: string
  date?: string
  batchId?: string
}

interface TaskFormData {
  type: string
  date: string
  batchId: string
  category: string
  notes: string
}

// Add these interfaces to your existing types
interface GrowthData {
  name: string
  data: { week: number; weight: number }[]
}

interface MortalityData {
  name: string
  mortality: number
}

interface FeedEfficiencyData {
  name: string
  efficiency: string
}

interface ProfitabilityData {
  name: string
  profit: string
}

interface AppState {
  // Core data
  farms: Farm[]
  batches: Batch[]
  costs: Cost[]
  tasks: Task[]
  costCategories: CostCategory[]
  taskCategories: TaskCategory[]

  // UI state
  activeSection: string
  selectedBatch: number | null
  editingBatch: Batch | null
  viewingBatch: number | null
  selectedFarm: Farm | null
  editingFarm: Farm | null
  selectedCost: Cost | null
  editingCost: Cost | null
  selectedTask: Task | null
  editingTask: Task | null

  // Sidebar state
  isSidebarOpen: boolean
  navItems: NavItem[]

  // Add farm form state
  farmFormData: FarmFormData

  // Cost state
  costFormData: CostFormData
  costFormErrors: CostFormErrors
  selectedBatchForCost: string
  categoryDialogOpen: boolean

  // Schedule state
  selectedBatchForSchedule: string
  currentDate: Date
  isAddTaskOpen: boolean
  isAddCategoryOpen: boolean
  editingTaskCategory: TaskCategory | null
  taskFormData: TaskFormData

  // Reports state
  selectedBatchForReport: string
}

interface AppContextType extends AppState {
  // State setters
  setFarms: (farms: Farm[]) => void
  setBatches: (batches: Batch[]) => void
  setCosts: (costs: Cost[]) => void
  setTasks: (tasks: Task[]) => void
  setCostCategories: (categories: CostCategory[]) => void
  setTaskCategories: (categories: TaskCategory[]) => void

  // UI state setters
  setActiveSection: (section: string) => void
  setSelectedBatch: (batchId: number | null) => void
  setEditingBatch: (batch: Batch | null) => void
  setViewingBatch: (id: number | null) => void
  setSelectedFarm: (farm: Farm | null) => void
  setEditingFarm: (farm: Farm | null) => void
  setSelectedCost: (cost: Cost | null) => void
  setEditingCost: (cost: Cost | null) => void
  setSelectedTask: (task: Task | null) => void
  setEditingTask: (task: Task | null) => void

  // Sidebar actions
  setIsSidebarOpen: (isOpen: boolean) => void

  // Actions
  addBatch: (batch: Omit<Batch, 'id'>) => void
  updateBatch: (batch: Batch) => void
  deleteBatch: (id: number) => void

  addFarm: (farm: Omit<Farm, 'id'>) => void
  updateFarm: (farm: Farm) => void
  deleteFarm: (id: number) => void

  addCost: (cost: Omit<Cost, 'id'>) => void
  updateCost: (cost: Cost) => void
  deleteCost: (id: number) => void

  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (task: Task) => void
  deleteTask: (id: number) => void

  // Computed values
  batchesByFarm: { farm: Farm; batches: Batch[] }[]
  currentBatch: Batch | null
  batchFarm: Farm | null

  // Add farm form state setters
  setFarmFormData: (data: FarmFormData) => void

  // Cost state setters
  setCostFormData: (data: CostFormData) => void
  setCostFormErrors: (errors: CostFormErrors) => void
  setSelectedBatchForCost: (batchId: string) => void
  setCategoryDialogOpen: (open: boolean) => void

  // Cost actions
  addCostCategory: (category: Omit<CostCategory, 'id'>) => void
  deleteCostCategory: (id: number) => void

  // Cost computed values
  filteredCosts: Cost[]
  costSummary: Record<string, number>
  totalCost: number
  costPerBird: number

  // Schedule state setters
  setSelectedBatchForSchedule: (batchId: string) => void
  setCurrentDate: (date: Date) => void
  setIsAddTaskOpen: (isOpen: boolean) => void
  setIsAddCategoryOpen: (isOpen: boolean) => void
  setEditingTaskCategory: (category: TaskCategory | null) => void
  setTaskFormData: React.Dispatch<React.SetStateAction<TaskFormData>>

  // Schedule actions
  addTaskCategory: (category: TaskCategory) => void
  updateTaskCategory: (category: TaskCategory) => void
  deleteTaskCategory: (name: string) => void

  // Schedule computed functions
  getTasksForDate: (date: Date) => Task[]
  getCategoryColor: (categoryName: string) => { bg: string; text: string }
  handlePrevMonth: () => void
  handleNextMonth: () => void

  // Reports state setters
  setSelectedBatchForReport: (batchId: string) => void

  // Reports computed values
  filteredBatchesForReport: Batch[]
  growthData: GrowthData[]
  mortalityData: MortalityData[]
  feedEfficiency: FeedEfficiencyData[]
  profitability: ProfitabilityData[]

}


const AppContext = createContext<AppContextType | undefined>(undefined)



export function AppProvider({ children }: { children: ReactNode }): React.ReactNode {
  // Core data state
  const [farms, setFarms] = useState<Farm[]>(mockFarms)
  const [batches, setBatches] = useState<Batch[]>(mockBatches)
  const [costs, setCosts] = useState<Cost[]>(mockCosts)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [costCategories, setCostCategories] = useState<CostCategory[]>(mockCostCategories)
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>(mockTaskCategories)


  

  // UI state
  const [activeSection, setActiveSection] = useState('dashboard')
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [viewingBatch, setViewingBatch] = useState<number | null>(null)
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null)
  const [selectedCost, setSelectedCost] = useState<Cost | null>(null)
  const [editingCost, setEditingCost] = useState<Cost | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)


    // Function to determine batch status
    const getBatchStatus = (batch: Batch): 'empty' | 'active' => {
      return batch.poultryCount === 0 ? 'empty' : 'active'
    }

    const batchesWithStatus = useMemo(() => {
      return batches.map(batch => ({
        ...batch,
        status: getBatchStatus(batch)
      }))
    }, [batches])

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Sidebar data
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { id: 'farms', icon: Warehouse, label: 'المزارع' },
    { id: 'batches', icon: Egg, label: 'الدفعات' },
    { id: 'costs', icon: DollarSign, label: 'التكاليف' },
    { id: 'schedules', icon: Calendar, label: 'الجدول' },
    { id: 'reports', icon: FileText, label: 'التقارير' }
  ]


  // Computed values
  const batchesByFarm = farms.map((farm) => ({
    farm,
    batches: batches.filter((batch) => batch.farmId === farm.id)
  }))

  const currentBatch = batches.find((b) => b.id === selectedBatch)
  const batchFarm = currentBatch ? farms.find((f) => f.id === currentBatch.farmId) : null

  
  // Actions
  const addBatch = (newBatch: Omit<Batch, 'id'>): void => {
    setBatches((prev) => [...prev, { ...newBatch, id: Math.max(0, ...prev.map((b) => b.id)) + 1 }])
  }

  const updateBatch = (updatedBatch: Batch): void => {
    setBatches((prev) => prev.map((batch) => (batch.id === updatedBatch.id ? updatedBatch : batch)))
  }

  const deleteBatch = (id: number): void => {
    setBatches((prev) => prev.filter((batch) => batch.id !== id))
  }

  const addFarm = (newFarm: Omit<Farm, 'id'>): void => {
    setFarms((prev) => [...prev, { ...newFarm, id: Math.max(0, ...prev.map((f) => f.id)) + 1 }])
  }

  const updateFarm = (updatedFarm: Farm): void => {
    setFarms((prev) => prev.map((farm) => (farm.id === updatedFarm.id ? updatedFarm : farm)))
  }

  const deleteFarm = (id: number): void => {
    setFarms((prev) => prev.filter((farm) => farm.id !== id))
  }

  const addCost = (newCost: Omit<Cost, 'id'>): void => {
    setCosts((prev) => [...prev, { ...newCost, id: Math.max(0, ...prev.map((c) => c.id)) + 1 }])
  }

  const updateCost = (updatedCost: Cost): void => {
    setCosts((prev) => prev.map((cost) => (cost.id === updatedCost.id ? updatedCost : cost)))
  }

  const deleteCost = (id: number): void => {
    setCosts((prev) => prev.filter((cost) => cost.id !== id))
  }

  const addTask = (newTask: Omit<Task, 'id'>): void => {
    setTasks((prev) => [...prev, { ...newTask, id: Math.max(0, ...prev.map((t) => t.id)) + 1 }])
  }

  const updateTask = (updatedTask: Task): void => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const deleteTask = (id: number): void => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  // Add farm form state
  const [farmFormData, setFarmFormData] = useState<FarmFormData>({
    name: '',
    location: '',
    size: 0,
    description: ''
  })

  // Update the useEffect to reset form data when editing farm changes
  useEffect(() => {
    if (editingFarm) {
      setFarmFormData({
        name: editingFarm.name,
        location: editingFarm.location,
        size: editingFarm.size,
        description: ''
      })
    } else {
      setFarmFormData({
        name: '',
        location: '',
        size: 0,
        description: ''
      })
    }
  }, [editingFarm])

  // Cost state
  const [costFormData, setCostFormData] = useState<CostFormData>({
    type: '',
    amount: '',
    date: '',
    batchId: '',
    categoryId: undefined
  })
  const [costFormErrors, setCostFormErrors] = useState<CostFormErrors>({})
  const [selectedBatchForCost, setSelectedBatchForCost] = useState('all')
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

  // Update filtered costs to use the new selector
  const filteredCosts = useMemo(() => {
    return selectedBatch === null ? costs : costs.filter((cost) => cost.batchId === selectedBatch)
  }, [costs, selectedBatch])

  const costSummary = useMemo(() => {
    return costCategories.reduce((acc: Record<string, number>, category) => {
      acc[category.name] = filteredCosts
        .filter((cost) => cost.categoryId === category.id)
        .reduce((sum, cost) => sum + cost.amount, 0)
      return acc
    }, {})
  }, [filteredCosts, costCategories])

  const totalCost = useMemo(() => {
    return Object.values(costSummary).reduce((sum, value) => sum + value, 0)
  }, [costSummary])

  const costPerBird = useMemo(() => {
    if (selectedBatchForCost === 'all') {
      const totalBirds = batches.reduce((sum, batch) => sum + batch.poultryCount, 0)
      return totalBirds > 0 ? totalCost / totalBirds : 0
    } else {
      const selectedBatchData = batches.find((batch) => batch.id === parseInt(selectedBatchForCost))
      return selectedBatchData ? totalCost / selectedBatchData.poultryCount : 0
    }
  }, [selectedBatchForCost, batches, totalCost])

  // Cost actions
  const addCostCategory = (category: Omit<CostCategory, 'id'>): void => {
    setCostCategories((prev) => [
      ...prev,
      { ...category, id: Math.max(0, ...prev.map((c) => c.id)) + 1 }
    ])
  }

  const deleteCostCategory = (id: number): void => {
    setCostCategories((prev) => prev.filter((category) => category.id !== id))
  }

  // Reset cost form when editing cost changes
  useEffect(() => {
    if (editingCost) {
      setCostFormData({
        id: editingCost.id,
        type: editingCost.type,
        amount: editingCost.amount,
        date: editingCost.date,
        batchId: editingCost.batchId,
        categoryId: editingCost.categoryId
      })
    } else {
      setCostFormData({
        type: '',
        amount: '',
        date: '',
        batchId: '',
        categoryId: undefined
      })
    }
  }, [editingCost])

  // Schedule state
  const [selectedBatchForSchedule, setSelectedBatchForSchedule] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [editingTaskCategory, setEditingTaskCategory] = useState<TaskCategory | null>(null)
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    type: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    batchId: '',
    category: taskCategories[0]?.name || '',
    notes: ''
  })

  // Schedule actions
  const addTaskCategory = (category: TaskCategory): void => {
    setTaskCategories((prev) => [...prev, category])
  }

  const updateTaskCategory = (updatedCategory: TaskCategory): void => {
    if (!updatedCategory.name || !updatedCategory.color || !updatedCategory.textColor) {
      return // Early return if required fields are missing
    }

    setTaskCategories((prev) =>
      prev.map((cat) =>
        cat.name === updatedCategory.name
          ? {
              name: updatedCategory.name,
              color: updatedCategory.color,
              textColor: updatedCategory.textColor
            }
          : cat
      )
    )
  }

  const deleteTaskCategory = (name: string): void => {
    setTaskCategories((prev) => prev.filter((cat) => cat.name !== name))
  }

  // Schedule computed functions
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(
      (task) =>
        isSameDay(parseISO(task.date), date) &&
        (selectedBatch === null || task.batchId === selectedBatch)
    )
  }

  const getCategoryColor = (categoryName: string): { bg: string; text: string } => {
    const category = taskCategories.find((cat) => cat.name === categoryName)
    return category
      ? { bg: category.color, text: category.textColor }
      : { bg: '#E5E7EB', text: '#374151' }
  }

  const handlePrevMonth = (): void => {
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1))
  }

  const handleNextMonth = (): void => {
    setCurrentDate((prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1))
  }

  // Reset task form when editing task changes
  useEffect(() => {
    if (editingTask) {
      setTaskFormData({
        type: editingTask.type,
        date: editingTask.date,
        batchId: editingTask.batchId.toString(),
        category: editingTask.category,
        notes: editingTask.notes
      })
    } else {
      setTaskFormData({
        type: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        batchId: '',
        category: taskCategories[0]?.name || '',
        notes: ''
      })
    }
  }, [editingTask, taskCategories])

  // Reports state
  const [selectedBatchForReport, setSelectedBatchForReport] = useState('all')

  // Update filtered batches for report
  const filteredBatchesForReport = useMemo(() => {
    return selectedBatch === null ? batches : batches.filter((batch) => batch.id === selectedBatch)
  }, [batches, selectedBatch])

  const growthData = useMemo(() => {
    return filteredBatchesForReport.map((batch) => ({
      name: batch.name,
      data: Array.from({ length: 10 }, (_, i) => ({
        week: i + 1,
        weight: Math.round(100 + Math.random() * 900) // Mock data
      }))
    }))
  }, [filteredBatchesForReport])

  const mortalityData = useMemo(() => {
    return filteredBatchesForReport.map((batch) => ({
      name: batch.name,
      mortality: Math.round(Math.random() * 5) // Mock data
    }))
  }, [filteredBatchesForReport])

  const batchesWithCalculatedAge = useMemo(() => {
    return batches.map((batch) => {
      const startDate = parseISO(batch.details.startDate)
      const ageInDays = differenceInDays(new Date(), startDate)
      return {
        ...batch,
        age: ageInDays >= 0 ? ageInDays : 0
      }
    })
  }, [batches])

  const feedEfficiency = useMemo(() => {
    return filteredBatchesForReport.map((batch) => {
      const batchCosts = costs.filter((cost) => cost.batchId === batch.id && cost.type === 'Feed')
      const totalFeedCost = batchCosts.reduce((sum, cost) => sum + cost.amount, 0)
      const totalWeight = batch.poultryCount * (100 + Math.random() * 900) // Mock total weight
      return {
        name: batch.name,
        efficiency: totalWeight > 0 ? (totalFeedCost / totalWeight).toFixed(2) : '0'
      }
    })
  }, [filteredBatchesForReport, costs])

  const profitability = useMemo(() => {
    return filteredBatchesForReport.map((batch) => {
      const batchCosts = costs.filter((cost) => cost.batchId === batch.id)
      const totalCost = batchCosts.reduce((sum, cost) => sum + cost.amount, 0)
      const revenue = batch.poultryCount * (10 + Math.random() * 5) // Mock revenue per bird
      return {
        name: batch.name,
        profit: (revenue - totalCost).toFixed(2)
      }
    })
  }, [filteredBatchesForReport, costs])

    



  const value = {
    // Core data
    farms,
    batches,
    costs,
    tasks,
    costCategories,
    taskCategories,

    // UI state
    activeSection,
    selectedBatch,
    editingBatch,
    viewingBatch,
    selectedFarm,
    editingFarm,
    selectedCost,
    editingCost,
    selectedTask,
    editingTask,

    // State setters
    setFarms,
    setBatches,
    setCosts,
    setTasks,
    setCostCategories,
    setTaskCategories,
    setActiveSection,
    setSelectedBatch,
    setEditingBatch,
    setViewingBatch,
    setSelectedFarm,
    setEditingFarm,
    setSelectedCost,
    setEditingCost,
    setSelectedTask,
    setEditingTask,

    // Sidebar state and data
    isSidebarOpen,
    setIsSidebarOpen,
    navItems,

    // Actions
    addBatch,
    updateBatch,
    deleteBatch,
    addFarm,
    updateFarm,
    deleteFarm,
    addCost,
    updateCost,
    deleteCost,
    addTask,
    updateTask,
    deleteTask,

    // Computed values
    batchesByFarm,
    currentBatch,
    batchFarm,
    batchesWithCalculatedAge,

    // Add farm form state setters
    farmFormData,
    setFarmFormData,

    // Cost state
    costFormData,
    costFormErrors,
    selectedBatchForCost,
    categoryDialogOpen,

    // Cost state setters
    setCostFormData,
    setCostFormErrors,
    setSelectedBatchForCost,
    setCategoryDialogOpen,

    // Cost actions
    addCostCategory,
    deleteCostCategory,

    // Cost computed values
    filteredCosts,
    costSummary,
    totalCost,
    costPerBird,

    // Schedule state
    selectedBatchForSchedule,
    currentDate,
    isAddTaskOpen,
    isAddCategoryOpen,
    editingTaskCategory,
    taskFormData,

    // Schedule state setters
    setSelectedBatchForSchedule,
    setCurrentDate,
    setIsAddTaskOpen,
    setIsAddCategoryOpen,
    setEditingTaskCategory,
    setTaskFormData,

    // Schedule actions
    addTaskCategory,
    updateTaskCategory,
    deleteTaskCategory,

    // Schedule computed functions
    getTasksForDate,
    getCategoryColor,
    handlePrevMonth,
    handleNextMonth,

    // Reports state and computed values
    selectedBatchForReport,
    setSelectedBatchForReport,
    filteredBatchesForReport,
    growthData,
    mortalityData,
    feedEfficiency,
    profitability,
  }

  return <AppContext.Provider value={value as AppContextType}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
