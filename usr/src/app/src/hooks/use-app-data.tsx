
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import type { Product, Invoice, Buyer, Expense, Employee, Attendance, SalaryPayment, Payment, AttendanceStatus } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import type { DraftInvoice } from './use-invoice-form';
import { isSameDay, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { useSettings } from './use-settings';
import * as productActions from '@/lib/actions/product-actions';
import * as dataActions from '@/lib/actions/data-actions';
import { Loader2 } from 'lucide-react';


interface AppDataContextType {
    products: Product[];
    invoices: Invoice[];
    buyers: Buyer[];
    expenses: Expense[];
    employees: Employee[];
    attendance: Attendance[];
    salaryPayments: SalaryPayment[];
    payments: Payment[];
    isAppDataLoading: boolean;
    isDbConnected: boolean;
    lastInvoiceId: number;
    
    // Product Functions
    addProduct: (product: Omit<Product, 'id' | 'sellingPrice'>) => Promise<void>;
    addMultipleProducts: (products: Omit<Product, 'id'|'sellingPrice'>[]) => Promise<void>;
    updateProduct: (productId: string, updatedData: Omit<Product, 'id' | 'sellingPrice'>) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    getProductById: (productId: string) => Product | undefined;

    // Invoice & Buyer Functions
    addInvoice: (draftInvoice: DraftInvoice) => Promise<number | null>;
    deleteInvoice: (invoiceId: number) => Promise<void>;
    printInvoice: (invoice: Invoice) => Promise<void>;
    getBuyerById: (buyerId: string) => Buyer | undefined;
    getInvoicesForBuyer: (buyerId: string) => Invoice[];
    getInvoicesForDateRange: (startDate: Date, endDate: Date) => Invoice[];
    getGrossProfitForDateRange: (invoices: Invoice[]) => number;


    // Payment Functions
    addPayment: (payment: Omit<Payment, 'id' | 'date'>) => Promise<{ payment: Payment; updatedInvoice: Invoice } | null>;
    getPaymentsForInvoice: (invoiceId: number) => Payment[];

    // Expense Functions
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    updateExpense: (expenseId: string, updatedData: Omit<Expense, 'id'>) => Promise<void>;
    deleteExpense: (expenseId: string) => Promise<void>;
    getExpensesForDateRange: (startDate: Date, endDate: Date) => Expense[];
    
    // Employee Functions
    addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
    updateEmployee: (employeeId: string, updatedData: Omit<Employee, 'id'>) => Promise<void>;
    deleteEmployee: (employeeId: string) => Promise<void>;
    markAttendance: (employeeId: string, date: Date, status: AttendanceStatus) => Promise<void>;
    getAttendanceForDate: (date: Date) => Attendance[];

    // Salary Functions
    addSalaryPayment: (payment: Omit<SalaryPayment, 'id'>) => Promise<SalaryPayment | null>;
    getPaymentsForMonth: (employeeId: string, startDate: Date, endDate: Date) => SalaryPayment[];
    getSalaryPaymentsForDateRange: (startDate: Date, endDate: Date) => SalaryPayment[];
    getDueSalaryForMonth: (employee: Employee, date: Date) => number;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const { settings } = useSettings();

    const [products, setProducts] = useState<Product[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [buyers, setBuyers] = useState<Buyer[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isAppDataLoading, setIsAppDataLoading] = useState(true);
    const [isDbConnected, setIsDbConnected] = useState(false);
    const [lastInvoiceId, setLastInvoiceId] = useState(0);

    const loadAllData = useCallback(async () => {
        setIsAppDataLoading(true);
        try {
            const isConnected = await productActions.checkDbConnection();
            setIsDbConnected(isConnected);

            if (isConnected) {
                const [serverProducts, serverData] = await Promise.all([
                    productActions.getAllProducts(),
                    dataActions.getAllData()
                ]);
                setProducts(serverProducts);
                setInvoices(serverData.invoices);
                setBuyers(serverData.buyers);
                setExpenses(serverData.expenses);
                setEmployees(serverData.employees);
                setAttendance(serverData.attendance);
                setSalaryPayments(serverData.salaryPayments);
                setPayments(serverData.payments);
                setLastInvoiceId(serverData.invoices[0]?.id || 0);
            } else {
                 toast({ variant: 'destructive', title: 'Database Connection Failed', description: 'Could not connect to the database. Please ensure it is running.' });
            }
        } catch (error) {
            console.error("Failed to load app data:", error);
            toast({ variant: 'destructive', title: 'Data Loading Error', description: 'An error occurred while fetching data from the database.' });
        } finally {
            setIsAppDataLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        loadAllData();
    }, [loadAllData]);
    
    const printInvoice = useCallback(async (invoice: Invoice) => {
        if (settings.printFormat === 'pos' && settings.posPrinterType !== 'disabled') {
            const printerConfig = {
                type: settings.posPrinterType,
                options: { host: settings.posPrinterHost, port: settings.posPrinterPort }
            };
            const orderData = {
                orderId: String(invoice.id),
                customerName: invoice.customerName,
                items: invoice.items,
                subtotal: invoice.subtotal,
                tax: 0,
                total: invoice.subtotal
            };

            const response = await fetch('/api/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ printer: printerConfig, data: orderData }),
            });

            if (!response.ok) {
                const result = await response.json();
                toast({ variant: 'destructive', title: 'POS Print Error', description: result.message || 'Failed to print to POS device.' });
                throw new Error(result.message || 'Failed to print to POS device.');
            } else {
                 toast({ title: 'Print Job Sent', description: 'Sent to POS printer successfully.' });
            }
        }
    }, [settings, toast]);


    const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'sellingPrice'>) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot add product while offline.' });
             return;
        }
        try {
            await productActions.addProduct(productData);
            await loadAllData();
            toast({ title: "Product Added", description: `${productData.name} has been added.` });
        } catch (error) {
            console.error("Failed to add product:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add product. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const addMultipleProducts = useCallback(async (productsData: Omit<Product, 'id' | 'sellingPrice'>[]) => {
       if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot add products while offline.' });
             return;
        }
        try {
            await productActions.addMultipleProducts(productsData);
            await loadAllData();
        } catch (error) {
             console.error("Failed to add multiple products:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add products in bulk. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const updateProduct = useCallback(async (productId: string, updatedData: Omit<Product, 'id' | 'sellingPrice'>) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot update product while offline.' });
             return;
        }
        try {
            await productActions.updateProduct(productId, updatedData);
            await loadAllData();
            toast({ title: "Product Updated", description: `Details for ${updatedData.name} have been updated.` });
        } catch (error) {
            console.error("Failed to update product:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update product. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const deleteProduct = useCallback(async (productId: string) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot delete product while offline.' });
             return;
        }
        try {
            await productActions.deleteProduct(productId);
            await loadAllData();
            toast({ title: "Product Deleted", description: `The product has been removed.` });
        } catch (error) {
             console.error("Failed to delete product:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const getProductById = useCallback((productId: string) => products.find(p => p.id === productId), [products]);

    const addInvoice = useCallback(async (draftInvoice: DraftInvoice): Promise<number | null> => {
        const invoiceToSave: Omit<Invoice, 'id'> = {
          buyerId: draftInvoice.buyerId,
          customerName: draftInvoice.customerName,
          customerAddress: draftInvoice.customerAddress,
          customerPhone: draftInvoice.customerPhone,
          items: draftInvoice.items.map(({ originalPrice, ...item }) => item),
          subtotal: draftInvoice.subtotal,
          paidAmount: draftInvoice.paidAmount || 0,
          dueAmount: draftInvoice.dueAmount,
          date: new Date().toISOString(),
        };
        
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot save invoice while offline.' });
             return null;
        }
        try {
            const newInvoice = await dataActions.addInvoice(invoiceToSave, invoiceToSave.items);
            await loadAllData();
            if (settings.printFormat === 'pos' && settings.posPrinterType !== 'disabled') {
               await printInvoice(newInvoice);
            }
            return newInvoice.id;
        } catch (error) {
            console.error("Failed to save invoice:", error);
            throw error; // Re-throw to be caught by the calling function
        }
    }, [isDbConnected, loadAllData, settings, printInvoice, toast]);
    
    const deleteInvoice = useCallback(async (invoiceId: number) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot delete invoice while offline.' });
             return;
        }
        try {
            await dataActions.deleteInvoice(invoiceId);
            await loadAllData();
            toast({ title: "Invoice Deleted", description: `Invoice #${invoiceId} has been successfully deleted.` });
        } catch (error) {
            console.error("Failed to delete invoice:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete invoice. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const getBuyerById = useCallback((buyerId: string) => buyers.find(b => b.id === buyerId), [buyers]);

    const getInvoicesForBuyer = useCallback((buyerId: string) => {
        return invoices.filter(inv => inv.buyerId === buyerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoices]);

    const getInvoicesForDateRange = useCallback((startDate: Date, endDate: Date) => {
        const start = startOfDay(startDate);
        const end = endOfDay(endDate);
        return invoices.filter(inv => {
            const invDate = new Date(inv.date);
            return isWithinInterval(invDate, { start, end });
        });
    }, [invoices]);
    
    const getGrossProfitForDateRange = useCallback((invoicesInRange: Invoice[]) => {
        let totalProfit = 0;
        const productMap = new Map(products.map(p => [p.id, p]));

        for (const invoice of invoicesInRange) {
            for (const item of invoice.items) {
                const product = productMap.get(item.id);
                if (product) {
                    const profitPerUnit = item.price - product.buyingPrice;
                    totalProfit += profitPerUnit * item.quantity;
                }
            }
        }
        return totalProfit;
    }, [products]);


    const addPayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'date'>): Promise<{ payment: Payment; updatedInvoice: Invoice } | null> => {
        if (!isDbConnected) {
            toast({ variant: 'destructive', title: 'Offline', description: 'Cannot process payment while offline.' });
            return null;
        }
        try {
            const result = await dataActions.addPayment(paymentData);
            // Instead of full reload, update state locally for immediate feedback
            setPayments(prev => [result.payment, ...prev]);
            setInvoices(prev => prev.map(inv => inv.id === result.updatedInvoice.id ? result.updatedInvoice : inv));
            return result;
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Payment Error', description: error.message || "Failed to process payment. Check DB connection."});
            return null;
        }
    }, [isDbConnected, toast]);

    const getPaymentsForInvoice = useCallback((invoiceId: number) => {
        return payments.filter(p => p.invoiceId === invoiceId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payments]);

    const addExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot add expense while offline.' });
             return;
        }
        try {
            await dataActions.addExpense(expenseData);
            await loadAllData();
            toast({ title: "Expense Added", description: `New expense of ৳ ${expenseData.amount} has been recorded.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add expense. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const updateExpense = useCallback(async (expenseId: string, updatedData: Omit<Expense, 'id'>) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot update expense while offline.' });
             return;
        }
        try {
            await dataActions.updateExpense(expenseId, updatedData);
            await loadAllData();
            toast({ title: "Expense Updated", description: "The expense details have been updated." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update expense. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const deleteExpense = useCallback(async (expenseId: string) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot delete expense while offline.' });
             return;
        }
        try {
            await dataActions.deleteExpense(expenseId);
            await loadAllData();
            toast({ title: "Expense Deleted", description: "The expense record has been removed." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete expense. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);
    
    const getExpensesForDateRange = useCallback((startDate: Date, endDate: Date) => {
        const start = startOfDay(startDate);
        const end = endOfDay(endDate);
        return expenses.filter(exp => isWithinInterval(new Date(exp.date), { start, end }));
    }, [expenses]);

    const addEmployee = useCallback(async (employeeData: Omit<Employee, 'id'>) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot add employee while offline.' });
             return;
        }
        try {
            await dataActions.addEmployee(employeeData);
            await loadAllData();
            toast({ title: "Employee Added", description: `${employeeData.name} has been added.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add employee. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const updateEmployee = useCallback(async (employeeId: string, updatedData: Omit<Employee, 'id'>) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot update employee while offline.' });
             return;
        }
        try {
            await dataActions.updateEmployee(employeeId, updatedData);
            await loadAllData();
            toast({ title: "Employee Updated", description: "The employee details have been updated." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update employee. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const deleteEmployee = useCallback(async (employeeId: string) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot delete employee while offline.' });
             return;
        }
        try {
            await dataActions.deleteEmployee(employeeId);
            await loadAllData();
            toast({ title: "Employee Deleted", description: "The employee record has been removed." });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete employee. Check DB connection.' });
        }
    }, [isDbConnected, toast, loadAllData]);

    const markAttendance = useCallback(async (employeeId: string, date: Date, status: AttendanceStatus) => {
        if (!isDbConnected) {
             toast({ variant: 'destructive', title: 'Offline', description: 'Cannot mark attendance while offline.' });
             return;
        }
        try {
            await dataActions.markAttendance({ employeeId, date: date.toISOString(), status });
            await loadAllData();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to mark attendance. Check DB connection.' });
        }
    }, [isDbConnected, loadAllData, toast]);

    const getAttendanceForDate = useCallback((date: Date) => {
        return attendance.filter(a => isSameDay(new Date(a.date), date));
    }, [attendance]);

    const addSalaryPayment = useCallback(async (paymentData: Omit<SalaryPayment, 'id'>): Promise<SalaryPayment | null> => {
        if (!isDbConnected) {
            toast({ variant: 'destructive', title: 'Offline', description: 'Cannot add salary payment while offline.' });
            return null;
        }
        try {
            const newPayment = await dataActions.addSalaryPayment(paymentData);
            await loadAllData();
            return newPayment;
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to add salary payment. Check DB connection.' });
            return null;
        }
    }, [isDbConnected, loadAllData, toast]);

    const getPaymentsForMonth = useCallback((employeeId: string, startDate: Date, endDate: Date) => {
        return salaryPayments.filter(p => 
            p.employeeId === employeeId && 
            isWithinInterval(new Date(p.date), { start: startOfMonth(startDate), end: endOfMonth(endDate) })
        );
    }, [salaryPayments]);
    
    const getSalaryPaymentsForDateRange = useCallback((startDate: Date, endDate: Date) => {
        const start = startOfDay(startDate);
        const end = endOfDay(endDate);
        return salaryPayments.filter(p => isWithinInterval(new Date(p.date), { start, end }));
    }, [salaryPayments]);

    const getDueSalaryForMonth = useCallback((employee: Employee, date: Date) => {
        if (!employee) return 0;
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const totalPaid = getPaymentsForMonth(employee.id, monthStart, monthEnd).reduce((sum, p) => sum + (p.amount || 0), 0);
        return employee.salary - totalPaid;
    }, [getPaymentsForMonth]);

    const value = useMemo(() => ({
        products, invoices, buyers, expenses, employees, attendance, salaryPayments, payments, isAppDataLoading, isDbConnected, lastInvoiceId,
        addProduct, addMultipleProducts, updateProduct, deleteProduct, getProductById,
        addInvoice, deleteInvoice, printInvoice, getBuyerById, getInvoicesForBuyer, getInvoicesForDateRange, getGrossProfitForDateRange,
        addPayment, getPaymentsForInvoice,
        addExpense, updateExpense, deleteExpense, getExpensesForDateRange,
        addEmployee, updateEmployee, deleteEmployee, markAttendance, getAttendanceForDate,
        addSalaryPayment, getPaymentsForMonth, getSalaryPaymentsForDateRange, getDueSalaryForMonth
    }), [
        products, invoices, buyers, expenses, employees, attendance, salaryPayments, payments, isAppDataLoading, isDbConnected, lastInvoiceId,
        addProduct, addMultipleProducts, updateProduct, deleteProduct, getProductById,
        addInvoice, deleteInvoice, printInvoice, getBuyerById, getInvoicesForBuyer, getInvoicesForDateRange, getGrossProfitForDateRange,
        addPayment, getPaymentsForInvoice,
        addExpense, updateExpense, deleteExpense, getExpensesForDateRange,
        addEmployee, updateEmployee, deleteEmployee, markAttendance, getAttendanceForDate,
        addSalaryPayment, getPaymentsForMonth, getSalaryPaymentsForDateRange, getDueSalaryForMonth
    ]);
    
    if (isAppDataLoading && !isDbConnected) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Connecting to database...</p>
                </div>
            </div>
        );
    }
    
     if (isAppDataLoading) {
        return (
            <div className="flex h-svh w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <AppDataContext.Provider value={value}>
            {children}
        </AppDataContext.Provider>
    );
}

export function useAppData() {
    const context = useContext(AppDataContext);
    if (context === undefined) {
        throw new Error('useAppData must be used within a DataProvider');
    }
    return context;
}
