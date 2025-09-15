import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card"
import { Button } from "@renderer/components/ui/button"
import { Input } from "@renderer/components/ui/input"
import { Label } from "@renderer/components/ui/label"
import { Textarea } from "@renderer/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog"
import { useAppContext } from '@renderer/context/AppContext'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'

interface FarmFormProps {
  onClose?: () => void
}

export function Farms() {
  const {
    farms,
    setEditingFarm,
    deleteFarm
  } = useAppContext()

  return (
    <div className="space-y-8 p-6 rtl" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">المزارع</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md">
              <PlusCircle className="w-4 h-4 ml-2" />
              إضافة مزرعة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <FarmForm onClose={() => setEditingFarm(null)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <Card key={farm.id} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">{farm.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">الموقع:</span> {farm.location}</p>
                <p><span className="font-medium">الدفعات:</span> {farm.batches}</p>
                <p><span className="font-medium">إجمالي الدواجن:</span> {farm.poultryCount}</p>
                <p><span className="font-medium">آخر تحديث:</span> {farm.lastUpdated}</p>
              </div>
              <div className="flex justify-start gap-x-2 mt-4">
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600 shadow-md" onClick={() => deleteFarm(farm.id)}>
                <Trash2 className="w-4 h-4 ml-2" />
                حذف
              </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-400 dark:hover:bg-emerald-900" onClick={() => setEditingFarm(farm)}>
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <FarmForm onClose={() => setEditingFarm(null)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function FarmForm({ onClose }: FarmFormProps) {
  const {
    editingFarm,
    addFarm,
    updateFarm,
    farmFormData,
    setFarmFormData
  } = useAppContext()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFarmFormData({
      ...farmFormData,
      [name]: name === 'size' ? Number(value) : value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingFarm) {
      updateFarm({
        ...editingFarm,
        ...farmFormData,
        lastUpdated: new Date().toISOString().split('T')[0]
      })
    } else {
      addFarm({
        ...farmFormData,
        batches: 0,
        poultryCount: 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      })
    }
    onClose?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rtl" dir="rtl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {editingFarm ? 'تعديل المزرعة' : 'إضافة مزرعة'}
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400">
          {editingFarm ? 'قم بتعديل تفاصيل المزرعة أدناه.' : 'أضف مزرعة جديدة إلى نظام إدارة الدواجن الخاص بك.'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم المزرعة</Label>
          <Input
            id="name"
            name="name"
            value={farmFormData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <div>
          <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">الموقع</Label>
          <Input
            id="location"
            name="location"
            value={farmFormData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <div>
          <Label htmlFor="size" className="text-sm font-medium text-gray-700 dark:text-gray-300">المساحة (بالفدان)</Label>
          <Input
            id="size"
            name="size"
            type="number"
            value={farmFormData.size}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</Label>
          <Textarea
            id="description"
            name="description"
            value={farmFormData.description || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md">
          {editingFarm ? 'تحديث المزرعة' : 'إضافة المزرعة'}
        </Button>
      </DialogFooter>
    </form>
  )
}
