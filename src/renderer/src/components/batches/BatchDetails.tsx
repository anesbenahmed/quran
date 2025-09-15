'use client'

import { useState, useCallback } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Input } from '@renderer/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@renderer/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useAppContext } from '@renderer/context/AppContext'
import { generateMockData } from '@renderer/utils'

interface DailyRecord {
  day: number
  date: string
  weight: number
  feedConsumption: number
  price: number
  chickenCount: number
}




export function BatchDetails() {
  const { currentBatch, totalCost, setSelectedBatch } = useAppContext()


  const [selectedMetric, setSelectedMetric] = useState('weight')
  const [currentWeek, setCurrentWeek] = useState(0)
  const [manuallyChangedDays, setManuallyChangedDays] = useState<{
    [key: string]: { [day: number]: number }
  }>({});

  const [isEditMode, setIsEditMode] = useState(false);
  const [tempChanges, setTempChanges] = useState<{
    [field: string]: { [day: number]: number }
  }>({});

  const [editDialog, setEditDialog] = useState({
    isOpen: false,
    day: 0,
    metric: '',
    value: '',
    label: ''
  });

  const [tempValue, setTempValue] = useState('');

  const formatNumberWithSpaces = (num: number, includeSign: boolean = false): { firstPart: string, secondPart: string, decimal: string } => {
    const formattedNum = Math.abs(num).toFixed(2);
    const [integerPart, decimalPart] = formattedNum.split('.');
    
    // Split into two parts
    const secondPart = integerPart.slice(-4);  // Last 4 digits
    const firstPart = integerPart.slice(0, -4) || '';  // Everything before last 4 digits, or '0' if empty

    return {
      secondPart,
      decimal: decimalPart,

      firstPart,
    };
  };

  const [batchData, setBatchData] = useState(() => {
    const defaultStartDate = format(new Date(), 'yyyy-MM-dd')
    const startDate = currentBatch?.startDate || defaultStartDate
    const count = currentBatch?.poultryCount || 5000
    try {
      new Date(startDate).toISOString()
      return generateMockData(startDate, count)
    } catch (error) {
      console.error('Invalid date:', startDate)
      return generateMockData(defaultStartDate, count)
    }
  })


  

  console.log(batchData)

  const handleInputChange = (changedDay: number, field: string, value: string) => {
    const newValue = parseFloat(value) || 0;

    setBatchData((prevData) => {
      // Find the last change before this day
      let lastChangeDay = 0;
      let lastChangeValue = prevData[0][field as keyof DailyRecord] as number;

      // Look through previous changes to find the most recent one
      Object.entries(manuallyChangedDays[field] || {}).forEach(([day, value]) => {
        const dayNum = parseInt(day);
        if (dayNum < changedDay - 1 && dayNum > lastChangeDay) {
          lastChangeDay = dayNum;
          lastChangeValue = value;
        }
      });

      // Calculate increment between last change and new change
      const daysFromLastChange = changedDay - 1 - lastChangeDay;
      const valueDifference = newValue - lastChangeValue;
      const dailyIncrement = valueDifference / daysFromLastChange;

      // Update the changed days tracking after finding last change
      setManuallyChangedDays(prev => ({
        ...prev,
        [field]: {
          ...(prev[field] || {}),
          [changedDay - 1]: newValue
        }
      }));

      return prevData.map((item, index) => {
        // If this is the changed day or any day after, use the new value
        if (index >= changedDay - 1) {
          return { ...item, [field]: newValue };
        }

        // If this is a previously changed day, keep its value
        if (manuallyChangedDays[field]?.[index] !== undefined) {
          return item;
        }

        // If this day is between last change and new change, interpolate
        if (index > lastChangeDay && index < changedDay - 1) {
          const daysAfterLastChange = index - lastChangeDay;
          const calculatedValue = lastChangeValue + (dailyIncrement * daysAfterLastChange);
          return { ...item, [field]: Math.round(calculatedValue * 100) / 100 };
        }

        // Keep current value for all other days
        return item;
      });
    });
  };

  const handleEditClick = (day: number, metric: string, currentValue: number, label: string) => {
    setEditDialog({
      isOpen: true,
      day,
      metric,
      value: currentValue.toString(),
      label
    });
    setTempValue(currentValue.toString());
  };

  const handleSaveEdit = () => {
    if (editDialog.day && editDialog.metric) {
      // Store in temporary changes instead of applying immediately
      setTempChanges(prev => ({
        ...prev,
        [editDialog.metric]: {
          ...(prev[editDialog.metric] || {}),
          [editDialog.day - 1]: parseFloat(tempValue) || 0
        }
      }));
    }
    setEditDialog({ isOpen: false, day: 0, metric: '', value: '', label: '' });
  };

  const handleConfirmChanges = () => {
    // Apply all temporary changes
    Object.entries(tempChanges).forEach(([field, changes]) => {
      Object.entries(changes).forEach(([day, value]) => {
        handleInputChange(parseInt(day) + 1, field, value.toString());
      });
    });
    // Clear temporary changes and exit edit mode
    setTempChanges({});
    setIsEditMode(false);
  };

  const handleCancelChanges = () => {
    setTempChanges({});
    setIsEditMode(false);
  };

  const handleMetricClick = useCallback((metric: string) => {
    setSelectedMetric(metric)
  }, [])

  const handleBackClick = () => {
    setSelectedBatch(null)
  }

  const changeWeek = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentWeek((prev) => {
        if (direction === 'prev' && prev > 0) {
          return prev - 1
        } else if (direction === 'next' && prev < Math.ceil(batchData.length / 7) - 1) {
          return prev + 1
        }
        return prev
      })
    },
    [batchData.length]
  )

  const currentWeekData = batchData.slice(
    currentWeek * 7,
    Math.min((currentWeek + 1) * 7, batchData.length)
  )

  const metricColors = {
    weight: '#8884d8',
    feedConsumption: '#82ca9d',
    price: '#ffc658',
    chickenCount: '#ff8042'
  }

  const metricLabels = {
    weight: 'الوزن (كغ)',
    feedConsumption: 'استهلاك العلف (كغ)',
    price: 'السعر (دج/كغ)',
    chickenCount: 'عدد الدجاج'
  }

  return (
    <div className="p-6 rtl bg-gray-50 dark:bg-gray-900 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">{currentBatch?.name}</h1>
        <Button
          variant="outline"
          onClick={handleBackClick}
          className="flex items-center"
        >
          العودة إلى القائمة
          <ArrowLeft className="w-4 h-4 mr-2" />
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-emerald-500">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            تفاصيل الدفعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">نوع الدجاج</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentBatch?.type === 'Broiler' ? 'دجاج لاحم' : 'دجاج بياض'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">العمر</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentBatch?.startDate
                  ? differenceInDays(new Date(), new Date(currentBatch?.startDate))
                  : 0} يوم
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                تاريخ البداية
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentBatch?.startDate
                  ? format(new Date(currentBatch?.startDate), 'yyyy/MM/dd')
                  : 'غير محدد'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">عدد الطيور الأولي</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentBatch?.poultryCount}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                تكلفة الكتكوت
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentBatch?.chickPrice} دج
              </p>
            </div>
            <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                تكلفة الكتاكيت
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {(() => {
                  const totalPrice = (currentBatch?.poultryCount || 0) * (currentBatch?.chickPrice || 0);
                  const parts = formatNumberWithSpaces(totalPrice);
                  return ` ${parts.secondPart}.${parts.decimal} ${parts.firstPart} دج`;
                })()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              التكلفة الاجمالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(() => {
                const parts = formatNumberWithSpaces(totalCost);
                return `${parts.firstPart} ${parts.secondPart}.${parts.decimal} ${parts.firstPart} دج`;
              })()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              القيمة الحالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const age = currentBatch?.startDate
                ? differenceInDays(new Date(), new Date(currentBatch.startDate))
                : 0;
              
              if (age < 30) {
                return (
                  <div className="text-lg font-semibold text-gray-900">
لا يمكن البيع
                    <span className="text-sm text-gray-500 mx-2">
                      ({30 - age} يوم متبقي)
                    </span>
                  </div>
                );
              }

              const lastRecord = batchData[batchData.length - 1];
              if (!lastRecord) return <div className="text-2xl font-bold">--</div>;
              
              const currentValue = lastRecord.weight * lastRecord.price * (lastRecord.chickenCount || 0);
              const parts = formatNumberWithSpaces(currentValue);
              return (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {`${parts.secondPart}.${parts.decimal} ${parts.firstPart} دج`}
                </div>
              );
            })()}
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              الربح / الخسارة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const lastRecord = batchData[batchData.length - 1];
              const age = currentBatch?.startDate
                ? differenceInDays(new Date(), new Date(currentBatch.startDate))
                : 0;
              
              if (age < 30) {
                const parts = formatNumberWithSpaces(totalCost);
                return (
                  <div dir="rtl" className="text-2xl font-bold text-red-500">
                     {parts.secondPart}.{parts.decimal} {parts.firstPart}- دج
                  </div>
                );
              }

              if (!lastRecord) return <div className="text-2xl font-bold">--</div>;

              const currentValue = lastRecord.weight * lastRecord.price * (lastRecord.chickenCount || 0);
              const profit = currentValue - totalCost;
              const color = profit >= 0 ? 'text-green-500' : 'text-red-500';
              const parts = formatNumberWithSpaces(Math.abs(profit));
              
              return (
                <div dir="rtl" className={`text-2xl font-bold ${color}`}>
 {parts.secondPart}.{parts.decimal} {parts.firstPart}{profit >= 0 ? '+' : '-'} دج
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              عدد الدجاج الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(() => {
                const lastRecord = batchData[batchData.length - 1];
                return lastRecord ? lastRecord.chickenCount : '--';
              })()} طائر
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              السعر الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(() => {
                const lastRecord = batchData[batchData.length - 1];
                return lastRecord ? `${lastRecord.price.toFixed(2)} دج` : '--';
              })()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              متوسط الوزن الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {(() => {
                const lastRecord = batchData[batchData.length - 1];
                return lastRecord ? `${lastRecord.weight.toFixed(2)} كغ` : '--';
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  بيانات الأسبوع {currentWeek + 1}
                </CardTitle>
                <div className="flex gap-2">
                  {!isEditMode ? (
                    <Button onClick={() => setIsEditMode(true)}>
                      تعديل البيانات
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCancelChanges}>
                        إلغاء
                      </Button>
                      <Button onClick={handleConfirmChanges}>
                        تأكيد التغييرات
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeWeek('prev')}
                    disabled={currentWeek === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeWeek('next')}
                    disabled={currentWeek === Math.ceil(batchData.length / 7) - 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right bg-gray-50 dark:bg-gray-700">
                        البيانات
                      </TableHead>
                      {currentWeekData.map((day) => (
                        <TableHead
                          key={day.day}
                          className="text-center whitespace-nowrap bg-gray-50 dark:bg-gray-700"
                        >
                          يوم {day.day}
                          <br />
                          {day.date}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(metricLabels).map(([metric, label]) => (
                      <TableRow
                        key={metric}
                        className={`cursor-pointer transition-colors ${selectedMetric === metric ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        onClick={() => handleMetricClick(metric)}
                      >
                        <TableCell className="font-medium">{label}</TableCell>
                        {currentWeekData.map((day) => (
                          <TableCell key={day.day} className="p-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex-1 text-center">
                                {tempChanges[metric]?.[day.day - 1] !== undefined
                                  ? tempChanges[metric][day.day - 1]
                                  : day[metric as keyof DailyRecord]}
                              </span>
                              {isEditMode && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(
                                      day.day,
                                      metric,
                                      tempChanges[metric]?.[day.day - 1] !== undefined
                                        ? tempChanges[metric][day.day - 1]
                                        : day[metric as keyof DailyRecord] as number,
                                      label
                                    );
                                  }}
                                >
                                  تعديل
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                التغير: {metricLabels[selectedMetric]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={batchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={metricColors[selectedMetric]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              تعديل {editDialog.label} - يوم {editDialog.day}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog(prev => ({ ...prev, isOpen: false }))}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
