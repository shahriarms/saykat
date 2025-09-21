
'use client';

import React from 'react';
import type { Employee } from '@/lib/types';
import { format } from 'date-fns';
import { numberToWords, numberToWordsBn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
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
    const amountInWords = isBn ? numberToWordsBn(paymentAmount) : numberToWords(paymentAmount).replace("Dollars", "Taka");

    return (
      <div ref={ref} className={cn("bg-white p-4 font-sans", isBn ? 'font-bangla' : '')}>
        <div 
          className={cn("w-full max-w-4xl mx-auto border-4 border-dashed border-gray-400 p-8 relative print:p-6", isBn ? 'font-bangla' : '')}
          style={{
            backgroundColor: '#fff',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='0' y='20' font-family='sans-serif' font-size='30' fill='%23000000' fill-opacity='0.04'%3E৳%3C/text%3E%3Ctext x='50' y='70' font-family='sans-serif' font-size='30' fill='%23000000' fill-opacity='0.04'%3E৳%3C/text%3E%3C/svg%3E")`,
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-2">
                <StockPilotLogo className="w-12 h-12" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-wider">{t('shop_name')}</h1>
                    <p className="text-sm text-gray-500">Dhaka, Bangladesh</p>
                </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 uppercase">{t('date_label')}</p>
              <p className="font-semibold text-lg border-b-2 border-dotted border-gray-400 px-2">{format(paymentDate, 'MM/dd/yyyy')}</p>
            </div>
          </div>
          
          {/* Payee Info & Amount */}
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-end gap-2">
                <span className="text-gray-600 font-semibold uppercase pb-1">{t('pay_to_label')}</span>
                <p className="w-full border-b-2 border-dotted border-gray-400 font-semibold text-xl pb-1 min-w-[300px]">{employee.name}</p>
            </div>
            <div className="flex items-center border-2 border-gray-700 px-4 py-1 font-mono text-2xl font-bold text-center">
                <span className="text-lg font-semibold mr-1">৳</span>
                <span>{paymentAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="flex items-end gap-2 mb-12">
            <p className="w-full border-b-2 border-dotted border-gray-400 pb-1 capitalize text-md">{amountInWords}</p>
            <span className="text-gray-500 uppercase font-semibold pb-1">{t('taka_label')}</span>
          </div>
          
          {/* Memo and Signature */}
          <div className="flex justify-between items-end mt-16">
            <div className="flex items-end gap-2">
              <span className="text-gray-600 font-semibold pb-1">{t('phone_label')}:</span>
              <p className="w-48 border-b-2 border-dotted border-gray-400 text-sm font-mono pb-1">{employee.phone}</p>
            </div>
            <div className="w-60 border-t-2 border-gray-600 text-center pt-1">
              <p className="text-xs text-gray-600">{t('please_sign_above_label')}</p>
            </div>
          </div>
          
          {/* MICR Line - for authentic look */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full px-8">
            <p className="font-mono text-center text-lg text-gray-400 select-none">
              <span className="mr-4">⑆123456789⑆</span> 
              <span>987654321⑈</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
));

SalaryReceipt.displayName = 'SalaryReceipt';
