import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  isToday,
  isSameDay,
} from 'date-fns';

import { motion } from 'framer-motion';

import { useDoctorAvailability } from "../hooks/useApi";
import { Spinner } from './ui/ui';

export default function BookingCalendar({
  doctorId,
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
}) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const today = new Date();

  // 🔥 API call
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const { data: availability, isLoading: slotsLoading } =
    useDoctorAvailability(doctorId, dateStr);

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });

  const startPad = getDay(startOfMonth(viewMonth));

  const canGoPrev =
    viewMonth.getFullYear() > today.getFullYear() ||
    viewMonth.getMonth() > today.getMonth();

  return (
    <div className="space-y-4">

      {/* 🔥 Calendar */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[16px] p-5
shadow-[0_10px_40px_rgba(0,0,0,0.08)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() =>
              canGoPrev && setViewMonth(subMonths(viewMonth, 1))
            }
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all border ${
              canGoPrev
                ? 'border-white/15 text-text-muted hover:border-amber-400 hover:text-amber-400'
                : 'border-white/5 text-text-faint cursor-not-allowed'
            }`}
          >
            ‹
          </button>

          <div className="font-serif text-[17px] text-white">
            {format(viewMonth, 'MMMM yyyy')}
          </div>

          <button
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center text-sm text-text-muted hover:border-amber-400 hover:text-amber-400 transition-all"
          >
            ›
          </button>
        </div>

        {/* Days header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
            <div key={d} className="text-center text-[10px] text-text-faint py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}

          {days.map((day) => {
            const isPast = isBefore(day, today) && !isToday(day);
            const isTodayDay = isToday(day);
            const isSelected =
              selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                disabled={isPast}
                onClick={() => !isPast && onSelectDate(day)}
                className={`h-9 w-9 mx-auto flex items-center justify-center rounded-[9px] text-[12px]
                  ${isPast ? 'text-white/15 cursor-not-allowed' : 'hover:bg-white/10'}
                  ${isTodayDay && !isSelected ? 'border border-amber-400 text-amber-400' : ''}
                  ${isSelected ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white' : 'text-text-muted'}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔥 Time Slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
         whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[16px] p-5
shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
        >
          <h4 className="text-[13px] text-slate-800 mb-4">
            Available times — {format(selectedDate, 'MMM d, yyyy')}
          </h4>

          {slotsLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : !availability?.available ? (
            <p className="text-[13px] text-text-faint text-center py-6">
              No availability on this day
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availability?.slots?.map(({ time, available }) => (
                <button
                  key={time}
                  disabled={!available}
                  onClick={() => available && onSelectSlot(time)}
                  className={`py-2.5 rounded-[9px] text-[12px] border
                    ${
                      !available
                        ? 'border-white/5 text-white/20 cursor-not-allowed line-through'
                        : selectedSlot === time
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
                        : 'border-white/15 text-text-muted hover:border-amber-400'
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}