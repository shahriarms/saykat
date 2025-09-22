

'use client';

import * as React from 'react';
import { addDays, format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon, RotateCw } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from './ui/use-toast';

interface DateRangePickerProps {
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  initialDateRange?: DateRange;
  onDateChange: (range: DateRange | undefined) => void;
  centralDateRange?: DateRange;
}

export function DateRangePicker({
  className,
  initialDateRange,
  onDateChange,
  centralDateRange,
}: DateRangePickerProps) {
  const { toast } = useToast();
  const [date, setDate] = React.useState<DateRange | undefined>(initialDateRange);
  const [month, setMonth] = React.useState<Date | undefined>(initialDateRange?.from);
  const [mode, setMode] = React.useState<'range' | 'month'>('range');

  React.useEffect(() => {
    setDate(initialDateRange);
  }, [initialDateRange]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    if (newDate?.from && newDate?.to && differenceInDays(newDate.to, newDate.from) > 365) {
      toast({
        variant: 'destructive',
        title: 'Date Range Too Large',
        description: 'The selected date range cannot be longer than 1 year.',
      });
      return;
    }
    setDate(newDate);
    onDateChange(newDate);
  };
  
  const handleMonthSelect = (selectedMonth: Date | undefined) => {
    if (selectedMonth) {
        setMonth(selectedMonth);
        const newRange = {
            from: startOfMonth(selectedMonth),
            to: endOfMonth(selectedMonth),
        };
        handleDateChange(newRange);
    }
  }

  const handleReset = () => {
    handleDateChange(centralDateRange);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full sm:w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'range' | 'month')} className="w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="range">Custom Range</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <TabsContent value="range">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleDateChange}
                    numberOfMonths={2}
                    captionLayout="dropdown-buttons"
                    fromYear={2020}
                    toYear={new Date().getFullYear() + 5}
                />
            </TabsContent>
            <TabsContent value="month">
                 <Calendar
                    initialFocus
                    mode="single"
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={handleMonthSelect}
                    captionLayout="dropdown-buttons"
                    fromYear={2020}
                    toYear={new Date().getFullYear() + 5}
                />
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      {centralDateRange && <Button variant="outline" size="icon" onClick={handleReset}><RotateCw className="h-4 w-4" /></Button>}
    </div>
  );
}
