
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAppData } from '@/hooks/use-app-data';
import { useUser } from '@/hooks/use-user';
import type { Employee, SalaryPayment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Users, ChevronRight, DollarSign, Wallet, History, AlertCircle, ShieldCheck, Loader2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { SalaryReceipt } from '@/components/salary-receipt';
import { useEffect } from 'react';

export default function SalariesPage() {
  const { employees, getPaymentsForMonth, addSalaryPayment, getDueSalaryForMonth } = useAppData();
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [isConfirmingPayment, setConfirmingPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSuccessfulPayment, setLastSuccessfulPayment] = useState<{payment: SalaryPayment, employee: Employee} | null>(null);
  
  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPaymentAmount('');
  };

  const { dueSalary, paidThisMonth, paymentsThisMonth } = useMemo(() => {
    if (!selectedEmployee) {
      return { dueSalary: 0, paidThisMonth: 0, paymentsThisMonth: [] };
    }
    const currentDate = new Date();
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    
    const payments = getPaymentsForMonth(selectedEmployee.id, firstDay, lastDay);
    const paid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const due = getDueSalaryForMonth(selectedEmployee, currentDate);

    return {
      dueSalary: due,
      paidThisMonth: paid,
      paymentsThisMonth: payments,
    };
  }, [selectedEmployee, getPaymentsForMonth, getDueSalaryForMonth]);

  const isOverpayment = useMemo(() => {
      if (typeof paymentAmount !== 'number' || !selectedEmployee) return false;
      return paymentAmount > dueSalary;
  }, [paymentAmount, dueSalary, selectedEmployee]);

  const canProcessPayment = useMemo(() => {
      if (typeof paymentAmount !== 'number' || paymentAmount <= 0) return false;
      if (isOverpayment && user?.role !== 'admin') return false;
      return true;
  }, [paymentAmount, isOverpayment, user]);

  const handleAddPayment = useCallback(async () => {
    if (!selectedEmployee || typeof paymentAmount !== 'number' || paymentAmount <= 0) {
      toast({
        variant: 'destructive',
        title: t('invalid_amount_toast_title'),
        description: t('invalid_amount_toast_description'),
      });
      return;
    }

    if (isOverpayment && user?.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: t('overpayment_error_toast_title'),
        description: t('overpayment_permission_error'),
      });
      return;
    }
    
    setIsProcessing(true);

    const result = await addSalaryPayment({
      employeeId: selectedEmployee.id,
      amount: paymentAmount,
      date: new Date().toISOString(),
      paidBy: user?.email || 'unknown',
    });

    setIsProcessing(false);

    if (result) {
        toast({
          title: t('payment_successful_toast_title'),
          description: t('payment_successful_toast_description', { amount: paymentAmount.toFixed(2), name: selectedEmployee.name }),
        });
        
        setLastSuccessfulPayment({ payment: result, employee: selectedEmployee });
        setPaymentAmount('');
    }

  }, [selectedEmployee, paymentAmount, isOverpayment, user, addSalaryPayment, toast, t]);

    useEffect(() => {
        if (lastSuccessfulPayment) {
            const originalTitle = document.title;
            document.title = `salary-receipt-for-${lastSuccessfulPayment.employee.name}`;
            
            const handleAfterPrint = () => {
                document.title = originalTitle;
                setLastSuccessfulPayment(null);
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
            }
        }
    }, [lastSuccessfulPayment]);


  const handlePaymentConfirmation = () => {
    if (canProcessPayment) {
        setConfirmingPayment(true);
    }
  }

  const confirmPayment = async () => {
    setConfirmingPayment(false);
    await handleAddPayment();
  }

  return (
    <>
    <div className="flex flex-col h-full gap-4 no-print">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <Wallet className="w-6 h-6" />
        {t('salaries_page_title')}
      </h1>
      <div className="grid md:grid-cols-5 gap-6 flex-1">
        {/* Employee List */}
        <Card className="md:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>{t('employee_list_title')}</CardTitle>
            <CardDescription>{t('salaries_employee_list_description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full max-h-[calc(100vh-250px)]">
              <div className="divide-y">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                      selectedEmployee?.id === employee.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Payment Processing Card */}
        <Card className="md:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>{t('process_salary_payment_title')}</CardTitle>
             <CardDescription>
                {selectedEmployee ? t('for_employee_subtitle', { name: selectedEmployee.name }) : t('select_employee_from_list')}
             </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6 min-h-0">
            {!selectedEmployee ? (
                <div className="text-center text-muted-foreground py-12 flex-1 flex flex-col justify-center items-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/50"/>
                    <p className="mt-4">{t('please_select_employee')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                    {/* Payment Input & History Section */}
                    <div className="space-y-4 flex flex-col">
                        <div>
                          <h3 className="font-semibold text-lg">{t('payment_details_title')}</h3>
                          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                              <div className="flex justify-between text-sm"><span>{t('monthly_salary_label')}:</span> <span className="font-mono">৳ {selectedEmployee.salary.toFixed(2)}</span></div>
                              <div className="flex justify-between text-sm"><span>{t('paid_this_month_label')}:</span> <span className="font-mono">৳ {paidThisMonth.toFixed(2)}</span></div>
                              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>{t('due_this_month_label')}:</span> <span className="font-mono text-primary">৳ {dueSalary.toFixed(2)}</span></div>
                          </div>
                        </div>

                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">৳</span>
                            <Input 
                                type="text"
                                inputMode="decimal"
                                placeholder={t('enter_amount_to_pay_placeholder')}
                                className="pl-8"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                disabled={isProcessing}
                            />
                        </div>
                        
                        {isOverpayment && (
                            <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${user?.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {user?.role === 'admin' ? <ShieldCheck className="h-5 w-5"/> : <AlertCircle className="h-5 w-5"/>}
                                <div>
                                    <p className="font-semibold">
                                     {user?.role === 'admin' ? t('admin_advance_payment') : t('amount_exceeds_due')}
                                    </p>
                                    <p>{user?.role === 'admin' ? t('authorizing_advance_payment') : t('ask_admin_for_approval')}</p>
                                </div>
                            </div>
                        )}
                        
                        <Button className="w-full" disabled={!canProcessPayment || isProcessing} onClick={handlePaymentConfirmation}>
                             {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Printer className="mr-2 h-4 w-4"/>}
                             {isProcessing ? "Processing..." : t('pay_and_print_receipt_button', { amount: typeof paymentAmount === 'number' && paymentAmount > 0 ? ` ৳${paymentAmount.toFixed(2)}` : '' })}
                        </Button>
                        <div className="flex-1 min-h-0">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mt-4 mb-2"><History className="w-5 h-5"/> {t('monthly_payment_history_title')}</h3>
                            <ScrollArea className="h-32 rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('date_header')}</TableHead>
                                            <TableHead className="text-right">{t('amount_header')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentsThisMonth.length > 0 ? (
                                            paymentsThisMonth.map(payment => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{format(new Date(payment.date), 'PP')}</TableCell>
                                                    <TableCell className="text-right font-mono">৳ {(payment.amount || 0).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                                    {t('no_payments_this_month')}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>
                    </div>

                    {/* Receipt Preview Section */}
                    <div className="space-y-4 flex flex-col min-h-0">
                        <h3 className="font-semibold text-lg">{t('live_receipt_preview_title')}</h3>
                        <ScrollArea className="flex-1">
                            <div className="bg-muted/50 p-4 rounded-lg">
                               <SalaryReceipt 
                                    employee={selectedEmployee}
                                    paymentAmount={typeof paymentAmount === 'number' ? paymentAmount : 0}
                                    paymentDate={new Date()}
                               />
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
     <div className="print-source">
        {lastSuccessfulPayment && (
            <SalaryReceipt
                employee={lastSuccessfulPayment.employee}
                paymentAmount={lastSuccessfulPayment.payment.amount}
                paymentDate={new Date(lastSuccessfulPayment.payment.date)}
            />
        )}
      </div>
    <AlertDialog open={isConfirmingPayment} onOpenChange={setConfirmingPayment}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('are_you_sure_title')}</AlertDialogTitle>
                <AlertDialogDescription>
                    You are about to pay <strong>৳ {typeof paymentAmount === 'number' ? paymentAmount.toFixed(2) : '0.00'}</strong> to <strong>{selectedEmployee?.name}</strong>. This will be recorded and a receipt will be printed. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmPayment} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm & Print
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    