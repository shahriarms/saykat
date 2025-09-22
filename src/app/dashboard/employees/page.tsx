
'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import type { Employee, Attendance, AttendanceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Users, UserCheck, UserX, NotebookText, Loader2, BookUser, Download, Printer } from 'lucide-react';
import { isToday, format, eachDayOfInterval, isSameDay, isFriday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { useTranslation } from '@/hooks/use-translation';
import dynamic from 'next/dynamic';
import type { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/date-range-picker';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

const EmployeeDialog = dynamic(() => import('@/components/employee-dialog'), {
    ssr: false,
    loading: () => <Loader2 className="h-5 w-5 animate-spin" />
});

const EmployeeListDialog = dynamic(() => import('@/components/employee-list-dialog'), {
    ssr: false,
    loading: () => <Loader2 className="h-5 w-5 animate-spin" />
});

export default function EmployeesPage() {
    const { employees, attendance: allAttendance, markAttendance, getAttendanceForDate, centralDateRange } = useAppData();
    const { user } = useUser();
    const { t } = useTranslation();
    const printRef = useRef<HTMLDivElement>(null);
    
    const [isAddEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
    const [isEmployeeListDialogOpen, setEmployeeListDialogOpen] = useState(false);
    
    const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(centralDateRange);

    const singleDateForDailyView = useMemo(() => localDateRange?.from || new Date(), [localDateRange]);

    useEffect(() => {
        setLocalDateRange(centralDateRange);
    }, [centralDateRange]);

    const dailyAttendance = useMemo(() => getAttendanceForDate(singleDateForDailyView), [getAttendanceForDate, singleDateForDailyView]);

    const handleAttendanceChange = (employeeId: string, status: AttendanceStatus) => {
        if (user?.role !== 'admin' && !isToday(singleDateForDailyView)) {
            alert("You can only change attendance for the current day.");
            return;
        }
        markAttendance(employeeId, singleDateForDailyView, status);
    };

    const getStatusForEmployee = (employeeId: string): AttendanceStatus => {
        return dailyAttendance.find(a => a.employeeId === employeeId)?.status || 'Absent';
    };
    
    const attendanceSummary = useMemo(() => {
        const present = dailyAttendance.filter(a => a.status === 'Present').length;
        const leave = dailyAttendance.filter(a => a.status === 'Leave').length;
        const absent = employees.length - present - leave;
        return { present, absent, leave };
    }, [dailyAttendance, employees.length]);

    const getStatusColorClass = (status: AttendanceStatus) => {
        switch (status) {
            case 'Present':
                return 'bg-green-100 text-green-800 focus:ring-green-500 border-green-200';
            case 'Absent':
                return 'bg-red-100 text-red-800 focus:ring-red-500 border-red-200';
            case 'Leave':
                return 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500 border-yellow-200';
            default:
                return '';
        }
    };
    
    // Logic from former AttendanceRegisterDialog
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Attendance-Register-${localDateRange ? format(localDateRange.from!, 'MMMM-yyyy') : ''}`,
    });

    const { days, rangeTitle, attendanceData } = useMemo(() => {
        const from = localDateRange?.from;
        const to = localDateRange?.to;

        if (!from || !to) {
            return { days: [], rangeTitle: 'No date range selected', attendanceData: [] };
        }

        const daysInInterval = eachDayOfInterval({ start: from, end: to });
        
        const title = `${format(from, 'MMMM yyyy')}`;

        const data = employees.map(employee => {
            const employeeAttendance = allAttendance.filter(a => a.employeeId === employee.id);
            const attendanceByDay = new Map<string, Attendance['status']>();
            
            daysInInterval.forEach(day => {
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

        return { days: daysInInterval, rangeTitle: title, attendanceData: data };

    }, [localDateRange, employees, allAttendance]);

    const handleExport = () => {
        const header = ["Employee Name", ...days.map(d => format(d, "dd")), "P", "A", "L"];
        const body = attendanceData.map(({ employee, attendanceByDay, summary }) => {
            const row: (string | number)[] = [employee.name];
            days.forEach(day => {
                const status = attendanceByDay.get(format(day, 'yyyy-MM-dd')) || 'A';
                row.push(status.charAt(0));
            });
            row.push(summary.P, summary.A, summary.L);
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
        <>
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-semibold flex items-center gap-2"><Users className="w-6 h-6"/>{t('attendance_page_title')}</h1>
                <div className="flex gap-2 flex-wrap">
                   <DateRangePicker
                        initialDateRange={localDateRange}
                        onDateChange={setLocalDateRange}
                        centralDateRange={centralDateRange}
                    />
                    <Button onClick={() => setEmployeeListDialogOpen(true)} variant="outline">
                        <Users className="mr-2 h-4 w-4" /> Employee List
                    </Button>
                    <Button onClick={() => setAddEmployeeDialogOpen(true)} disabled={user?.role !== 'admin'}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('add_employee_button')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('daily_attendance_title')}</CardTitle>
                        <CardDescription>
                            {t('daily_attendance_description')} Use the date picker to view or edit attendance for a specific day.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm w-full">
                                <div className="flex items-center gap-2 p-2 rounded-md bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"><UserCheck className="w-5 h-5"/> {t('present_label')}: <span className="font-bold">{attendanceSummary.present}</span></div>
                                <div className="flex items-center gap-2 p-2 rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"><UserX className="w-5 h-5"/> {t('absent_label')}: <span className="font-bold">{attendanceSummary.absent}</span></div>
                                <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"><NotebookText className="w-5 h-5"/> {t('on_leave_label')}: <span className="font-bold">{attendanceSummary.leave}</span></div>
                            </div>
                        </div>

                        <div className="rounded-md border overflow-auto max-h-[30rem]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('employee_name_header')}</TableHead>
                                        <TableHead className="hidden sm:table-cell">{t('role_header')}</TableHead>
                                        <TableHead className="text-right">{t('attendance_status_header')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map(employee => {
                                        const status = getStatusForEmployee(employee.id);
                                        return (
                                            <TableRow key={employee.id}>
                                                <TableCell className="font-medium">
                                                    {employee.name}
                                                    <div className="text-muted-foreground text-xs sm:hidden">{employee.role}</div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">{employee.role}</TableCell>
                                                <TableCell className="text-right">
                                                    <Select
                                                        value={status}
                                                        onValueChange={(newStatus) => handleAttendanceChange(employee.id, newStatus as AttendanceStatus)}
                                                    >
                                                        <SelectTrigger className={cn("w-32 ml-auto font-semibold", getStatusColorClass(status))}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Present">{t('present_label')}</SelectItem>
                                                            <SelectItem value="Absent">{t('absent_label')}</SelectItem>
                                                            <SelectItem value="Leave">{t('on_leave_label')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                 <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Monthly Attendance Register</CardTitle>
                                <CardDescription>Showing attendance for {rangeTitle}.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
                                <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                       <div className="overflow-auto h-[40rem] rounded-b-lg border-t" ref={printRef}>
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
                    </CardContent>
                </Card>
            </div>
        </div>

        {isAddEmployeeDialogOpen && <EmployeeDialog
            open={isAddEmployeeDialogOpen}
            onOpenChange={setAddEmployeeDialogOpen}
            employee={null}
        />}

        {isEmployeeListDialogOpen && <EmployeeListDialog
            open={isEmployeeListDialogOpen}
            onOpenChange={setEmployeeListDialogOpen}
        />}
        </>
    );
}
