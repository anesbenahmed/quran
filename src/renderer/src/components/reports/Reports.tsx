'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card"
import { Button } from "@renderer/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@renderer/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@renderer/components/ui/table"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useAppContext } from '@renderer/context/AppContext'
import { motion } from "framer-motion"
import { FileDown, FileSpreadsheet, TrendingUp, UserMinus, Utensils, DollarSign } from 'lucide-react'

export function Reports() {
  const {
    batches,
    selectedBatch,
    setSelectedBatch,
    growthData,
    mortalityData,
    feedEfficiency,
    profitability
  } = useAppContext()

  const handleExport = (format: 'pdf' | 'excel') => {
    // Implement export functionality (PDF or Excel)
    console.log(`تصدير التقرير بتنسيق ${format}`)
  }

  return (
    <div className="space-y-8 p-6 rtl" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">التقارير</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:gap-x-4">
          <Select
          dir="rtl"
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
          <div className="flex gap-x-2">
            <Button onClick={() => handleExport('pdf')} variant="outline" className="bg-white dark:bg-gray-800">
              <FileDown className="ml-2 h-4 w-4" />
              تصدير PDF
            </Button>
            <Button onClick={() => handleExport('excel')} variant="outline" className="bg-white dark:bg-gray-800">
              <FileSpreadsheet className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <TrendingUp className="ml-2 h-5 w-5 text-emerald-500" />
              اتجاهات النمو
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  {batches.map((batch, index) => (
                    <Line
                      key={batch.id}
                      type="monotone"
                      dataKey={batch.name}
                      stroke={`hsl(${index * 360 / batches.length}, 70%, 50%)`}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <UserMinus className="ml-2 h-5 w-5 text-red-500" />
              معدلات النفوق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mortalityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Bar dataKey="mortality" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Utensils className="ml-2 h-5 w-5 text-yellow-500" />
              كفاءة التغذية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600 dark:text-gray-300">الدفعة</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">كفاءة التغذية (التكلفة لكل كجم نمو)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedEfficiency.map((item) => (
                  <TableRow key={item.name} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-800 dark:text-gray-200">{item.name}</TableCell>
                    <TableCell className="text-emerald-600 dark:text-emerald-400">{item.efficiency} دج</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <DollarSign className="ml-2 h-5 w-5 text-blue-500" />
              الربحية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600 dark:text-gray-300">الدفعة</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">الربح</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profitability.map((item) => (
                  <TableRow key={item.name} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-800 dark:text-gray-200">{item.name}</TableCell>
                    <TableCell className={item.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                      {item.profit} دج
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
