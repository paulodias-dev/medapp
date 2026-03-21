import { capitalizeFirstLetter } from '@/app/utils';
import { Button } from '@/views/components/ui/button';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { useState } from 'react';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}

export function Calendar({ onDateSelect }: CalendarProps) {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [activeDate, setActiveDate] = useState<Date>(new Date());

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const renderCalendar = () => {
    const weekDays = Array.from({ length: 7 }, (_, day) => (
      <div
        key={day}
        className="text-gray-500 m-auto cursor-default text-center">
        {capitalizeFirstLetter(
          format(addDays(startOfWeek(activeDate), day), 'EEEEEE'),
        )}
      </div>
    ));

    const startOfTheMonth = startOfMonth(activeDate);
    const endOfTheMonth = endOfMonth(activeDate);
    const startDate = startOfWeek(startOfTheMonth);
    const endDate = endOfWeek(endOfTheMonth);

    const weeks = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const week = Array.from({ length: 7 }, () => {
        const date = currentDate;
        const isPastDate = isBefore(startOfDay(date), today);
        const isSelectedDate = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);
        currentDate = addDays(currentDate, 1);

        return (
          <div
            key={date.toString()}
            className={`w-10 h-10 flex justify-center items-center m-auto rounded-xl transition-colors ${
              isSameMonth(date, activeDate) ? '' : 'text-gray-400'
            } ${isPastDate ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-gray-100'} ${
              isToday && !isSelectedDate ? 'ring-1 ring-blue-200' : ''
            } ${isSelectedDate ? 'bg-primary text-white hover:bg-primary' : ''}`}
            onClick={() => {
              if (isPastDate) return;
              handleDateSelect(date);
            }}>
            {format(date, 'd')}
          </div>
        );
      });

      weeks.push(
        <div key={currentDate.toString()} className="grid grid-cols-7">
          {week}
        </div>,
      );
    }

    return (
      <>
        <div className="grid grid-cols-7">{weekDays}</div>
        <div>{weeks}</div>
      </>
    );
  };

  return (
    <div className="flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between pb-4">
        <Button
          variant="outline"
          onClick={() => {
            const today = new Date();
            setSelectedDate(today);
            setActiveDate(today);
            if (onDateSelect) {
              onDateSelect(today);
            }
          }}>
          Hoje
        </Button>

        <h3 className="text-base">
          {capitalizeFirstLetter(format(activeDate, 'MMMM yyyy'))}
        </h3>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setActiveDate(subMonths(activeDate, 1))}>
            <CaretLeft className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setActiveDate(addMonths(activeDate, 1))}>
            <CaretRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {renderCalendar()}
    </div>
  );
}
