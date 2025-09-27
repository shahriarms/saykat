

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
    previewMode?: boolean; // New prop for scaling in preview
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
        previewMode = false, // Default to false
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
    
    const scaleFactor = previewMode ? 'scale(0.9)' : 'scale(1)';

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
        transform: scaleFactor,
        transformOrigin: 'top',
    };

    const headerStyles: React.CSSProperties = {
        textAlign: 'center',
        marginBottom: isPos ? '1rem' : '2rem',
    };
    
    const h1Styles: React.CSSProperties = {
      fontSize: isPos ? '1.5rem' : '3rem',
      fontWeight: 'bold',
      color: '#000',
      margin: '0 0 0.5rem 0',
    };

    const h2Styles: React.CSSProperties = {
      fontSize: isPos ? '1.2rem' : '2.5rem',
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
        width: isPos ? undefined : 'auto', // for A4
    };
    
    const posThStyles = {
        item: { ...thStyles, width: '50%' },
        qty: { ...thStyles, textAlign: 'center', width: '15%' },
        rate: { ...thStyles, textAlign: 'right', width: '20%' },
        amount: { ...thStyles, textAlign: 'right', width: '15%' },
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
        top: isPos ? '55%' : '55%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-15deg)',
        opacity: 0.15,
        zIndex: 1,
        pointerEvents: 'none',
        width: isPos ? '180px' : '350px',
        height: isPos ? '60px' : '115px',
    };


    return (
        <div ref={ref}>
            <style>
                {`
                    @media print {
                        .invoice-container {
                            width: ${isPos ? '80mm' : '100%'} !important;
                            max-width: ${isPos ? '80mm' : '100%'} !important;
                        }
                        @page {
                            size: ${isPos ? '80mm auto' : 'A4'};
                            margin: 0;
                        }
                    }
                `}
            </style>
            <div style={memoStyles} className="invoice-container">
                 <div style={sealContainerStyles}>
                    <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <filter id="grunge">
                                <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
                                <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
                            </filter>
                        </defs>
                        <g filter="url(#grunge)" fill={isPaid ? '#22c55e' : '#dc2626'}>
                            <rect x="2" y="2" width="296" height="96" rx="10" stroke={isPaid ? '#22c55e' : '#dc2626'} strokeWidth="4" fill="none" />
                            <line x1="210" y1="2" x2="210" y2="98" stroke={isPaid ? '#22c55e' : '#dc2626'} strokeWidth="4" />
                            <text x="105" y="68" fontFamily="Impact, Arial Black, sans-serif" fontSize="60" fontWeight="bold" textAnchor="middle" textLength="170" lengthAdjust="spacingAndGlyphs">
                                {isPaid ? 'PAID' : 'DUE'}
                            </text>
                            <text x="252" y="70" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="bold" textAnchor="middle">৳</text>
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
                            <th style={isPos ? posThStyles.item : thStyles}>{t('item_header')}</th>
                            <th style={isPos ? posThStyles.qty : {...thStyles, textAlign: 'center'}}>{t('quantity_header')}</th>
                            <th style={isPos ? posThStyles.rate : {...thStyles, textAlign: 'right'}}>{t('rate_header')}</th>
                            <th style={isPos ? posThStyles.amount : {...thStyles, textAlign: 'right'}}>{t('amount_header')}</th>
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
