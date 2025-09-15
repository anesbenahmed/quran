import { addDays, differenceInDays, format } from "date-fns"
import { ar } from "date-fns/locale"

interface DailyRecord {
    day: number
    date: string
    weight: number
    feedConsumption: number
    price: number
    chickenCount: number
  }
  
  export const generateMockData = (startDate: string, initialCount: number): DailyRecord[] => {
    try {
      const data: DailyRecord[] = []
      const start = new Date(startDate)
  
      if (isNaN(start.getTime())) {
        throw new Error('Invalid date')
      }
  
      const today = new Date()
      let daysDifference = differenceInDays(today, start)
      const daysToGenerate = Math.min(Math.max(daysDifference, 1), 50)
  
      const changes: {
        [day: number]: {
          weight?: number
          feedConsumption?: number
          price?: number
          chickenCount?: number
        }
      } = {
        0: {
          weight: 0.1,
          feedConsumption: 0.2,
          price: 200,
          chickenCount: initialCount
        },
        1: {
          weight: 0.2,
          feedConsumption: 0.3,
          price: 202
        }
      }
  
      let lastChangeDay = 0
      let currentValues = { ...changes[0] }
  
      for (let i = 0; i < daysToGenerate; i++) {
        if (changes[i]) {
          const daysFromLastChange = i - lastChangeDay
          if (daysFromLastChange > 1) {
            Object.keys(changes[i]).forEach((key) => {
              const metric = key as keyof typeof currentValues
              if (changes[i][metric] !== undefined) {
                const increment = ((changes[i][metric]! - currentValues[metric]!) / daysFromLastChange)
                for (let j = 1; j < daysFromLastChange; j++) {
                  const dayIndex = lastChangeDay + j
                  data[dayIndex] = {
                    ...data[dayIndex],
                    [metric]: Math.round((currentValues[metric]! + (increment * j)) * 100) / 100
                  }
                }
              }
            })
          }
          currentValues = { ...currentValues, ...changes[i] }
          lastChangeDay = i
        }
  
        data.push({
          day: i + 1,
          date: format(addDays(start, i), 'dd MMM', { locale: ar }),
          weight: currentValues.weight!,
          feedConsumption: currentValues.feedConsumption!,
          price: currentValues.price!,
          chickenCount: currentValues.chickenCount!
        })
      }
      return data
    } catch (error) {
      console.error('Error generating mock data:', error)
      return []
    }
  }
  