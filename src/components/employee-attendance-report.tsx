
'use client';

import React from 'react';
import type { Employee, AttendanceStatus } from '@/lib/types';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from './ui/table';

interface AttendanceReportItem {
  date: Date;
  status: AttendanceStatus;
}

interface EmployeeAttendanceReportProps {
  employee: Employee;
  month: Date;
  attendanceData: AttendanceReportItem[];
}

const EmployeeAttendanceReport = React.forwardRef<HTMLDivElement, EmployeeAttendanceReportProps>(
  ({ employee, month, attendanceData }, ref) => {
    const { t } = useTranslation();

    const summary = attendanceData.reduce((acc, curr) => {
        if (curr.status in acc) {
            acc[curr.status]++;
        }
        return acc;
    }, { Present: 0, Absent: 0, Leave: 0 } as Record<AttendanceStatus, number>);


    const getStatusClass = (status: AttendanceStatus) => {
        switch (status) {
            case 'Present': return 'text-green-600 font-bold';
            case 'Absent': return 'text-red-600 font-bold';
            case 'Leave': return 'text-yellow-600 font-bold';
            default: return '';
        }
    };

    return (
      <div ref={ref} className="bg-white p-4">
        <Card className="mx-auto shadow-none border-0 bg-white text-black">
          <CardHeader className="text-center space-y-1 mb-2">
            <div className="flex justify-center items-center gap-2">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <CardTitle className="text-xl font-bold tracking-wider">EMPLOYEE ATTENDANCE</CardTitle>
            </div>
             <CardDescription className="text-sm">
                Report for the month of {format(month, 'MMMM, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex justify-between items-center my-2 border-y py-1 text-sm">
                <p><strong className="w-24 inline-block">Employee:</strong> {employee.name}</p>
                <p>{employee.role}</p>
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
            </Table>
            
            <div className="mt-4 text-right space-y-1 text-sm font-semibold">
                <p>Total Present: {summary.Present}</p>
                <p>Total Absent: {summary.Absent}</p>
                <p>Total Leave: {summary.Leave}</p>
            </div>

             <div className="flex justify-between mt-24 text-sm">
                <div className="border-t-2 border-gray-400 text-center pt-1">Employee's Signature</div>
                <div className="border-t-2 border-gray-400 text-center pt-1">Manager's Signature</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);
EmployeeAttendanceReport.displayName = "EmployeeAttendanceReport";

export default EmployeeAttendanceReport;
