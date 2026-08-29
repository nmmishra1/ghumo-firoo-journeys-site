import React, { useState, useEffect } from "react"
import { Calendar, Clock } from "lucide-react"

export interface FestivalCountdownProps {
  targetDate: string // e.g. "2026-11-01T00:00:00"
  title?: string
}

export function FestivalCountdown({ targetDate, title = "Rann Utsav Festival Launch" }: FestivalCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isCompleted: false,
      }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (timeLeft.isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#0B1026] text-white border border-[#C9A25A]/20 rounded-luxury-md shadow-luxury-md">
        <h3 className="text-xl font-display text-[#C9A25A] mb-2">{title}</h3>
        <p className="text-sm font-sans font-light">The Grand Desert Festival has officially commenced!</p>
      </div>
    )
  }

  const timeBlocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ]

  return (
    <div className="bg-[#0B1026] text-white rounded-luxury-md p-8 border border-[#C9A25A]/20 shadow-luxury-md max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C9A25A] font-semibold font-display">
        <Calendar className="h-4 w-4" /> Countdown to Magic
      </div>
      <h3 className="text-2xl font-display font-extrabold text-white text-center">
        {title}
      </h3>
      <div className="grid grid-cols-4 gap-4 sm:gap-6 w-full max-w-md">
        {timeBlocks.map((block) => (
          <div key={block.label} className="flex flex-col items-center p-3 bg-white/5 border border-white/10 rounded-luxury-sm">
            <span className="text-2xl sm:text-4xl font-display font-bold text-[#C9A25A]">
              {String(block.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">
              {block.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 font-light font-sans flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-[#C9A25A]" /> Target Launch: Nov 01, 2026
      </p>
    </div>
  )
}
export default FestivalCountdown
