
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import type { Employee, AttendanceStatus } from '@/lib/types';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PlusCircle, CalendarIcon, Users, UserCheck, UserX, NotebookText, Loader2, RotateCw } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from '@/hooks/use-translation';
import dynamic from 'next/dynamic';

const EmployeeDialog = dynamic(() => import('@/components/employee-dialog'), {
    ssr: false,
    loading: () => <Loader2 className="h-5 w-5 animate-spin" />
});

const EmployeeListDialog = dynamic(() => import('@/components/employee-list-dialog'), {
    ssr: false,
    loading: () => <Loader2 className="h-5 w-5 animate-spin" />
});

export default function EmployeesPage() {
    const { employees, markAttendance, getAttendanceForDate, getAttendanceForMonth, centralDateRange } = useAppData();
    const { user } = useUser();
    const { t } = useTranslation();
    
    const [isAddEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
    const [isEmployeeListDialogOpen, setEmployeeListDialogOpen] = useState(false);
    
    const [localDate, setLocalDate] = useState<Date>(centralDateRange?.from || new Date());

    useEffect(() => {
        if (centralDateRange?.from && !isToday(centralDateRange.from)) {
            setLocalDate(centralDateRange.from);
        } else if (!localDate) {
             setLocalDate(new Date());
        }
    }, [centralDateRange]);

    const handleResetDate = useCallback(() => {
        setLocalDate(centralDateRange?.from || new Date());
    }, [centralDateRange]);

    const dailyAttendance = useMemo(() => getAttendanceForDate(localDate), [getAttendanceForDate, localDate]);
    
    const handleAttendanceChange = (employeeId: string, status: AttendanceStatus) => {
        if (user?.role !== 'admin' && !isToday(localDate)) {
            alert("You can only change attendance for the current day.");
            return;
        }
        markAttendance(employeeId, localDate, status);
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

    return (
        <>
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-semibold flex items-center gap-2"><Users className="w-6 h-6"/>{t('attendance_page_title')}</h1>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn("w-full sm:w-[280px] justify-start text-left font-normal")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {localDate ? format(localDate, "PPP") : <span>{t('pick_a_date')}</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={localDate}
                            onSelect={(date) => setLocalDate(date || new Date())}
                            captionLayout="dropdown-buttons"
                            fromYear={2020}
                            toYear={new Date().getFullYear() + 5}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={handleResetDate}>
                        <RotateCw className="h-4 w-4" />
                        <span className="sr-only">Reset Date</span>
                    </Button>
                    <Button onClick={() => setEmployeeListDialogOpen(true)} variant="outline">
                        <Users className="mr-2 h-4 w-4" /> Employee List
                    </Button>
                    <Button onClick={() => setAddEmployeeDialogOpen(true)} disabled={user?.role !== 'admin'}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('add_employee_button')}
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {/* Attendance Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('daily_attendance_title')}</CardTitle>
                        <CardDescription>{t('daily_attendance_description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm w-full">
                                <div className="flex items-center gap-2 p-2 rounded-md bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"><UserCheck className="w-5 h-5"/> {t('present_label')}: <span className="font-bold">{attendanceSummary.present}</span></div>
                                <div className="flex items-center gap-2 p-2 rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"><UserX className="w-5 h-5"/> {t('absent_label')}: <span className="font-bold">{attendanceSummary.absent}</span></div>
                                <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"><NotebookText className="w-5 h-5"/> {t('on_leave_label')}: <span className="font-bold">{attendanceSummary.leave}</span></div>
                            </div>
                        </div>

                        <div className="rounded-md border overflow-auto max-h-96">
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
