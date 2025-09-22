
'use client';

import React from 'react';
import type { InvoiceItem, PrintFormat, Locale } from '@/lib/types';
import { cn, numberToWords, numberToWordsBn } from '@/lib/utils';
import { translations } from '@/lib/i18n/all';
import type { DraftInvoiceItem } from '@/hooks/use-invoice-form';

interface InvoicePrintLayoutProps {
    invoiceId: number | string;
    currentDate: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    invoiceItems: DraftInvoiceItem[] | InvoiceItem[];
    subtotal: number;
    paidAmount: number;
    dueAmount: number;
    printFormat?: PrintFormat;
    locale?: Locale;
}

export const InvoicePrintLayout = React.memo(React.forwardRef<HTMLDivElement, InvoicePrintLayoutProps>(
  (props, ref) => {
    const {
        invoiceId,
        currentDate,
        customerName,
        customerAddress,
        customerPhone,
        invoiceItems,
        subtotal,
        paidAmount,
        dueAmount,
        printFormat = 'normal',
        locale = 'en',
    } = props;

    const t = (key: keyof (typeof translations)['en'], options?: any) => {
        let text = translations[locale][key] || translations['en'][key];
        if (options) {
            Object.keys(options).forEach(k => {
                text = text.replace(`{{${k}}}`, options[k]);
            });
        }
        return text;
    };

    const isPos = printFormat === 'pos';
    const isBn = locale === 'bn';

    const amountInWords = isBn ? numberToWordsBn(subtotal) : numberToWords(subtotal);
    const isPaid = dueAmount <= 0.001;

    const memoStyles: React.CSSProperties = {
        position: 'relative',
        background: '#fff',
        color: '#000',
        fontFamily: isBn ? "'SolaimanLipi', 'Times New Roman', sans-serif" : "'Times New Roman', sans-serif",
        fontSize: '14px',
        width: '100%',
        maxWidth: isPos ? '80mm' : '800px',
        margin: 'auto',
        padding: isPos ? '0.25rem' : '2rem',
        border: isPos ? 'none' : '2px dashed #ccc',
        boxSizing: 'border-box',
    };

    const headerStyles: React.CSSProperties = {
        textAlign: 'center',
        marginBottom: isPos ? '1rem' : '2rem',
    };
    
    const h1Styles: React.CSSProperties = {
      fontSize: isPos ? '1.5rem' : '2rem',
      fontWeight: 'bold',
      color: '#000',
      margin: '0 0 0.5rem 0',
    };

    const h2Styles: React.CSSProperties = {
      fontSize: isPos ? '1.2rem' : '1.5rem',
      fontWeight: 600,
      color: '#158a67',
      margin: 0,
    }

    const customerDetailsStyles: React.CSSProperties = {
        display: isPos ? 'block' : 'flex',
        justifyContent: 'space-between',
        marginBottom: isPos ? '1rem' : '2rem',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
        padding: isPos ? '0.5rem 0' : '1rem 0',
        fontSize: isPos ? '12px' : '14px',
    };

    const tableStyles: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: isPos ? '1rem' : '2rem',
        fontSize: isPos ? '12px' : '14px',
    };

    const thStyles: React.CSSProperties = {
        borderBottom: '2px solid #ccc',
        padding: isPos ? '0.25rem' : '0.75rem',
        textAlign: 'left',
        fontWeight: 600,
    };

    const tdStyles: React.CSSProperties = {
        borderBottom: '1px solid #eee',
        padding: isPos ? '0.25rem' : '0.75rem',
    };

    const totalsSectionStyles: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1rem',
    };
    
    const totalsTableStyles: React.CSSProperties = {
        width: isPos ? '150px' : '250px',
        fontSize: isPos ? '12px' : '14px',
    };

    const footerStyles: React.CSSProperties = {
        textAlign: 'center',
        marginTop: isPos ? '1rem' : '3rem',
        paddingTop: '1rem',
        borderTop: '1px solid #eee',
        fontSize: '12px',
        color: '#666',
    };
    
    const sealContainerStyles: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-10deg)',
        opacity: 0.15,
        zIndex: 1,
        pointerEvents: 'none',
        width: isPos ? '200px' : '350px',
        height: isPos ? '100px' : '150px',
    };


    return (
        <div ref={ref}>
            <style>
                {`
                    @media print {
                        @page {
                            size: ${isPos ? '80mm auto' : 'A4'};
                            margin: 0;
                        }
                    }
                `}
            </style>
            <div style={memoStyles}>
                 <div style={sealContainerStyles}>
                    <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <filter id="grunge">
                                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" />
                                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
                            </filter>
                        </defs>
                        <g filter="url(#grunge)" fill={isPaid ? '#22c55e' : '#dc2626'}>
                            <path d="M296.6,22.4c-1.3-1.2-3.2-1.8-5.1-1.8H8.5c-1.9,0-3.8,0.6-5.1,1.8C2,23.6,1.4,25.5,1.4,27.4v45.1 c0,1.9,0.6,3.8,1.8,5.1c1.3,1.2,3.2,1.8,5.1,1.8h283c1.9,0,3.8-0.6,5.1-1.8c1.2-1.3,1.8-3.2,1.8-5.1V27.4 C298.4,25.5,297.8,23.6,296.6,22.4z M292.9,75.7c-0.4,0.4-1,0.6-1.6,0.6H8.7c-0.6,0-1.2-0.2-1.6-0.6c-0.4-0.4-0.6-1-0.6-1.6V25.9 c0-0.6,0.2-1.2,0.6-1.6c0.4-0.4,1-0.6,1.6-0.6h282.6c0.6,0,1.2,0.2,1.6,0.6c0.4,0.4,0.6,1,0.6,1.6v48.2 C293.5,74.7,293.3,75.3,292.9,75.7z"/>
                            <circle cx="15.8" cy="27.6" r="3.2"/>
                            <circle cx="284.2" cy="27.6" r="3.2"/>
                            <circle cx="15.8" cy="72.4" r="3.2"/>
                            <circle cx="284.2" cy="72.4" r="3.2"/>
                            <text x="150" y="65" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" textAnchor="middle">{isPaid ? 'PAID' : 'DUE'}</text>
                        </g>
                    </svg>
                </div>
                
                <header style={headerStyles}>
                    <h1 style={h1Styles}>{t('memo_title')}</h1>
                    <h2 style={h2Styles}>{t('shop_name')}</h2>
                    <p className={cn(isBn ? 'font-bangla' : '', isPos ? 'text-xs' : '')} style={{ margin: '0.25rem 0' }}>{t('shop_description')}</p>
                    <p style={{ margin: '0.25rem 0', fontSize: isPos ? '10px' : '12px' }}>Email: engmahmud.mmm@gmail.com</p>
                </header>
                
                <div style={customerDetailsStyles}>
                    <div>
                         <p style={{ margin: '0.25rem 0' }}><strong style={{ fontWeight: 600 }}>{t('customer_name_label')}:</strong> {customerName || '..................'}</p>
                         {!isPos && <p style={{ margin: '0.25rem 0' }}><strong style={{ fontWeight: 600 }}>{t('customer_address_label')}:</strong> {customerAddress || '..................'}</p>}
                         <p style={{ margin: '0.25rem 0' }}><strong style={{ fontWeight: 600 }}>{t('customer_phone_label')}:</strong> {customerPhone || '..................'}</p>
                    </div>
                    <div style={{ textAlign: isPos ? 'left' : 'right' }}>
                        <p style={{ margin: '0.25rem 0' }}><strong style={{ fontWeight: 600 }}>{t('invoice_no_label')}:</strong> {invoiceId}</p>
                        <p style={{ margin: '0.25rem 0' }}><strong style={{ fontWeight: 600 }}>{t('date_label')}:</strong> {currentDate || '...'}</p>
                    </div>
                </div>

                <table style={tableStyles}>
                    <thead>
                        <tr>
                            <th style={thStyles}>{t('item_header')}</th>
                            <th style={{...thStyles, textAlign: 'center'}}>{t('quantity_header')}</th>
                            <th style={{...thStyles, textAlign: 'right'}}>{t('rate_header')}</th>
                            <th style={{...thStyles, textAlign: 'right'}}>{t('amount_header')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceItems && invoiceItems.length > 0 ? invoiceItems.map(item => {
                            const price = parseFloat(String(item.price)) || 0;
                            const quantity = parseFloat(String(item.quantity)) || 0;
                            return (
                                <tr key={item.id}>
                                    <td style={tdStyles}>{item.name}</td>
                                    <td style={{...tdStyles, textAlign: 'center'}}>{quantity}</td>
                                    <td style={{...tdStyles, textAlign: 'right'}}>৳ {price.toFixed(2)}</td>
                                    <td style={{...tdStyles, textAlign: 'right', fontWeight: 500}}>৳ {(price * quantity).toFixed(2)}</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={4} style={{...tdStyles, textAlign: 'center', padding: '1.5rem', color: '#6b7280'}}>{t('no_items_added')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                <div style={totalsSectionStyles}>
                     <table style={totalsTableStyles}>
                        <tbody>
                            <tr style={{fontWeight: 'bold', fontSize: isPos ? '1.1em' : '1.1rem', borderTop: '2px solid #333' }}>
                                <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem' }}>{t('subtotal_label')}:</td>
                                <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', fontWeight: 600 }}>৳ {subtotal.toFixed(2)}</td>
                            </tr>
                             <tr>
                                <td style={{ textAlign: 'right', padding: '0.25rem' }}>{t('paid_label')}:</td>
                                <td style={{ textAlign: 'right', padding: '0.25rem' }}>৳ {paidAmount.toFixed(2)}</td>
                            </tr>
                             <tr style={{ fontWeight: 'bold' }}>
                                <td style={{ textAlign: 'right', padding: '0.25rem' }}>{t('due_label')}:</td>
                                <td style={{ textAlign: 'right', padding: '0.25rem' }}>৳ {dueAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                     </table>
                </div>
                
                {!isPos && (
                    <div className={cn("in-words", isBn ? "font-bangla" : "")} style={{ marginTop: '2rem' }}>
                        <p><strong style={{ fontWeight: 600 }}>{t('in_words_label')}:</strong> {amountInWords}</p>
                    </div>
                )}
                
                <footer style={footerStyles}>
                    <p>Thank you for your business!</p>
                    <p>This is a computer generated invoice.</p>
                </footer>

            </div>
        </div>
    );
  }
));

InvoicePrintLayout.displayName = 'InvoicePrintLayout';
