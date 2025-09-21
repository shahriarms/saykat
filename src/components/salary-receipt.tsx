
'use client';

import React from 'react';
import type { Employee } from '@/lib/types';
import { format } from 'date-fns';
import { numberToWords, numberToWordsBn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { StockPilotLogo } from './stock-pilot-logo';

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
    const dateFormatted = format(paymentDate, 'ddMMyyyy');

    return (
      <div ref={ref} className="bg-white p-4 font-sans">
        <div className="w-full max-w-4xl mx-auto border-2 border-gray-400 p-4 relative">
          {/* Header */}
          <div className="flex justify-between items-start pb-2 border-b border-gray-300">
            <div className="flex items-center gap-3">
              <StockPilotLogo className="w-12 h-12" />
              <div>
                <h1 className="text-xl font-bold text-black">Mahmud Engineering Shop</h1>
                <p className="text-xs text-gray-600">Salary Payment Voucher</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {dateFormatted.split('').map((char, i) => (
                <div key={i} className="w-6 h-8 border border-gray-400 flex items-center justify-center font-mono text-lg">{char}</div>
              ))}
            </div>
          </div>

          {/* Payee and Amount */}
          <div className="mt-6 space-y-4">
            <div className="flex items-end">
              <span className="text-sm text-gray-600 font-semibold w-20">PAY TO</span>
              <div className="flex-1 border-b border-gray-300 ml-2 pb-1 font-semibold text-lg">
                {employee.name}
              </div>
              <span className="text-sm text-gray-600 font-semibold ml-4">OR BEARER</span>
            </div>
            <div className="flex items-end">
              <span className="text-sm text-gray-600 font-semibold w-20">SUM OF</span>
              <div className="flex-1 border-b border-gray-300 ml-2 pb-1">
                {amountInWords}
              </div>
              <div className="border-2 border-gray-400 p-2 ml-4 font-mono text-xl font-bold w-48 text-center">
                ৳ {paymentAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Account Number and Signature */}
          <div className="mt-8 flex justify-between items-end">
            <div>
              <span className="text-sm text-gray-600 font-semibold">Employee ID:</span>
              <div className="border border-gray-300 px-3 py-1 inline-block ml-2">
                {employee.id}
              </div>
            </div>
            <div className="w-64 text-center">
              <div className="border-t border-gray-400 pt-1 text-xs text-gray-600">
                Please Sign Above
              </div>
            </div>
          </div>
          
           {/* MICR Line */}
           <div className="absolute bottom-2 left-4 right-4 font-mono text-sm text-gray-500">
              <span>⑆567890⑈</span>
              <span className="ml-4">1234567890⑆</span>
              <span className="ml-4">1234</span>
           </div>
        </div>
      </div>
    );
  }
));

SalaryReceipt.displayName = 'SalaryReceipt';
