'use client'

import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Calendar, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card"
import { Button } from "@renderer/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@renderer/components/ui/dialog"
import { Input } from "@renderer/components/ui/input"
import { Label } from "@renderer/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@renderer/components/ui/select"
import { Textarea } from "@renderer/components/ui/textarea"
import { cn } from "@renderer/lib/utils"
import { useAppContext } from '@renderer/context/AppContext'
import { TaskCategory } from '@renderer/types'

interface TaskFormProps {
  onClose?: () => void
}

interface CategoryFormProps {
  onClose?: () => void
}

function TaskForm({ onClose }: TaskFormProps) {
  const {
    batches,
    taskCategories,
    taskFormData,
    setTaskFormData,
    addTask,
    updateTask,
    deleteTask,
    editingTask,
    selectedBatch
  } = useAppContext()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target
    setTaskFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const batchId = (taskFormData.batchId || selectedBatch)?.toString()

    if (!batchId || batchId === 'all') {
      return
    }

    const parsedBatchId = parseInt(batchId)

    if (editingTask) {
      updateTask({ ...editingTask, ...taskFormData, batchId: parsedBatchId })
    } else {
      addTask({ ...taskFormData, batchId: parsedBatchId })
    }
    onClose?.()
  }

  const isFormValid = Boolean(
    taskFormData.type &&
    taskFormData.date &&
    (taskFormData.batchId || selectedBatch !== null) &&
    taskFormData.category
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl" dir="rtl">
      <div>
        <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">نوع المهمة</Label>
        <Input id="type" name="type" value={taskFormData.type} onChange={handleChange} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">التاريخ</Label>
        <Input id="date" name="date" type="date" value={taskFormData.date} onChange={handleChange} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="batchId" className="text-sm font-medium text-gray-700 dark:text-gray-300">الدفعة</Label>
        <Select
          name="batchId"
          value={(taskFormData.batchId || selectedBatch)?.toString() || ''}
          onValueChange={(value) => handleChange({ target: { name: 'batchId', value } })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="اختر الدفعة" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((batch) => (
              <SelectItem key={batch.id} value={batch.id.toString()}>{batch.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">الفئة</Label>
        <Select
          name="category"
          value={taskFormData.category}
          onValueChange={(value) => handleChange({ target: { name: 'category', value } })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent>
            {taskCategories.map((category) => (
              <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">ملاحظات</Label>
        <Textarea id="notes" name="notes" value={taskFormData.notes} onChange={handleChange} className="mt-1" />
      </div>
      <div className="flex justify-between">
        <Button type="submit" disabled={!isFormValid} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          {editingTask ? 'تحديث المهمة' : 'إضافة المهمة'}
        </Button>
        {editingTask && (
          <Button type="button" variant="destructive" onClick={() => {
            deleteTask(editingTask.id)
            onClose?.()
          }}>حذف المهمة</Button>
        )}
      </div>
    </form>
  )
}

function CategoryForm({ onClose }: CategoryFormProps) {
  const {
    editingTaskCategory,
    addTaskCategory,
    updateTaskCategory,
    deleteTaskCategory
  } = useAppContext()

  const [formData, setFormData] = useState<TaskCategory>({
    name: editingTaskCategory?.name || '',
    color: editingTaskCategory?.color || '#000000',
    textColor: editingTaskCategory?.textColor || '#FFFFFF'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingTaskCategory) {
      updateTaskCategory({
        ...editingTaskCategory,
        ...formData
      })
    } else {
      addTaskCategory({
        name: formData.name,
        color: formData.color,
        textColor: formData.textColor
      })
    }
    onClose?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl" dir="rtl">
      <div>
        <Label htmlFor="categoryName" className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم الفئة</Label>
        <Input
          id="categoryName"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="أدخل اسم الفئة"
          disabled={!!editingTaskCategory}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="categoryColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">لون الخلفية</Label>
        <Input
          id="categoryColor"
          type="color"
          value={formData.color}
          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          className="mt-1 h-10"
        />
      </div>
      <div>
        <Label htmlFor="categoryTextColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">لون النص</Label>
        <Input
          id="categoryTextColor"
          type="color"
          value={formData.textColor}
          onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
          className="mt-1 h-10"
        />
      </div>
      <div className="flex justify-between">
        <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
          {editingTaskCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
        </Button>
        {editingTaskCategory && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              deleteTaskCategory(editingTaskCategory.name)
              onClose?.()
            }}
          >
            حذف الفئة
          </Button>
        )}
      </div>
    </form>
  )
}

export function Schedules() {
  const {
    batches,
    taskCategories,
    tasks,
    selectedBatch,
    setSelectedBatch,
    currentDate,
    isAddTaskOpen,
    isAddCategoryOpen,
    setIsAddTaskOpen,
    setIsAddCategoryOpen,
    editingTaskCategory,
    setEditingTaskCategory,
    editingTask,
    setEditingTask,
    getTasksForDate,
    getCategoryColor,
    handlePrevMonth,
    handleNextMonth
  } = useAppContext()

  const currentMonthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  return (
    <div className="container mx-auto p-6 space-y-8 rtl" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">الجداول</h1>
        <div className="flex items-center gap-x-4">
          <Select
          dir='rtl'
            value={selectedBatch?.toString() || 'all'}
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
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-emerald-500 text-emerald-500 hover:bg-emerald-50">
                <Plus className="ml-2 h-4 w-4" />
                إضافة فئة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة فئة جديدة</DialogTitle>
              </DialogHeader>
              <CategoryForm onClose={() => setIsAddCategoryOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Plus className="ml-2 h-4 w-4" />
                إضافة مهمة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مهمة جديدة</DialogTitle>
              </DialogHeader>
              <TaskForm onClose={() => setIsAddTaskOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-semibold text-gray-800 dark:text-gray-200">
            <Tag className="ml-2 h-5 w-5" />
            الفئات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {taskCategories.map((category) => (
              <div
                key={category.name}
                className="p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                style={{
                  backgroundColor: category.color,
                  color: category.textColor
                }}
                onClick={() => setEditingTaskCategory(category)}
              >
                <div className="font-semibold">{category.name}</div>
                <div className="text-sm mt-2">
                  المهام: {tasks.filter(task => task.category === category.name).length}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <Calendar className="ml-2 h-6 w-6" />
            {format(currentDate, 'MMMM yyyy', { locale: ar })}
          </CardTitle>
          <div className="flex items-center gap-x-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
              <div key={day} className="text-center font-medium p-2 text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
            {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2" />
            ))}
            {currentMonthDays.map((date, index) => {
              const dayTasks = getTasksForDate(date)
              return (
                <div
                  key={index}
                  className={cn(
                    "p-2 border rounded-md min-h-[100px] transition-colors duration-200",
                    !isSameMonth(date, currentDate) && "bg-gray-100 dark:bg-gray-700",
                    isSameDay(date, new Date()) && "bg-emerald-100 dark:bg-emerald-900"
                  )}
                >
                  <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{format(date, 'd')}</div>
                  <div className="space-y-1">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="text-xs p-1 rounded cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200"
                        style={{
                          backgroundColor: getCategoryColor(task.category).bg,
                          color: getCategoryColor(task.category).text
                        }}
                        onClick={() => setEditingTask(task)}
                      >
                        <div className="font-semibold">{task.type}</div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] italic">
                            {batches.find(b => b.id === task.batchId)?.name}
                          </span>
                          <span className="text-[10px] bg-white bg-opacity-50 rounded px-1">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل المهمة</DialogTitle>
            </DialogHeader>
            <TaskForm onClose={() => setEditingTask(null)} />
          </DialogContent>
        </Dialog>
      )}

      {editingTaskCategory && (
        <Dialog open={!!editingTaskCategory} onOpenChange={() => setEditingTaskCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الفئة</DialogTitle>
            </DialogHeader>
            <CategoryForm onClose={() => setEditingTaskCategory(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
