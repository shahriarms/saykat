
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2, Printer, Pencil } from 'lucide-react';
import { InvoicePrintLayout } from './invoice-print-layout';
import type { Invoice } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';
import { useAppData } from '@/hooks/use-app-data';
import { useUser } from '@/hooks/use-user';
import { useInvoiceForm } from '@/hooks/use-invoice-form';

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
}

export function InvoicePreviewDialog({ open, onOpenChange, invoice }: InvoicePreviewDialogProps) {
    const { settings } = useSettings();
    const { printInvoice: appPrintInvoice } = useAppData();
    const { user } = useUser();
    const { loadInvoiceForEditing } = useInvoiceForm();
    const router = useRouter();

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

    const handleEdit = () => {
        if (user?.role === 'admin') {
            loadInvoiceForEditing(invoice);
            onOpenChange(false); // Close the dialog first
            router.push('/dashboard/invoice');
        }
    }
  
    useEffect(() => {
        if (invoiceToPrint) {
            const originalTitle = document.title;
            document.title = `invoice-${invoiceToPrint.id}`;
            
            const handleAfterPrint = () => {
                document.title = originalTitle;
                setInvoiceToPrint(null);
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
                     <div className="print:hidden">
                        <InvoicePrintLayout 
                            invoiceId={invoice.id}
                            currentDate={new Date(invoice.date).toLocaleDateString()}
                            customerName={invoice.customerName}
                            customerAddress={invoice.customerAddress}
                            customerPhone={invoice.customerPhone}
                            invoiceItems={invoice.items}
                            subtotal={invoice.subtotal}
                            paidAmount={invoice.paidAmount}
                            dueAmount={invoice.dueAmount}
                            printFormat={settings.printFormat}
                            locale={settings.locale}
                        />
                    </div>
                     <div className="hidden print:block">
                        <InvoicePrintLayout 
                            invoiceId={invoice.id}
                            currentDate={new Date(invoice.date).toLocaleDateString()}
                            customerName={invoice.customerName}
                            customerAddress={invoice.customerAddress}
                            customerPhone={invoice.customerPhone}
                            invoiceItems={invoice.items}
                            subtotal={invoice.subtotal}
                            paidAmount={invoice.paidAmount}
                            dueAmount={invoice.dueAmount}
                            printFormat={settings.printFormat}
                            locale={settings.locale}
                        />
                    </div>
                </div>
            </ScrollArea>

            <DialogFooter className="sm:justify-between">
                <div>
                     {user?.role === 'admin' && (
                        <Button variant="outline" onClick={handleEdit}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Invoice
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={handlePrint} disabled={isPrinting}>
                        {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Printer className="mr-2 h-4 w-4"/>}
                        Print
                    </Button>
                </div>
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
                    paidAmount={invoiceToPrint.paidAmount}
                    dueAmount={invoiceToPrint.dueAmount}
                    printFormat={settings.printFormat}
                    locale={settings.locale}
                />
            </div>
      )}
    </>
  );
}
