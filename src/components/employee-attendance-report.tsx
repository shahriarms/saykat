
'use client';

import React from 'react';
import type { Employee, Attendance } from '@/lib/types';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from './ui/table';

interface AttendanceReportItem {
  date: Date;
  status: Attendance['status'];
}

interface EmployeeAttendanceReportProps {
  employee: Employee;
  month: Date;
  attendanceData: AttendanceReportItem[];
}

export const EmployeeAttendanceReport = React.forwardRef<HTMLDivElement, EmployeeAttendanceReportProps>(
  ({ employee, month, attendanceData }, ref) => {
    const { t } = useTranslation();

    const summary = attendanceData.reduce((acc, curr) => {
        if (curr.status in acc) {
            acc[curr.status]++;
        }
        return acc;
    }, { Present: 0, Absent: 0, Leave: 0 } as Record<Attendance['status'], number>);


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
          <CardHeader className="text-center space-y-4 mb-4">
            <div className="flex justify-center items-center gap-2">
                <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <CardTitle className="text-3xl font-bold tracking-wider">EMPLOYEE ATTENDANCE</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 my-6 border-y py-4 text-sm">
                <div>
                    <p><strong className="w-24 inline-block">Employee:</strong> {employee.name}</p>
                    <p><strong className="w-24 inline-block">Role:</strong> {employee.role}</p>
                </div>
                 <div className="text-right">
                    <p><strong className="w-24 inline-block text-left">Month:</strong> {format(month, 'MMMM, yyyy')}</p>
                    <p><strong className="w-24 inline-block text-left">Joining Date:</strong> {format(new Date(employee.joiningDate), 'PP')}</p>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attendanceData.map(({ date, status }) => (
                        <TableRow key={date.toISOString()}>
                            <TableCell>{format(date, 'MMMM dd, yyyy')}</TableCell>
                            <TableCell>{format(date, 'eeee')}</TableCell>
                            <TableCell className={`text-center ${getStatusClass(status)}`}>{status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-muted">
                        <TableCell colSpan={2} className="font-bold text-right">Total Present</TableCell>
                        <TableCell className="font-bold text-center">{summary.Present}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2} className="font-bold text-right">Total Absent</TableCell>
                        <TableCell className="font-bold text-center">{summary.Absent}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted">
                        <TableCell colSpan={2} className="font-bold text-right">Total Leave</TableCell>
                        <TableCell className="font-bold text-center">{summary.Leave}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
             <div className="flex justify-between mt-24 text-sm">
                <div className="border-t-2 border-gray-400 w-64 text-center pt-2">Employee's Signature</div>
                <div className="border-t-2 border-gray-400 w-64 text-center pt-2">Manager's Signature</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

EmployeeAttendanceReport.displayName = 'EmployeeAttendanceReport';
