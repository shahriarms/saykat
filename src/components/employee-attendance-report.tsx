
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
      <div ref={ref} className="hidden print-source print:block print:bg-white print:text-[9px] print:leading-tight">
        <Card className="w-full mx-auto shadow-none border-0 print:shadow-none print:border-0 print:bg-white print:text-black print:mx-4">
          <CardHeader className="text-center space-y-1 print:mb-1 print:space-y-0.5 print:p-0">
            <div className="flex justify-center items-center gap-2">
                <svg className="w-6 h-6 print:w-5 print:h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <CardTitle className="text-lg print:text-base font-bold tracking-wider">EMPLOYEE ATTENDANCE</CardTitle>
            </div>
             <CardDescription className="print:text-base">
                Report for the month of {format(month, 'MMMM, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="print:p-0">
            <div className="flex justify-between items-center my-1 print:my-0.5 border-y py-0.5 print:py-0 print:text-base">
                <p><strong className="w-20 inline-block">Employee:</strong> {employee.name}</p>
                <p>{employee.role}</p>
            </div>

            <Table className="print:text-xs">
                <TableHeader>
                    <TableRow>
                        <TableHead className="print:p-1">Date</TableHead>
                        <TableHead className="print:p-1">Day</TableHead>
                        <TableHead className="text-center print:p-1">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {attendanceData.map(({ date, status }) => (
                        <TableRow key={date.toISOString()}>
                            <TableCell className="print:p-1">{format(date, 'MMMM dd, yyyy')}</TableCell>
                            <TableCell className="print:p-1">{format(date, 'eeee')}</TableCell>
                            <TableCell className={`text-center print:p-1 ${getStatusClass(status)}`}>{status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                 <TableFooter>
                    <TableRow className="bg-muted print:bg-gray-100">
                        <TableCell colSpan={2} className="font-bold text-right print:p-1">Total Present</TableCell>
                        <TableCell className="font-bold text-center print:p-1">{summary.Present}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={2} className="font-bold text-right print:p-1">Total Absent</TableCell>
                        <TableCell className="font-bold text-center print:p-1">{summary.Absent}</TableCell>
                    </TableRow>
                    <TableRow className="bg-muted print:bg-gray-100">
                        <TableCell colSpan={2} className="font-bold text-right print:p-1">Total Leave</TableCell>
                        <TableCell className="font-bold text-center print:p-1">{summary.Leave}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
             <div className="flex justify-between mt-24 print:mt-24 text-xs print:text-[9px]">
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
