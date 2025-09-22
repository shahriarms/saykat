
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
import { PlusCircle, Users, UserCheck, UserX, NotebookText, Loader2, BookUser, Download, Printer, ChevronRight, Calendar as CalendarIcon, RotateCw, UserCog } from 'lucide-react';
import { isToday, format, eachDayOfInterval, isSameDay, isFriday, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { useTranslation } from '@/hooks/use-translation';
import dynamic from 'next/dynamic';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReactToPrint } from 'react-to-print';
import { EmployeeAttendanceReport } from '@/components/employee-attendance-report';


const EmployeeDialog = dynamic(() => import('@/components/employee-dialog'), {
    ssr: false,
    loading: () => <Loader2 className="h-5 w-5 animate-spin" />
});

const EmployeeListDialog = dynamic(() => import('@/components/employee-list-dialog'), {
    ssr: false,
    loading: () => <Loader2 className="h-5 w-5 animate-spin" />
});

export default function EmployeesPage() {
    const { employees, attendance, markAttendance, getAttendanceForDate, centralDateRange } = useAppData();
    const { user } = useUser();
    const { t } = useTranslation();
    
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
    
    const [isAddEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
    const [isEmployeeListDialogOpen, setEmployeeListDialogOpen] = useState(false);
    
    const printRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (employees.length > 0 && !selectedEmployee) {
            setSelectedEmployee(employees[0]);
        }
    }, [employees, selectedEmployee]);

    const handleAttendanceChange = (date: Date, status: AttendanceStatus) => {
        if (!selectedEmployee) return;
        if (user?.role !== 'admin' && !isToday(date)) {
            alert("You can only change attendance for today.");
            return;
        }
        markAttendance(selectedEmployee.id, date, status);
    };

    const monthlyAttendanceData = useMemo(() => {
        if (!selectedEmployee) return { report: [], summary: { Present: 0, Absent: 0, Leave: 0 } };

        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const daysInMonth = eachDayOfInterval({ start, end });
        
        const report = daysInMonth.map(day => {
            const record = attendance.find(a => a.employeeId === selectedEmployee.id && isSameDay(new Date(a.date), day));
            return {
                date: day,
                status: record?.status || 'Absent',
            };
        });
        
        const summary = report.reduce((acc, curr) => {
            acc[curr.status]++;
            return acc;
        }, { Present: 0, Absent: 0, Leave: 0 });

        return { report, summary };

    }, [attendance, selectedEmployee, month]);
    
     const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Attendance-Report-${selectedEmployee?.name}-${format(month, 'MMMM-yyyy')}`,
    });

    const getStatusClasses = (status: AttendanceStatus) => {
        switch(status) {
            case 'Present': return "bg-green-100 text-green-700";
            case 'Absent': return "bg-red-100 text-red-700";
            case 'Leave': return "bg-yellow-100 text-yellow-700";
            default: return "";
        }
    };


    return (
        <>
            <div className="flex flex-col gap-6 h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-semibold flex items-center gap-2"><UserCog className="w-6 h-6"/>{t('attendance_page_title')}</h1>
                    <div className="flex gap-2 flex-wrap">
                        <Button onClick={() => setEmployeeListDialogOpen(true)} variant="outline">
                            <Users className="mr-2 h-4 w-4" /> Employee List
                        </Button>
                        <Button onClick={() => setAddEmployeeDialogOpen(true)} disabled={user?.role !== 'admin'}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {t('add_employee_button')}
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 flex-1">
                    <Card className="lg:col-span-1 flex flex-col">
                         <CardHeader>
                            <CardTitle>{t('employee_list_title')}</CardTitle>
                         </CardHeader>
                         <CardContent className="p-0 flex-1">
                            <ScrollArea className="h-full max-h-[calc(100vh-250px)]">
                                <div className="divide-y">
                                    {employees.map((employee) => (
                                    <button
                                        key={employee.id}
                                        onClick={() => setSelectedEmployee(employee)}
                                        className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                                        selectedEmployee?.id === employee.id ? 'bg-muted' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{employee.name}</p>
                                            <p className="text-sm text-muted-foreground">{employee.role}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                    </button>
                                    ))}
                                </div>
                            </ScrollArea>
                         </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 flex flex-col">
                        <CardHeader>
                             <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Attendance for {selectedEmployee ? selectedEmployee.name : "..."}</CardTitle>
                                    <CardDescription>
                                        Viewing attendance for {format(month, 'MMMM yyyy')}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline"><CalendarIcon className="mr-2 h-4 w-4"/> {format(month, 'MMMM yyyy')}</Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar mode="single" month={month} onMonthChange={(m) => m && setMonth(m)} captionLayout="dropdown-buttons" fromYear={2020} toYear={new Date().getFullYear() + 5}/>
                                        </PopoverContent>
                                     </Popover>
                                     <Button onClick={handlePrint} variant="outline" disabled={!selectedEmployee}><Printer className="mr-2 h-4 w-4"/> Print Report</Button>
                                </div>
                            </div>
                        </CardHeader>
                         <CardContent className="flex-1 flex flex-col gap-4">
                             {selectedEmployee ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm w-full">
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"><UserCheck className="w-5 h-5"/> {t('present_label')}: <span className="font-bold">{monthlyAttendanceData.summary.Present}</span></div>
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"><UserX className="w-5 h-5"/> {t('absent_label')}: <span className="font-bold">{monthlyAttendanceData.summary.Absent}</span></div>
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"><NotebookText className="w-5 h-5"/> {t('on_leave_label')}: <span className="font-bold">{monthlyAttendanceData.summary.Leave}</span></div>
                                    </div>
                                    <ScrollArea className="flex-1 h-96 rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Day</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {monthlyAttendanceData.report.map(({date, status}) => (
                                                    <TableRow key={date.toISOString()}>
                                                        <TableCell>{format(date, 'MMM dd, yyyy')}</TableCell>
                                                        <TableCell>{format(date, 'eee')}</TableCell>
                                                        <TableCell>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className={cn("w-24 justify-center font-semibold", getStatusClasses(status))}
                                                                onClick={() => handleAttendanceChange(date, status === 'Present' ? 'Absent' : 'Present')}
                                                            >
                                                                {status}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </>
                             ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground">Select an employee to view their attendance.</div>
                             )}
                         </CardContent>
                    </Card>
                </div>
            </div>

            <div className="print-source">
                {selectedEmployee && (
                    <EmployeeAttendanceReport 
                        ref={printRef}
                        employee={selectedEmployee}
                        month={month}
                        attendanceData={monthlyAttendanceData.report}
                    />
                )}
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
