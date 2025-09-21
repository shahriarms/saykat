
'use client';

import React from 'react';
import type { Employee, SalaryPayment } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { numberToWords, numberToWordsBn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface SalaryReceiptProps {
  employee: Employee;
  paymentAmount: number;
  paymentDate: Date;
}

export const SalaryReceipt = React.memo(React.forwardRef<HTMLDivElement, SalaryReceiptProps>(
  ({ employee, paymentAmount, paymentDate }, ref) => {
    const { t, locale } = useTranslation();
    const isBn = locale === 'bn';
    const amountInWords = isBn ? numberToWordsBn(paymentAmount) : numberToWords(paymentAmount);

    return (
      <div ref={ref} className="bg-white p-4">
        <Card className="w-full max-w-2xl mx-auto border-2 border-black rounded-lg shadow-lg font-serif">
          <CardHeader className="flex flex-row justify-between items-start bg-gray-50 p-4 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-bold text-black">{t('shop_name')}</h1>
              <p className="text-sm text-gray-600">Salary Payment Voucher</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Date: {format(paymentDate, 'PPP')}</p>
              <p className="text-sm text-gray-600">Month: {format(paymentDate, 'MMMM, yyyy')}</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6 text-black">
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-semibold w-32">Pay to the order of</span>
              <div className="flex-1 border-b border-gray-400 border-dashed text-lg font-semibold tracking-wider">
                {employee.name}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
               <div className="flex-1 border-b border-gray-400 border-dashed text-lg tracking-wider">
                {amountInWords}
              </div>
               <div className="border-2 border-black p-2 rounded-md font-mono text-xl font-bold">
                ৳ {paymentAmount.toFixed(2)}
              </div>
            </div>

            <div className="flex justify-between items-end pt-8">
                <div>
                    <p className="text-sm"><strong>Employee ID:</strong> {employee.id}</p>
                    <p className="text-sm"><strong>Role:</strong> {employee.role}</p>
                </div>
                <div className="w-48 text-center">
                    <div className="border-t border-black pt-1">
                        Authorized Signature
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
));

SalaryReceipt.displayName = 'SalaryReceipt';
