'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card"
import { Button } from "@renderer/components/ui/button"
import { Input } from "@renderer/components/ui/input"
import { Label } from "@renderer/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@renderer/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@renderer/components/ui/table"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Batch, Cost, CostCategory } from '@renderer/types'
import { useAppContext } from '@renderer/context/AppContext'
import { motion } from "framer-motion"
import { DollarSign, Tag, Plus, Edit, Trash2 } from 'lucide-react'

export function Costs() {
  const {
    batches,
    costCategories,
    selectedBatch,
    setSelectedBatch,
    editingCost,
    setEditingCost,
    addCost,
    updateCost,
    deleteCost,
    addCostCategory,
    deleteCostCategory,
    setCategoryDialogOpen,
    filteredCosts,
    costSummary,
    totalCost,
    costPerBird
  } = useAppContext()

  return (
    <div className="space-y-8 p-6 rtl" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">التكاليف</h1>
        <div className="flex items-center gap-x-4">
          <Select
          dir='rtl'
            value={selectedBatch?.toString() ?? 'all'}
            onValueChange={(value) => setSelectedBatch(value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر الدفعة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الدفعات</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id.toString()}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Tag className="ml-2 h-4 w-4" />
                إدارة الفئات
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>فئات التكاليف</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {costCategories.map((category) => (
                  <div key={category.id} className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCostCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة فئة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <CategoryForm
                      onSubmit={addCostCategory}
                      onClose={() => setCategoryDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Plus className="ml-2 h-4 w-4" />
                إضافة تكلفة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CostForm
                onSubmit={addCost}
                batches={batches}
                costCategories={costCategories}
                cost={null}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent>
            <CostSummary costSummary={costSummary} totalCost={totalCost} costPerBird={costPerBird} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">تفصيل التكاليف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(costSummary).map(([category, amount]) => ({
                      name: category,
                      value: Number(amount)
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#10B981"
                    dataKey="value"
                  >
                    {Object.entries(costSummary).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)} دج`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">قائمة التكاليف</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-right'>نوع المصروف</TableHead>
                  <TableHead className='text-right'>المبلغ</TableHead>
                  <TableHead className='text-right'>التاريخ</TableHead>
                  <TableHead className='text-right'>الدفعة</TableHead>
                  <TableHead className='text-right'>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>{cost.type}</TableCell>
                    <TableCell>{cost.amount.toFixed(2)} دج</TableCell>
                    <TableCell>{cost.date}</TableCell>
                    <TableCell>{batches.find(b => b.id === cost.batchId)?.name || 'غير متوفر'}</TableCell>
                    <TableCell>
                      <div className="flex gap-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setEditingCost(cost)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <CostForm cost={editingCost} onSubmit={(cost) => updateCost(cost as Cost)} batches={batches} costCategories={costCategories} />
                          </DialogContent>
                        </Dialog>
                        <Button variant="destructive" onClick={() => deleteCost(cost.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function CostSummary({ costSummary, totalCost, costPerBird }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(costSummary).map(([category, amount], index) => (
        <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{category}</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{(amount as number).toFixed(2)} دج</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي التكلفة</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCost.toFixed(2)} دج</div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">التكلفة لكل طائر</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{costPerBird.toFixed(2)} دج</div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function CostForm({ cost = null, onSubmit, batches, costCategories }: CostFormProps) {
  const [formData, setFormData] = useState<CostFormData>({
    id: cost?.id,
    type: cost?.type || '',
    amount: cost?.amount || '',
    date: cost?.date || '',
    batchId: cost?.batchId || '',
    categoryId: cost?.categoryId
  })
  const [errors, setErrors] = useState<CostFormErrors>({})

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setErrors({ ...errors, [name]: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: CostFormErrors = {}
    if (!formData.type) newErrors.type = 'نوع المصروف مطلوب'
    if (!formData.amount) newErrors.amount = 'المبلغ مطلوب'
    if (!formData.date) newErrors.date = 'التاريخ مطلوب'
    if (!formData.batchId) newErrors.batchId = 'الدفعة مطلوبة'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount.toString()),
      batchId: parseInt(formData.batchId.toString()),
      categoryId: costCategories.find(cat => cat.name === formData.type)?.id || 0
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rtl" dir="rtl">
      <DialogHeader>
        <DialogTitle>{formData.id ? 'تعديل التكلفة' : 'إضافة تكلفة'}</DialogTitle>
        <DialogDescription>
          {formData.id ? 'قم بتعديل تفاصيل التكلفة أدناه.' : 'أضف تكلفة جديدة إلى نظام إدارة الدواجن الخاص بك.'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="type">فئة التكلفة</Label>
          <Select
            name="type"
            value={formData.type}
            onValueChange={(value) => handleChange({ target: { name: 'type', value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {costCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
        </div>
        <div>
          <Label htmlFor="amount">المبلغ</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
        </div>
        <div>
          <Label htmlFor="date">التاريخ</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
        </div>
        <div>
          <Label htmlFor="batchId">الدفعة</Label>
          <Select
            name="batchId"
            value={formData.batchId.toString()}
            onValueChange={(value) => handleChange({ target: { name: 'batchId', value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الدفعة" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id.toString()}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.batchId && <p className="text-red-500 text-sm mt-1">{errors.batchId}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">{formData.id ? 'تحديث التكلفة' : 'إضافة التكلفة'}</Button>
      </DialogFooter>
    </form>
  )
}

function CategoryForm({ onSubmit, onClose }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name) return
    onSubmit({ name })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="rtl" dir="rtl">
      <DialogHeader>
        <DialogTitle>إضافة فئة تكلفة</DialogTitle>
        <DialogDescription>
          قم بإنشاء فئة جديدة للتكاليف.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="name">اسم الفئة</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسم الفئة"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">إضافة الفئة</Button>
      </DialogFooter>
    </form>
  )
}
