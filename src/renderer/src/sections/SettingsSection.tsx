import React from "react"
import { useAppContext } from "../context/AppContext"
import { Card, CardContent } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export default function SettingsSection() {
  const { settings, setTheme } = useAppContext()

  return (
    <div className="h-full w-full flex items-center justify-center" dir="rtl">
      <Card className="w-full max-w-xl">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold arabic-ui">الإعدادات</h2>
            <p className="text-sm text-neutral-500 mt-1 arabic-ui">تخصيص واجهة التطبيق</p>
          </div>

          <div className="space-y-2">
            <Label className="arabic-ui">المظهر</Label>
            <Select value={settings.theme} onValueChange={(v) => setTheme(v as any)}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="المظهر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">النظام</SelectItem>
                <SelectItem value="light">فاتح</SelectItem>
                <SelectItem value="dark">داكن</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
