
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

const CheckPattern = () => (
    <svg width="100%" height="100%" className="absolute inset-0 z-0 opacity-[0.07]">
      <defs>
        <pattern id="check-pattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="scale(1) rotate(0)">
           <path d="M10 0L20 10L10 20L0 10Z" fill="#aab" stroke="#aab" strokeWidth="1"/>
           <path d="M30 0L40 10L30 20L20 10Z" fill="#aab" stroke="#aab" strokeWidth="1"/>
           <path d="M10 20L20 30L10 40L0 30Z" fill="#aab" stroke="#aab" strokeWidth="1"/>
           <path d="M30 20L40 30L30 40L20 30Z" fill="#aab" stroke="#aab" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#check-pattern)" />
    </svg>
);


export const SalaryReceipt = React.memo(React.forwardRef<HTMLDivElement, SalaryReceiptProps>(
  ({ employee, paymentAmount, paymentDate }, ref) => {
    const { t, locale } = useTranslation();
    const isBn = locale === 'bn';
    const amountInWords = isBn ? numberToWordsBn(paymentAmount) : numberToWords(paymentAmount);

    return (
      <div ref={ref} className={cn("bg-white p-4 font-sans print:p-0", isBn ? 'font-bangla' : '')}>
        <div 
          className="w-full max-w-4xl mx-auto border-4 border-gray-300 p-1 relative bg-white"
          style={{ borderStyle: 'dashed' }}
        >
            <CheckPattern />
            <div className="border border-gray-400 p-4 relative z-10">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <StockPilotLogo className="w-10 h-10" />
                        <div>
                            <h1 className="text-sm font-bold text-black">{t('shop_name')}</h1>
                            <p className="text-xs text-gray-500">Dhaka, Bangladesh</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-600">DATE</p>
                        <p className="font-semibold border-b border-gray-400 px-2">{format(paymentDate, 'MM/dd/yyyy')}</p>
                    </div>
                </div>

                {/* Payee */}
                <div className="flex items-center gap-4 mb-2">
                    <span className="text-xs text-gray-600 whitespace-nowrap">PAY TO THE<br/>ORDER OF</span>
                    <p className="w-full border-b border-gray-400 font-semibold text-lg pb-1">{employee.name}</p>
                </div>

                 {/* Amount in words */}
                 <div className="flex items-center gap-4 mb-4">
                    <p className="w-full border-b border-gray-400 pb-1 capitalize">{amountInWords}</p>
                     <span className="text-xs text-gray-600">DOLLARS</span>
                </div>
                
                 {/* Amount box */}
                <div className="absolute top-[5.5rem] right-4 flex items-center">
                    <span className="text-lg font-semibold mr-1">$</span>
                    <div className="border-2 border-gray-400 px-3 py-1 font-mono text-lg font-bold w-40 text-center">
                        {paymentAmount.toFixed(2)}
                    </div>
                </div>

                {/* Memo and Signature */}
                <div className="flex justify-between items-end mt-8">
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">MEMO</span>
                        <p className="w-64 border-b border-gray-400 text-sm font-mono">{employee.phone}</p>
                    </div>
                     <div className="w-60 border-t border-gray-400 text-center pt-1">
                        <p className="text-xs text-gray-500">Authorized Signature</p>
                    </div>
                </div>

                {/* MICR Line */}
                <div className="absolute bottom-1 left-0 right-0 text-center font-mono text-sm text-gray-500">
                    <span className="font-serif">⑆</span>123456789<span className="font-serif">⑆</span> &nbsp;987654321<span className="font-serif">⑈</span> 0123
                </div>
            </div>
        </div>
      </div>
    );
  }
));

SalaryReceipt.displayName = 'SalaryReceipt';
