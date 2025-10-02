
'use client';

import { useState, useRef } from 'react';
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
  onPrint: () => void;
}

export function InvoicePreviewDialog({ open, onOpenChange, invoice, onPrint }: InvoicePreviewDialogProps) {
    const { user } = useUser();
    const { loadInvoiceForEditing } = useInvoiceForm();
    const router = useRouter();

    const handleEdit = () => {
        if (user?.role === 'admin') {
            loadInvoiceForEditing(invoice);
            onOpenChange(false); // Close the dialog first
            router.push('/dashboard/invoice');
        }
    }

  return (
    <>
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl no-print">
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
                        paidAmount={invoice.paidAmount}
                        dueAmount={invoice.dueAmount}
                        previewMode={true}
                    />
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
                    <Button onClick={onPrint}>
                        <Printer className="mr-2 h-4 w-4"/>
                        Print
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    </>
  );
}
