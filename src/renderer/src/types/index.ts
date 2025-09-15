export interface Farm {
  id: number
  name: string
  location: string
  size: number
  batches: number
  poultryCount: number
  lastUpdated: string
}

export interface DailyRecord {
  day: number
  date: string
  weight?: number
  feedConsumed?: number
  mortality?: number
  eggCount?: number
  notes?: string
}

export interface BatchDetails {
  initialChickCost: number
  mortalityRate: number
  startDate: string
  expectedEndDate?: string
  dailyRecords: DailyRecord[]
  growthPeriod?: number
  targetWeight?: number
  sellingPricePerKg?: number
  feedConversionRatio?: number
  currentWeight?: number
  eggProductionStart?: number
  dailyEggCount?: number
  layingRate?: number
  eggSellingPrice?: number
  feedRecords: {
    type: string
    quantity: number
    costPerKg: number
    startAge: number
    endAge: number
  }[]
}

export interface Batch {
  id: number
  name: string
  type: 'Broiler' | 'Layer'
  chickPrice: number
  farmId: number
  poultryCount: number
  details: BatchDetails
  startDate: string
  status?: 'empty' | 'active'
}

export interface Cost {
  id: number
  type: string
  categoryId: number
  amount: number
  date: string
  batchId: number
}

export interface CostCategory {
  id: number
  name: string
}

export interface Task {
  id: number
  type: string
  date: string
  batchId: number
  notes: string
  category: string
}

export interface TaskCategory {
  name: string
  color: string
  textColor: string
}

export interface BatchesProps {
  batches: Batch[]
  farms: Farm[]
  editingBatch: Batch | null
  setEditingBatch: (batch: Batch | null) => void
  onAddBatch: (batch: Omit<Batch, 'id'>) => void
  onEditBatch: (batch: Batch) => void
  onDeleteBatch: (id: number) => void
}

export interface BatchFormProps {
  batch?: Batch | null
  onSubmit: (data: BatchFormData) => void
  farms: Farm[]
}

export interface BatchFormData {
  name: string
  type: 'Broiler' | 'Layer'
  farmId: number
  chickPrice: number
  poultryCount: number
  details: BatchDetails
  startDate: string
}

export interface CostsProps {
  costs: Cost[]
  batches: Batch[]
  costCategories: CostCategory[]
  selectedBatch: string
  setSelectedBatch: (batchId: string) => void
  editingCost: Cost | null
  setEditingCost: (cost: Cost | null) => void
  onAddCost: (cost: Omit<Cost, 'id'>) => void
  onEditCost: (cost: Cost) => void
  onDeleteCost: (id: number) => void
  onAddCostCategory: (category: Omit<CostCategory, 'id'>) => void
  onDeleteCostCategory: (id: number) => void
}

export interface SchedulesProps {
  tasks: Task[]
  batches: Batch[]
  categories: TaskCategory[]
  selectedBatch: string
  setSelectedBatch: (batchId: string) => void
  onAddTask: (task: Omit<Task, 'id'>) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: number) => void
  onAddCategory: (category: TaskCategory) => void
  onUpdateCategory: (category: TaskCategory) => void
  onDeleteCategory: (name: string) => void
}

export interface DashboardProps {
  farms: Farm[]
  batches: Batch[]
  costs: Cost[]
  tasks: Task[]
}

export interface ReportsProps {
  farms: Farm[]
  batches: Batch[]
  costs: Cost[]
  selectedBatch: string
  setSelectedBatch: (batchId: string) => void
}
