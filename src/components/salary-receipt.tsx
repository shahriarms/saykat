
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
          className="w-full max-w-4xl mx-auto border-2 border-gray-400 p-4 relative"
           style={{
             backgroundColor: '#f0f4f8',
             backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Cdefs%3E%3Cpattern id='p' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 5c5 5 5-5 10 0' stroke='%23dce5f2' stroke-width='0.5'/%3E%3C/pattern%3E%3Cpattern id='g' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='100' cy='100' r='100' fill='rgba(230,235,245,0.2)'/%3E%3Ccircle cx='100' cy='100' r='80' fill='rgba(220,230,242,0.3)'/%3E%3Ccircle cx='100' cy='100' r='60' fill='rgba(210,220,240,0.4)'/%3E%3Ccircle cx='100' cy='100' r='40' fill='rgba(200,215,235,0.5)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='800' height='400' fill='url(%23p)'/%3E%3Crect width='800' height='400' fill='url(%23g)' fill-opacity='0.4'/%3E%3C/svg%3E")`,
             backgroundSize: 'cover',
             boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
           }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <StockPilotLogo className="w-12 h-12" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">{t('shop_name')}</h1>
                <p className="text-xs text-gray-600">Dhaka, Bangladesh</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 uppercase tracking-wider">{t('date_label')}</p>
              <p className="font-semibold text-lg border-b-2 border-gray-400 px-2">{format(paymentDate, 'MM/dd/yyyy')}</p>
            </div>
          </div>
          
          {/* Payee Info */}
          <div className="flex items-center gap-4 mb-4">
              <span className="text-xs text-gray-700 font-semibold uppercase whitespace-nowrap">{t('pay_to_label')}</span>
              <p className="w-full border-b-2 border-dotted border-gray-400 font-semibold text-lg pb-1">{employee.name}</p>
          </div>

          {/* Amount in Words and Numbers */}
          <div className="flex items-center justify-between gap-4 mb-8">
              <p className="w-full border-b-2 border-dotted border-gray-400 pb-1 capitalize text-sm">{amountInWords} {t('taka_label')}</p>
              <div className="flex-shrink-0">
                  <div className="border-2 border-gray-700 px-3 py-1 font-mono text-xl font-bold text-center flex items-center justify-between">
                      <span className="text-lg font-semibold mr-1">৳</span>
                      <span>{paymentAmount.toFixed(2)}</span>
                  </div>
              </div>
          </div>
          
          {/* Memo and Signature */}
          <div className="flex justify-between items-end mt-12">
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
