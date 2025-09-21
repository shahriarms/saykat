
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
      <div ref={ref} className={cn("bg-white p-6 font-sans print:p-0", isBn ? 'font-bangla' : '')}>
        <div 
          className="w-full max-w-4xl mx-auto border-2 border-dashed border-gray-400 p-8 relative isolate"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e0e7f1\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10zM10 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10zm0-40c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
        >

            <div className="bg-white/80 backdrop-blur-sm p-4">

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <StockPilotLogo className="w-12 h-12" />
                  <div>
                    <h1 className="text-xl font-bold text-black">{t('shop_name')}</h1>
                    <p className="text-xs text-gray-600">Dhaka, Bangladesh</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 uppercase tracking-wider">{t('date_label')}</p>
                  <p className="font-semibold text-lg border-b-2 border-gray-400 px-2">{format(paymentDate, 'MM/dd/yyyy')}</p>
                </div>
              </div>

              {/* Payee and Amount */}
              <div className="flex justify-between items-end mb-4 gap-4">
                  <div className="flex-grow space-y-4">
                      <div className="flex items-end gap-2">
                          <span className="text-sm text-gray-600 font-semibold whitespace-nowrap">{t('pay_to_label')}:</span>
                          <p className="w-full border-b-2 border-dotted border-gray-400 font-semibold text-base pb-1">{employee.name}</p>
                      </div>
                      <div className="flex items-end gap-2">
                          <p className="w-full border-b-2 border-dotted border-gray-400 pb-1 capitalize text-sm">{amountInWords}</p>
                          <span className="text-sm text-gray-600 font-semibold self-end">TAKA</span>
                      </div>
                  </div>
                  <div className="flex-shrink-0">
                      <div className="border-2 border-gray-700 px-3 py-1 font-mono text-xl font-bold text-center flex items-center justify-between">
                          <span className="text-lg font-semibold mr-1">৳</span>
                          <span>{paymentAmount.toFixed(2)}</span>
                      </div>
                  </div>
              </div>
              
              {/* Memo and Signature */}
              <div className="flex flex-col md:flex-row md:justify-between items-end mt-10 gap-4">
                <div className="flex items-center gap-2 self-start">
                  <span className="text-sm font-semibold">{t('phone_label')}:</span>
                  <p className="w-48 border-b-2 border-dotted border-gray-400 text-sm font-mono">{employee.phone}</p>
                </div>
                <div className="w-60 border-t-2 border-gray-600 text-center pt-1 self-end">
                  <p className="text-xs text-gray-600">{t('please_sign_above_label')}</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }
));

SalaryReceipt.displayName = 'SalaryReceipt';
