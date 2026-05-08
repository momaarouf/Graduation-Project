'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarPickerProps {
 selectedDates: Date[]
 onToggleDate: (date: Date) => void
 highlightedDates?: Date[]
}

export default function CalendarPicker({ selectedDates = [], onToggleDate, highlightedDates = [] }: CalendarPickerProps) {
 const [currentMonth, setCurrentMonth] = useState(new Date())

 const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
 const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

 const year = currentMonth.getFullYear()
 const month = currentMonth.getMonth()

 const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
 const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

 const isSelected = (day: number) => {
 return selectedDates.some(d => 
 d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
 )
 }

 const isHighlighted = (day: number) => {
 return highlightedDates.some(d => 
 d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
 )
 }

 const isToday = (day: number) => {
 const today = new Date()
 return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
 }

 const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1)
 const blanks = Array.from({ length: firstDayOfMonth(year, month) }, (_, i) => i)

 const monthNames = [
"January","February","March","April","May","June",
"July","August","September","October","November","December"
 ]

 const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

 return (
 <div className="p-4 surface-card rounded-2xl border border-theme shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <h4 className="text-sm font-bold text-theme-primary uppercase tracking-wider">
 {monthNames[month]} {year}
 </h4>
 <div className="flex gap-1">
 <button 
 type="button"
 onClick={prevMonth}
 className="p-1.5 hover:surface-section dark:hover:surface-card rounded-lg text-theme-muted transition-colors"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>
 <button 
 type="button"
 onClick={nextMonth}
 className="p-1.5 hover:surface-section dark:hover:surface-card rounded-lg text-theme-muted transition-colors"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="grid grid-cols-7 gap-1 mb-2">
 {weekDays.map(day => (
 <div key={day} className="text-[10px] font-bold text-theme-muted uppercase text-center py-1">
 {day}
 </div>
 ))}
 </div>

 <div className="grid grid-cols-7 gap-1">
 {blanks.map(i => (
 <div key={`blank-${i}`} className="aspect-square" />
 ))}
 {days.map(day => {
 const selected = isSelected(day)
 const highlighted = isHighlighted(day)
 const today = isToday(day)
 
 return (
 <button
 key={day}
 type="button"
 onClick={() => onToggleDate(new Date(year, month, day))}
 className={`
 aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all
 ${selected 
 ? 'bg-primary-light text-white shadow-lg shadow-primary-light/30 scale-105 z-10' 
 : highlighted
 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-success-green dark:border-success-green/50'
 : 'hover:surface-section dark:hover:surface-card text-theme-secondary'
 }
 ${today && !selected ? 'ring-2 ring-primary-light dark:ring-primary-dark/50' : ''}
 `}
 >
 {day}
 </button>
 )
 })}
 </div>
 </div>
 )
}
