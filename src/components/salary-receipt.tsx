
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
    const dateFormatted = format(paymentDate, 'ddMMyyyy');

    return (
      <div ref={ref} className={cn("bg-white p-4 font-sans", isBn ? 'font-bangla' : '')}>
        <div 
          className="w-full max-w-4xl mx-auto border-2 border-gray-400 p-4 relative"
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
              <StockPilotLogo className="w-64 h-64 opacity-5" />
          </div>

          <div className="relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start pb-2 border-b-2 border-gray-300">
                <div className="flex items-center gap-3">
                  <StockPilotLogo className="w-12 h-12" />
                  <div>
                    <h1 className="text-xl font-bold text-black">{t('shop_name')}</h1>
                    <p className="text-xs text-gray-600">{t('salary_voucher_title')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {dateFormatted.split('').map((char, i) => (
                    <div key={i} className="w-6 h-8 border border-gray-400 flex items-center justify-center font-mono text-lg">{char}</div>
                  ))}
                </div>
              </div>

              {/* Payee and Amount */}
              <div className="mt-6 grid grid-cols-12 gap-x-4 gap-y-6">
                 <div className="col-span-2 text-sm text-gray-600 font-semibold flex items-end pb-1">{t('pay_to_label')}</div>
                 <div className="col-span-7 border-b border-gray-300 ml-2 pb-1 font-semibold text-lg">
                    {employee.name}
                 </div>
                 <div className="col-span-3 flex items-end pb-1 justify-end">
                    <span className="text-sm text-gray-600 font-semibold">{t('or_bearer_label')}</span>
                 </div>
                 
                 <div className="col-span-2 text-sm text-gray-600 font-semibold flex items-start pt-1">{t('sum_of_label')}</div>
                 <div className="col-span-7 border-b border-gray-300 ml-2 pt-1 capitalize">
                    {amountInWords}
                 </div>
                 <div className="col-span-3 border-2 border-gray-400 p-2 ml-4 font-mono text-xl font-bold text-center">
                    {isBn ? '৳' : 'BDT'} {paymentAmount.toFixed(2)}
                 </div>
              </div>

              {/* Account Number and Signature */}
              <div className="mt-12 flex justify-between items-end gap-4">
                <div className="w-auto">
                  <span className="text-sm text-gray-600 font-semibold">{t('phone_number_label')}:</span>
                  <div className="font-mono border border-gray-300 px-3 py-1 inline-block ml-2">
                    {employee.phone}
                  </div>
                </div>
                <div className="w-64 text-center mt-4">
                  <div className="border-t border-gray-400 pt-1 text-xs text-gray-600">
                    {t('please_sign_above_label')}
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }
));

SalaryReceipt.displayName = 'SalaryReceipt';
