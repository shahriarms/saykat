

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

const EmployeeAttendanceReport = React.forwardRef<HTMLDivElement, EmployeeAttendanceReportProps>(
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
      <div ref={ref} className="hidden print-source print:block print:bg-white print:text-[10px]">
        <Card className="w-full max-w-4xl mx-auto shadow-none border-0 print:shadow-none print:border-0 print:bg-white print:text-black">
          <CardHeader className="text-center space-y-2 mb-2 print:mb-1 print:space-y-1 print:p-0">
            <div className="flex justify-center items-center gap-2">
                <svg className="w-8 h-8 print:w-6 print:h-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <CardTitle className="text-2xl print:text-xl font-bold tracking-wider">EMPLOYEE ATTENDANCE</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="print:p-0">
            <div className="grid grid-cols-2 gap-4 my-4 print:my-2 border-y py-2 print:py-1 text-xs print:text-[10px]">
                <div>
                    <p><strong className="w-24 inline-block">Employee:</strong> {employee.name}</p>
                    <p>{employee.role}</p>
                </div>
                 <div className="text-right">
                    <p><strong className="w-24 inline-block text-left">Month:</strong> {format(month, 'MMMM, yyyy')}</p>
                    <p><strong className="w-24 inline-block text-left">Joining Date:</strong> {format(new Date(employee.joiningDate), 'PP')}</p>
                </div>
            </div>

            <Table className="print:text-xs">
                <TableHeader>
                    <TableRow>
                        <TableHead className="print:p-1.5">Date</TableHead>
                        <TableHead className="print:p-1.5">Day</TableHead>
                        <TableHead className="text-center print:p-1.5">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attendanceData.map(({ date, status }) => (
                        <TableRow key={date.toISOString()}>
                            <TableCell className="print:p-1.5">{format(date, 'MMMM dd, yyyy')}</TableCell>
                            <TableCell className="print:p-1.5">{format(date, 'eeee')}</TableCell>
                            <TableCell className={`text-center print:p-1.5 ${getStatusClass(status)}`}>{status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                 <TableFooter>
                    <TableRow className="bg-muted print:bg-gray-100">
                        <TableCell colSpan={2} className="font-bold text-right print:p-1.5">Total Present</TableCell>
                        <TableCell className="font-bold text-center print:p-1.5">{summary.Present}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2} className="font-bold text-right print:p-1.5">Total Absent</TableCell>
                        <TableCell className="font-bold text-center print:p-1.5">{summary.Absent}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted print:bg-gray-100">
                        <TableCell colSpan={2} className="font-bold text-right print:p-1.5">Total Leave</TableCell>
                        <TableCell className="font-bold text-center print:p-1.5">{summary.Leave}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
             <div className="flex justify-between mt-8 print:mt-4 text-xs print:text-[10px]">
                <div className="border-t-2 border-gray-400 w-48 print:w-40 text-center pt-1">Employee's Signature</div>
                <div className="border-t-2 border-gray-400 w-48 print:w-40 text-center pt-1">Manager's Signature</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);
EmployeeAttendanceReport.displayName = "EmployeeAttendanceReport";

export default EmployeeAttendanceReport;
