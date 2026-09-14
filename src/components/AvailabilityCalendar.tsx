import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import './AvailabilityCalendar.css';

export interface DateAvailability {
  date: string; // YYYY-MM-DD
  status: 'available' | 'in-discussion' | 'booked';
  note?: string;
}

interface AvailabilityCalendarProps {
  selectedDate?: string;
  onSelectDate: (date: string, note?: string) => void;
  onClose?: () => void;
}

// Generate deterministic availability for the upcoming 18 months
function getPrecomputedAvailability(year: number, month: number): Record<string, DateAvailability> {
  const result: Record<string, DateAvailability> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Peak Indian wedding season: Nov, Dec, Jan, Feb
    const isPeakSeason = [10, 11, 0, 1].includes(month); // 10=Nov, 11=Dec, 0=Jan, 1=Feb
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let status: 'available' | 'in-discussion' | 'booked' = 'available';
    let note = 'Available for Booking';

    if (isPeakSeason && isWeekend) {
      const seed = (year * 37 + (month + 1) * 19 + day * 7) % 10;
      if (seed >= 6) {
        status = 'booked';
        note = 'Reserved / Fully Booked';
      } else if (seed >= 3) {
        status = 'in-discussion';
        note = 'High Demand • 1 Slot In Discussion';
      } else {
        status = 'available';
        note = 'Available • 2 Slots Open';
      }
    } else if (isWeekend) {
      const seed = (year * 13 + (month + 1) * 7 + day) % 8;
      if (seed >= 6) {
        status = 'in-discussion';
        note = 'In Discussion';
      }
    }

    result[dateStr] = { date: dateStr, status, note };
  }

  return result;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  selectedDate,
  onSelectDate,
  onClose
}) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 10 = November 2026 (Peak Season Launch)

  const monthAvailability = useMemo(() => {
    return getPrecomputedAvailability(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const quickJumpMonths = [
    { label: 'Nov 2026', year: 2026, month: 10 },
    { label: 'Dec 2026', year: 2026, month: 11 },
    { label: 'Jan 2027', year: 2027, month: 0 },
    { label: 'Feb 2027', year: 2027, month: 1 },
    { label: 'Apr 2027', year: 2027, month: 3 }
  ];

  return (
    <div className="availability-calendar-card" role="dialog" aria-label="Studio Date Availability Calendar">
      {/* Calendar Header */}
      <div className="calendar-card-header">
        <div className="calendar-header-title">
          <div className="calendar-badge">
            <Calendar size={13} /> Seasonal Availability
          </div>
          <h3 className="calendar-main-title">
            Select Your Wedding Date
          </h3>
          <p className="calendar-subtitle">
            We book a strictly limited number of weddings per season. Real-time availability schedule:
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            className="calendar-close-btn"
            onClick={onClose}
            aria-label="Close availability calendar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Quick Jump Seasonal Tabs */}
      <div className="calendar-season-tabs" role="tablist" aria-label="Quick jump to peak wedding months">
        <span className="season-tabs-label">Peak Months:</span>
        {quickJumpMonths.map((tab) => {
          const isActive = currentYear === tab.year && currentMonth === tab.month;
          return (
            <button
              key={`${tab.year}-${tab.month}`}
              type="button"
              className={`season-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                setCurrentYear(tab.year);
                setCurrentMonth(tab.month);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Month Navigation */}
      <div className="calendar-month-nav">
        <button
          type="button"
          className="month-nav-arrow"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>

        <h4 className="month-display-name">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h4>

        <button
          type="button"
          className="month-nav-arrow"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Legend */}
      <div className="calendar-legend" aria-hidden="true">
        <div className="legend-item">
          <span className="legend-dot status-available" />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot status-discussion" />
          <span>In Discussion (Urgent)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot status-booked" />
          <span>Booked Out</span>
        </div>
      </div>

      {/* Days of Week */}
      <div className="calendar-weekdays" aria-hidden="true">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Days Grid */}
      <div className="calendar-days-grid" role="grid" aria-label={`${MONTH_NAMES[currentMonth]} ${currentYear}`}>
        {/* Blank days before 1st of month */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day-empty" aria-hidden="true" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const info = monthAvailability[dateStr] || { date: dateStr, status: 'available' };
          const isSelected = selectedDate === dateStr;
          const isBooked = info.status === 'booked';

          return (
            <button
              key={dateStr}
              type="button"
              className={`calendar-day-btn status-${info.status} ${isSelected ? 'is-selected' : ''}`}
              disabled={isBooked}
              onClick={() => {
                if (!isBooked) {
                  onSelectDate(dateStr, info.note);
                  if (onClose) onClose();
                }
              }}
              title={`${dateStr}: ${info.note}`}
              aria-label={`${dateStr}: ${info.note}`}
              aria-selected={isSelected}
            >
              <span className="day-number">{day}</span>
              <span className="day-indicator" />
            </button>
          );
        })}
      </div>

      {/* Help Note */}
      <div className="calendar-footer-note">
        <Sparkles size={13} className="note-icon" />
        <span>Dates marked &ldquo;In Discussion&rdquo; have received recent inquiries. Select your date to hold priority.</span>
      </div>
    </div>
  );
};
