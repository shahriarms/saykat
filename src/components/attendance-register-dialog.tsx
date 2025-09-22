
'use client';

import { useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Printer } from 'lucide-react';
import type { Employee, Attendance } from '@/lib/types';
import { useAppData } from '@/hooks/use-app-data';
import { format, eachDayOfInterval, isSameDay, isFriday, startOfMonth, endOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';

interface AttendanceRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange?: DateRange;
}

export default function AttendanceRegisterDialog({ open, onOpenChange, dateRange }: AttendanceRegisterDialogProps) {
    const { employees, attendance: allAttendance } = useAppData();
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Attendance-Register-${dateRange ? format(dateRange.from!, 'MMMM-yyyy') : ''}`,
    });

    const { days, rangeTitle, attendanceData } = useMemo(() => {
        const from = dateRange?.from || startOfMonth(new Date());
        const to = dateRange?.to || endOfMonth(from);

        const days = eachDayOfInterval({ start: from, end: to });
        
        const title = `${format(from, 'MMMM yyyy')}`;

        const data = employees.map(employee => {
            const employeeAttendance = allAttendance.filter(a => a.employeeId === employee.id);
            const attendanceByDay = new Map<string, Attendance['status']>();
            
            days.forEach(day => {
                const attendanceRecord = employeeAttendance.find(a => isSameDay(new Date(a.date), day));
                attendanceByDay.set(format(day, 'yyyy-MM-dd'), attendanceRecord?.status || 'Absent');
            });
            
            const summary = {
                P: Array.from(attendanceByDay.values()).filter(s => s === 'Present').length,
                A: Array.from(attendanceByDay.values()).filter(s => s === 'Absent').length,
                L: Array.from(attendanceByDay.values()).filter(s => s === 'Leave').length,
            };

            return { employee, attendanceByDay, summary };
        });

        return { days, rangeTitle: title, attendanceData: data };

    }, [dateRange, employees, allAttendance]);

    const handleExport = () => {
        const header = ["Employee Name", ...days.map(d => format(d, "dd"))];
        const body = attendanceData.map(({ employee, attendanceByDay }) => {
            const row: (string | number)[] = [employee.name];
            days.forEach(day => {
                const status = attendanceByDay.get(format(day, 'yyyy-MM-dd')) || 'A';
                row.push(status.charAt(0));
            });
            return row;
        });

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
        XLSX.writeFile(workbook, `Attendance_Register_${rangeTitle}.xlsx`);
    };

    const getStatusClass = (status: Attendance['status']) => {
        switch (status) {
            case 'Present': return 'text-green-600 font-bold';
            case 'Absent': return 'text-red-600 font-bold';
            case 'Leave': return 'text-yellow-600 font-bold';
            default: return '';
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-7xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Attendance Register</DialogTitle>
                    <DialogDescription>
                        Showing attendance for {rangeTitle}.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Register</Button>
                    <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export as Excel</Button>
                </div>

                <div className="flex-1 overflow-auto border rounded-lg" ref={printRef}>
                    <div className="p-4 print:p-2">
                        <div className="text-center mb-4 hidden print:block">
                            <h2 className="text-xl font-bold">Mahmud Engineering Shop</h2>
                            <h3 className="text-lg">Attendance Register - {rangeTitle}</h3>
                        </div>
                        <div className="relative overflow-auto">
                            <table className="w-full border-collapse text-xs whitespace-nowrap">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="sticky left-0 bg-muted border p-2 z-10 min-w-[150px]">Employee</th>
                                        {days.map(day => (
                                            <th key={day.toString()} className={cn("border p-1 text-center", isFriday(day) && 'bg-muted-foreground/20')}>
                                                <div>{format(day, 'dd')}</div>
                                                <div className="font-normal text-muted-foreground">{format(day, 'E')}</div>
                                            </th>
                                        ))}
                                        <th className="border p-1 text-center bg-primary/20">P</th>
                                        <th className="border p-1 text-center bg-primary/20">A</th>
                                        <th className="border p-1 text-center bg-primary/20">L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.map(({ employee, attendanceByDay, summary }) => (
                                        <tr key={employee.id}>
                                            <td className="sticky left-0 bg-background border p-2 font-medium z-10">{employee.name}</td>
                                            {days.map(day => {
                                                const status = attendanceByDay.get(format(day, 'yyyy-MM-dd')) || 'Absent';
                                                return (
                                                    <td key={day.toString()} className={cn("border p-1 text-center", isFriday(day) && 'bg-muted-foreground/10')}>
                                                        <span className={getStatusClass(status)}>{status.charAt(0)}</span>
                                                    </td>
                                                );
                                            })}
                                            <td className="border p-1 text-center font-bold bg-primary/10">{summary.P}</td>
                                            <td className="border p-1 text-center font-bold bg-primary/10">{summary.A}</td>
                                            <td className="border p-1 text-center font-bold bg-primary/10">{summary.L}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
