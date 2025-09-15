import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { BatchFormData, Batch, Farm } from '@renderer/types/index'
import { useAppContext } from '../../context/AppContext'
import { BatchDetails } from './BatchDetails'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'

export function Batches() {
  const {
    batches,
    farms,
    batchesByFarm,
    selectedBatch,
    editingBatch,
    addBatch,
    updateBatch,
    deleteBatch,
    setSelectedBatch,
    setEditingBatch,
    addTask
  } = useAppContext()
  const [open, setOpen] = useState(false)


  const handleBatchClick = (batchId: number) => {
    setSelectedBatch(batchId)
  }

  if (selectedBatch) {
    return <BatchDetails />
  }


  return (
    <div className="space-y-8 p-6 rtl" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">الدفعات</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md">
              <PlusCircle className="w-4 h-4 ml-2" />
              إضافة دفعة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
          <BatchForm onSubmit={(data) => {
              // Add the batch first
              addBatch(data)

              // Create predefined tasks for the batch
              const batchId = batches.length + 1 // New batch ID will be the next number
              const startDate = new Date(data.startDate)

              // Add vaccination tasks
              const vaccination1Date = new Date(startDate)
              vaccination1Date.setDate(startDate.getDate() + 8)
              addTask({
                type: 'تطعيم',
                date: vaccination1Date.toISOString().split('T')[0],
                batchId: batchId,
                category: 'Health',
                notes: 'التطعيم الأول - اليوم الثامن'
              })

              const vaccination2Date = new Date(startDate)
              vaccination2Date.setDate(startDate.getDate() + 15)
              addTask({
                type: 'تطعيم',
                date: vaccination2Date.toISOString().split('T')[0],
                batchId: batchId,
                category: 'Health',
                notes: 'التطعيم الثاني - اليوم الخامس عشر'
              })

              // Add feed change tasks
              const feed1Date = new Date(startDate)
              feed1Date.setDate(startDate.getDate() + 3)
              addTask({
                type: 'تغيير العلف',
                date: feed1Date.toISOString().split('T')[0],
                batchId: batchId,
                category: 'Daily',
                notes: 'تغيير العلف الأول - اليوم الثالث'
              })

              const feed2Date = new Date(startDate)
              feed2Date.setDate(startDate.getDate() + 10)
              addTask({
                type: 'تغيير العلف',
                date: feed2Date.toISOString().split('T')[0],
                batchId: batchId,
                category: 'Daily',
                notes: 'تغيير العلف الثاني - اليوم العاشر'
              })

              setOpen(false)
            }} farms={farms} />
                      </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {batchesByFarm.map(
          ({ farm, batches }) =>
            batches.length > 0 && (
              <Card
                key={farm.id}
                className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-emerald-500"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {farm.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="text-right text-gray-600 dark:text-gray-400">
          اسم الدفعة
        </TableHead>
        <TableHead className="text-right text-gray-600 dark:text-gray-400">
          نوع الدواجن
        </TableHead>
        <TableHead className="text-right text-gray-600 dark:text-gray-400">
          عدد الطيور
        </TableHead>
        <TableHead className="text-right text-gray-600 dark:text-gray-400">
          تاريخ البداية
        </TableHead>
        <TableHead className="text-right text-gray-600 dark:text-gray-400">
          الحالة
        </TableHead>
        <TableHead className="text-right text-gray-600 dark:text-gray-400">
          الإجراءات
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
  {batches.map((batch) => (
    <TableRow
      key={batch.id}
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
      onClick={(e) => {
        // Only handle row click if not clicking on buttons
        if (!(e.target as HTMLElement).closest('button')) {
          handleBatchClick(batch.id)
        }
      }}
    >
      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
        {batch.name}
      </TableCell>
      <TableCell className="text-gray-600 dark:text-gray-400">
        {batch.type === 'Broiler' ? 'دجاج لاحم' : 'دجاج بياض'}
      </TableCell>
      <TableCell className="text-gray-600 dark:text-gray-400">
        {batch.poultryCount}
      </TableCell>
      <TableCell className="text-gray-600 dark:text-gray-400">
        {batch.startDate}
      </TableCell>
      <TableCell>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            batch.status === 'empty'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          {batch.status === 'empty' ? 'فارغة' : 'نشطة'}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-400 dark:hover:bg-emerald-900"
                onClick={(e) => {
                  e.stopPropagation() // Stop event from reaching the row
                  setEditingBatch(batch)
                }}
              >
                <Edit className="w-4 h-4 ml-2" />
                تعديل
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[425px]"
              onClick={(e) => e.stopPropagation()} // Prevent clicks in dialog from triggering row click
            >
              {editingBatch && (
                <BatchForm
                  batch={editingBatch}
                  onSubmit={(batchFormData) => {
                    updateBatch({ ...batchFormData, id: editingBatch.id })
                    setEditingBatch(null) // Clear editing state after update
                  }}
                  farms={farms}
                />
              )}
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900"
            onClick={(e) => {
              e.stopPropagation() // Stop event from reaching the row
              deleteBatch(batch.id)
            }}
          >
            <Trash2 className="w-4 h-4 ml-2" />
            حذف
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
  </Table>
</CardContent>
              </Card>
            )
        )}

        {batches.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="py-8">
              <p className="text-center text-gray-500 dark:text-gray-400">
                لم يتم العثور على دفعات. انقر على "إضافة دفعة" لإنشاء أول دفعة.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function BatchForm({
  batch = null,
  onSubmit,
  farms
}: {
  batch?: Batch | null
  onSubmit: (batchFormData: BatchFormData) => void
  farms: Farm[]
}) {
  const [formData, setFormData] = useState<BatchFormData>({
    name: batch?.name || '',
    type: batch?.type || 'Broiler',
    chickPrice: batch?.chickPrice || 0,
    farmId: batch?.farmId || 0,
    poultryCount: batch?.poultryCount || 0,
    startDate: batch?.details?.startDate || new Date().toISOString().split('T')[0],
    details: batch?.details || {
      initialChickCost: 0,
      mortalityRate: 0,
      startDate: new Date().toISOString().split('T')[0],
      dailyRecords: [],
      feedRecords: []
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'farmId' || name === 'poultryCount' ? Number(value) : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'farmId' ? Number(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)

  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rtl" dir="rtl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {batch ? 'تعديل الدفعة' : 'إضافة دفعة'}
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400">
          {batch
            ? 'قم بتعديل تفاصيل الدفعة أدناه.'
            : 'أضف دفعة جديدة إلى نظام إدارة الدواجن الخاص بك.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            اسم الدفعة
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <div>
          <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            نوع الدواجن
          </Label>
          <Select
          dir='rtl'
            name="type"
            value={formData.type}
            onValueChange={(value) => handleSelectChange('type', value)}
          >
            <SelectTrigger className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Broiler">دجاج لاحم</SelectItem>
              <SelectItem value="Layer">دجاج بياض</SelectItem>
              <SelectItem value="Breeder">دجاج أمهات</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="farmId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            المزرعة
          </Label>
          <Select
          dir='rtl'
            name="farmId"
            value={formData.farmId.toString()}
            onValueChange={(value) => handleSelectChange('farmId', value)}
          >
            <SelectTrigger className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
              <SelectValue placeholder="اختر المزرعة" />
            </SelectTrigger>
            <SelectContent>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id.toString()}>
                  {farm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label
            htmlFor="poultryCount"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            عدد الطيور
          </Label>
          <Input
            id="poultryCount"
            name="poultryCount"
            type="number"
            value={formData.poultryCount}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <div>
  <Label htmlFor="chickPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
    سعر الكتكوت
  </Label>
  <Input
    id="chickPrice"
    name="chickPrice"
    type="number"
    value={formData.chickPrice}
    onChange={handleChange}
    required
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
  />
</div>
        <div>
          <Label
            htmlFor="startDate"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            تاريخ البدء
          </Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md">
          {batch ? 'تحديث الدفعة' : 'إضافة الدفعة'}
        </Button>
      </DialogFooter>
    </form>
  )
}
