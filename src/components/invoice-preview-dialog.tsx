
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Printer } from 'lucide-react';
import { InvoicePrintLayout } from './invoice-print-layout';
import type { Invoice } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';
import { useAppData } from '@/hooks/use-app-data';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function InvoicePreviewDialog({ open, onOpenChange, invoice }: InvoicePreviewDialogProps) {
    const { settings } = useSettings();
    const { printInvoice: appPrintInvoice } = useAppData();
    const [isPrinting, setIsPrinting] = useState(false);
    const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);

    const handlePrint = async () => {
        if (!invoice || isPrinting) return;
        
        if (settings.printFormat === 'pos' && settings.posPrinterType !== 'disabled') {
            setIsPrinting(true);
            try {
                await appPrintInvoice(invoice);
            } catch (error: any) {
                console.error(error.message);
            } finally {
                setIsPrinting(false);
            }
        } else {
            setInvoiceToPrint(invoice);
        }
    };
  
    useEffect(() => {
        if (invoiceToPrint) {
            setIsPrinting(true);
            const originalTitle = document.title;
            document.title = `invoice-${invoiceToPrint.id}`;
            
            const handleAfterPrint = () => {
                document.title = originalTitle;
                setInvoiceToPrint(null);
                setIsPrinting(false);
                window.removeEventListener('afterprint', handleAfterPrint);
            };

            window.addEventListener('afterprint', handleAfterPrint);
            
            const timer = setTimeout(() => {
                window.print();
            }, 100); 
            
            return () => {
                clearTimeout(timer);
                window.removeEventListener('afterprint', handleAfterPrint);
                if (document.title !== originalTitle) {
                  document.title = originalTitle;
                }
            };
        }
    }, [invoiceToPrint]);
    

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
            <DialogTitle>Invoice #{invoice.id}</DialogTitle>
            <DialogDescription>
                Preview of the invoice for {invoice.customerName}.
            </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[70vh] rounded-md border">
                <div className="p-4 bg-muted/50">
                    <InvoicePrintLayout 
                        invoiceId={invoice.id}
                        currentDate={new Date(invoice.date).toLocaleDateString()}
                        customerName={invoice.customerName}
                        customerAddress={invoice.customerAddress}
                        customerPhone={invoice.customerPhone}
                        invoiceItems={invoice.items}
                        subtotal={invoice.subtotal}
                        paidAmount={invoice.paidAmount || 0}
                        dueAmount={invoice.dueAmount || 0}
                        printFormat={settings.printFormat}
                        locale={settings.locale}
                    />
                </div>
            </ScrollArea>

            <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Close
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
                {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Printer className="mr-2 h-4 w-4"/>}
                Print
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
        {invoiceToPrint && (
            <div className="print-source">
                <InvoicePrintLayout
                    invoiceId={invoiceToPrint.id}
                    currentDate={new Date(invoiceToPrint.date).toLocaleDateString()}
                    customerName={invoiceToPrint.customerName}
                    customerAddress={invoiceToPrint.customerAddress}
                    customerPhone={invoiceToPrint.customerPhone}
                    invoiceItems={invoiceToPrint.items}
                    subtotal={invoiceToPrint.subtotal}
                    paidAmount={invoiceToPrint.paidAmount || 0}
                    dueAmount={invoiceToPrint.dueAmount || 0}
                    printFormat={settings.printFormat}
                    locale={settings.locale}
                />
            </div>
      )}
    </>
  );
}
