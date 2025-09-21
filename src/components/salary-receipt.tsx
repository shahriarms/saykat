
'use client';

import React from 'react';
import type { Employee } from '@/lib/types';
import { format } from 'date-fns';
import { numberToWords, numberToWordsBn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { StockPilotLogo } from './stock-pilot-logo';
import { cn } from '@/lib/utils';

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
      <div ref={ref} className={cn("bg-white p-4 font-sans print:p-0", isBn ? 'font-bangla' : '')}>
        <div 
          className="w-full max-w-4xl mx-auto border-2 border-dashed border-gray-400 p-5 relative"
           style={{
            backgroundColor: '#f7f9fc',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill='%23e9edf2' fill-opacity='0.4'%3E%3Cpath fill-rule='evenodd' d='M0 0h20v1H0v20h1V0h20v1H0z'/%3E%3C/g%3E%3C/svg%3E")`,
           }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <StockPilotLogo className="w-12 h-12" />
              <div>
                <h1 className="text-lg font-bold text-gray-800">{t('shop_name')}</h1>
                <p className="text-xs text-gray-600">Dhaka, Bangladesh</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 uppercase tracking-wider">{t('date_label')}</p>
              <p className="font-semibold text-lg border-b-2 border-dotted border-gray-400 px-2">{format(paymentDate, 'MM/dd/yyyy')}</p>
            </div>
          </div>
          
          {/* Payee Info & Amount */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
                <span className="text-xs text-gray-700 font-semibold uppercase whitespace-nowrap">{t('pay_to_label')}</span>
                <p className="w-full border-b-2 border-dotted border-gray-400 font-semibold text-lg pb-1 min-w-[250px]">{employee.name}</p>
            </div>
            <div className="flex-shrink-0 ml-4">
                <div className="border-2 border-gray-700 px-3 py-1 font-mono text-xl font-bold text-center flex items-center justify-between min-w-[150px]">
                    <span className="text-lg font-semibold mr-1">৳</span>
                    <span>{paymentAmount.toFixed(2)}</span>
                </div>
            </div>
          </div>

          {/* Amount in Words */}
           <div className="flex items-center justify-between gap-4 mb-8">
              <p className="w-full border-b-2 border-dotted border-gray-400 pb-1 capitalize text-sm">{amountInWords}</p>
              <span className="text-xs text-gray-500 uppercase font-semibold">{t('taka_label')}</span>
          </div>
          
          {/* Memo and Signature */}
          <div className="flex justify-between items-end mt-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{t('phone_label')}:</span>
              <p className="w-48 border-b-2 border-dotted border-gray-400 text-sm font-mono">{employee.phone}</p>
            </div>
            <div className="w-60 border-t-2 border-gray-600 text-center pt-1">
              <p className="text-xs text-gray-600">{t('please_sign_above_label')}</p>
            </div>
          </div>

        </div>
      </div>
    );
  }
));

SalaryReceipt.displayName = 'SalaryReceipt';
