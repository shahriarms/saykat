
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
        <div className="w-full max-w-4xl mx-auto border-2 border-gray-700 p-6 relative bg-white" style={{ 
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4e6f1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `
        }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <StockPilotLogo className="w-12 h-12" />
              <div>
                <h1 className="text-xl font-bold text-black">{t('shop_name')}</h1>
                <p className="text-xs text-gray-600">Dhaka, Bangladesh</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 uppercase tracking-wider">{t('date_label')}</p>
              <p className="font-semibold text-lg border-b-2 border-gray-400 px-2">{format(paymentDate, 'MM/dd/yyyy')}</p>
            </div>
          </div>

          {/* Payee and Amount */}
          <div className="grid grid-cols-5 gap-4 items-end mb-4">
            <div className="col-span-4 space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-sm text-gray-600 font-semibold">{t('pay_to_label')}:</span>
                <p className="w-full border-b-2 border-dotted border-gray-400 font-semibold text-lg pb-1">{employee.name}</p>
              </div>
              <div className="flex items-end gap-2">
                <p className="w-full border-b-2 border-dotted border-gray-400 pb-1 capitalize text-base">{amountInWords}</p>
                <span className="text-sm text-gray-600 font-semibold self-end">TAKA</span>
              </div>
            </div>
            <div className="col-span-1">
              <div className="border-2 border-gray-700 px-2 py-1 font-mono text-xl font-bold text-center flex items-center justify-between">
                <span className="text-lg font-semibold mr-1">৳</span>
                <span>{paymentAmount.toFixed(2)}</span>
              </div>
            </div>
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

          {/* MICR Line */}
          <div className="mt-4 text-center font-mono text-lg text-gray-700 tracking-widest">
            ⑆123456789⑆ 123456789012 ⑈1234
          </div>
        </div>
      </div>
    );
  }
));

SalaryReceipt.displayName = 'SalaryReceipt';
