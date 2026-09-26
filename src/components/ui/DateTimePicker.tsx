import { useState, useRef, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth, setHours, setMinutes, parseISO, isValid } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'

export function DateTimePicker({
  value,
  onChange,
  className
}: {
  value: string; // ISO string
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const parsedDate = value ? parseISO(value) : new Date();
  const validDate = isValid(parsedDate) ? parsedDate : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(validDate));
  
  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const handleDaySelect = (day: Date) => {
    // Keep existing time
    const newDate = new Date(day);
    newDate.setHours(validDate.getHours());
    newDate.setMinutes(validDate.getMinutes());
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hours' | 'minutes') => {
    const val = parseInt(e.target.value) || 0;
    let newDate = new Date(validDate);
    if (type === 'hours') {
      newDate = setHours(newDate, val);
    } else {
      newDate = setMinutes(newDate, val);
    }
    onChange(newDate.toISOString());
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-11 w-full rounded-xl border border-white/20 bg-white/[0.04] backdrop-blur-xl px-4 py-2 text-sm text-text shadow-inner transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 focus:bg-white/[0.07]",
          "hover:border-white/30 items-center justify-between",
          className
        )}
      >
        <span>{value ? format(validDate, "MMM d, yyyy h:mm a") : "Select date & time"}</span>
        <Calendar className="w-4 h-4 text-muted" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 p-4 rounded-2xl glass-card border-white/10 shadow-2xl animate-slide-up origin-top">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-text transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-text">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-text transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-[10px] font-semibold text-muted uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
            {days.map((day, idx) => {
              const isSelected = isSameDay(day, validDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDaySelect(day)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-primary text-black shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                      : isCurrentMonth
                      ? "text-text hover:bg-white/10"
                      : "text-muted/40 hover:text-muted hover:bg-white/5"
                  )}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>

          {/* Time Picker */}
          <div className="border-t border-white/10 pt-3 mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">Time</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="23"
                value={validDate.getHours().toString().padStart(2, '0')}
                onChange={e => handleTimeChange(e, 'hours')}
                className="w-12 h-8 bg-black/40 border border-white/10 rounded-lg text-center text-xs text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              />
              <span className="text-muted">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={validDate.getMinutes().toString().padStart(2, '0')}
                onChange={e => handleTimeChange(e, 'minutes')}
                className="w-12 h-8 bg-black/40 border border-white/10 rounded-lg text-center text-xs text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
