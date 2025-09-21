
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

    const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1e0d7' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

    return (
      <div ref={ref} className={cn("bg-white p-4 font-sans", isBn ? 'font-bangla' : '')}>
        <div 
          className="w-full max-w-4xl mx-auto border-2 border-gray-400 p-4 relative"
          style={{ backgroundImage: `url("${backgroundPattern}")`}}
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
              <StockPilotLogo className="w-64 h-64 opacity-5" />
          </div>

          <div className="relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start pb-2 border-b border-gray-300">
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
              <div className="mt-6 space-y-4">
                <div className="flex items-end">
                  <span className="text-sm text-gray-600 font-semibold w-24">{t('pay_to_label')}</span>
                  <div className="flex-1 border-b border-gray-300 ml-2 pb-1 font-semibold text-lg">
                    {employee.name}
                  </div>
                  <span className="text-sm text-gray-600 font-semibold ml-4">{t('or_bearer_label')}</span>
                </div>
                <div className="flex items-end">
                  <span className="text-sm text-gray-600 font-semibold w-24">{t('sum_of_label')}</span>
                  <div className="flex-1 border-b border-gray-300 ml-2 pb-1">
                    {amountInWords}
                  </div>
                  <div className="border-2 border-gray-400 p-2 ml-4 font-mono text-xl font-bold w-48 text-center">
                    {isBn ? '৳' : 'BDT'} {paymentAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Account Number and Signature */}
              <div className="mt-8 flex justify-between items-end">
                <div>
                  <span className="text-sm text-gray-600 font-semibold">{t('employee_id_label')}:</span>
                  <div className="border border-gray-300 px-3 py-1 inline-block ml-2">
                    {employee.id}
                  </div>
                </div>
                <div className="w-64 text-center">
                  <div className="border-t border-gray-400 pt-1 text-xs text-gray-600">
                    {t('please_sign_above_label')}
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
      </div>
    );
  }
));

SalaryReceipt.displayName = 'SalaryReceipt';
