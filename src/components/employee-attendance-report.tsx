
'use client';

import React from 'react';
import type { Employee, Attendance } from '@/lib/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { StockPilotLogo } from './stock-pilot-logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from './ui/table';

interface EmployeeAttendanceReportProps {
  employee: Employee;
  month: Date;
  attendanceData: Attendance[];
}

export const EmployeeAttendanceReport = React.memo(React.forwardRef<HTMLDivElement, EmployeeAttendanceReportProps>(
  ({ employee, month, attendanceData }, ref) => {
    const { t } = useTranslation();

    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const reportData = daysInMonth.map(day => {
        const record = attendanceData.find(a => isSameDay(new Date(a.date), day));
        return {
            date: day,
            status: record?.status || 'Absent',
        };
    });
    
    const summary = {
        Present: reportData.filter(r => r.status === 'Present').length,
        Absent: reportData.filter(r => r.status === 'Absent').length,
        Leave: reportData.filter(r => r.status === 'Leave').length,
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
      <div ref={ref} className="bg-white p-8">
        <Card className="w-full max-w-4xl mx-auto shadow-none border-0">
          <CardHeader className="text-center space-y-4">
            <StockPilotLogo className="w-20 h-20 mx-auto" />
            <CardTitle className="text-3xl">{t('shop_name')}</CardTitle>
            <CardDescription className="text-lg">
              Attendance Report for {format(month, 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 my-6 border-y py-4">
                <div>
                    <p><strong className="w-24 inline-block">Employee:</strong> {employee.name}</p>
                    <p><strong className="w-24 inline-block">Role:</strong> {employee.role}</p>
                </div>
                 <div>
                    <p><strong className="w-24 inline-block">Employee ID:</strong> {employee.id}</p>
                    <p><strong className="w-24 inline-block">Joining Date:</strong> {format(new Date(employee.joiningDate), 'PP')}</p>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reportData.map(({ date, status }) => (
                        <TableRow key={date.toISOString()}>
                            <TableCell>{format(date, 'MMMM dd, yyyy')}</TableCell>
                            <TableCell>{format(date, 'eeee')}</TableCell>
                            <TableCell className={getStatusClass(status)}>{status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted">
                        <TableCell colSpan={2} className="font-bold text-right">Total Present</TableCell>
                        <TableCell className="font-bold">{summary.Present}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted">
                        <TableCell colSpan={2} className="font-bold text-right">Total Absent</TableCell>
                        <TableCell className="font-bold">{summary.Absent}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted">
                        <TableCell colSpan={2} className="font-bold text-right">Total Leave</TableCell>
                        <TableCell className="font-bold">{summary.Leave}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
             <div className="flex justify-between mt-24 text-sm">
                <div className="border-t w-64 text-center pt-2">Employee's Signature</div>
                <div className="border-t w-64 text-center pt-2">Manager's Signature</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
));

EmployeeAttendanceReport.displayName = 'EmployeeAttendanceReport';
