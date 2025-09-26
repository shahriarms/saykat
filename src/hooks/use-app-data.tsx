
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import type { Product, Invoice, Buyer, Expense, Employee, Attendance, SalaryPayment, Payment, AttendanceStatus, InvoiceItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import type { DraftInvoice } from './use-invoice-form';
import { isSameDay, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { useSettings } from './use-settings';
import * as productActions from '@/lib/actions/product-actions';
import * as dataActions from '@/lib/actions/data-actions';
import { Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';

const LOCAL_STORAGE_KEYS = {
    products: 'stockpilot-products',
    invoices: 'stockpilot-invoices',
    buyers: 'stockpilot-buyers',
    expenses: 'stockpilot-expenses',
    employees: 'stockpilot-employees',
    attendance: 'stockpilot-attendance',
    salaryPayments: 'stockpilot-salaryPayments',
    payments: 'stockpilot-payments',
    lastInvoiceId: 'stockpilot-lastInvoiceId',
};


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
    centralDateRange: DateRange | undefined;
    setCentralDateRange: (dateRange: DateRange | undefined) => void;
    
    // Product Functions
    addProduct: (product: Omit<Product, 'id' | 'sellingPrice'>) => Promise<void>;
    addMultipleProducts: (products: Omit<Product, 'id'|'sellingPrice'>[]) => Promise<void>;
    updateProduct: (productId: string, updatedData: Partial<Omit<Product, 'id' | 'sellingPrice'>>, isAdditive: boolean) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    getProductById: (productId: string) => Product | undefined;

    // Invoice & Buyer Functions
    addInvoice: (draftInvoice: DraftInvoice) => Promise<number | null>;
    updateInvoice: (invoiceId: number, draftInvoice: DraftInvoice) => Promise<number | null>;
    deleteInvoice: (invoiceId: number) => Promise<void>;
    printInvoice: (invoice: Invoice) => Promise<void>;
    getBuyerById: (buyerId: string) => Buyer | undefined;
    getInvoicesForBuyer: (buyerId: string) => Invoice[];
    getInvoicesForDateRange: (startDate: Date, endDate: Date) => Invoice[];
    getGrossProfitForDateRange: (invoices: Invoice[]) => { grossProfit: number, cogs: number };


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
    deleteSalaryPayment: (paymentId: string) => Promise<void>;
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
    const [centralDateRange, setCentralDateRange] = useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });

    const loadDataFromLocalStorage = useCallback(() => {
        try {
            const localProducts = localStorage.getItem(LOCAL_STORAGE_KEYS.products);
            const localInvoices = localStorage.getItem(LOCAL_STORAGE_KEYS.invoices);
            const localBuyers = localStorage.getItem(LOCAL_STORAGE_KEYS.buyers);
            const localExpenses = localStorage.getItem(LOCAL_STORAGE_KEYS.expenses);
            const localEmployees = localStorage.getItem(LOCAL_STORAGE_KEYS.employees);
            const localAttendance = localStorage.getItem(LOCAL_STORAGE_KEYS.attendance);
            const localSalaryPayments = localStorage.getItem(LOCAL_STORAGE_KEYS.salaryPayments);
            const localPayments = localStorage.getItem(LOCAL_STORAGE_KEYS.payments);
            const localLastInvoiceId = localStorage.getItem(LOCAL_STORAGE_KEYS.lastInvoiceId);

            setProducts(localProducts ? JSON.parse(localProducts) : []);
            setInvoices(localInvoices ? JSON.parse(localInvoices) : []);
            setBuyers(localBuyers ? JSON.parse(localBuyers) : []);
            setExpenses(localExpenses ? JSON.parse(localExpenses) : []);
            setEmployees(localEmployees ? JSON.parse(localEmployees) : []);
            setAttendance(localAttendance ? JSON.parse(localAttendance) : []);
            setSalaryPayments(localSalaryPayments ? JSON.parse(localSalaryPayments) : []);
            setPayments(localPayments ? JSON.parse(localPayments) : []);
            setLastInvoiceId(localLastInvoiceId ? JSON.parse(localLastInvoiceId) : 0);
            toast({ title: 'Running Offline', description: 'Using local storage for data. Changes will not be saved to the database.' });
        } catch (error) {
            console.error("Failed to load data from local storage:", error);
            toast({ variant: 'destructive', title: 'Local Storage Error', description: 'Could not load data from local storage.' });
        }
    }, [toast]);

    const saveDataToLocalStorage = useCallback((key: keyof typeof LOCAL_STORAGE_KEYS, data: any) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS[key], JSON.stringify(data));
    }, []);

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
                loadDataFromLocalStorage();
            }
        } catch (error) {
            console.error("Failed to load app data:", error);
            loadDataFromLocalStorage();
        } finally {
            setIsAppDataLoading(false);
        }
    }, [toast, loadDataFromLocalStorage]);
    
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
        if (isDbConnected) {
            try {
                await productActions.addProduct(productData);
                await loadAllData();
                toast({ title: "Product Added", description: `${productData.name} has been added.` });
            } catch (error) {
                console.error("Failed to add product:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add product. Check DB connection.' });
            }
        } else {
            const sellingPrice = productData.buyingPrice + (productData.buyingPrice * productData.profitMargin / 100);
            const newProduct: Product = { 
                ...productData, 
                sellingPrice, 
                id: `prod-${Date.now()}`,
                initialStock: productData.stock,
                containerSize: productData.stock,
            };
            const newProducts = [...products, newProduct];
            setProducts(newProducts);
            saveDataToLocalStorage('products', newProducts);
            toast({ title: "Product Added (Local)", description: `${productData.name} has been added locally.` });
        }
    }, [isDbConnected, toast, loadAllData, products, saveDataToLocalStorage]);

    const addMultipleProducts = useCallback(async (productsData: Omit<Product, 'id'|'sellingPrice'>[]) => {
        if (isDbConnected) {
            try {
                await productActions.addMultipleProducts(productsData);
                await loadAllData();
            } catch (error) {
                 console.error("Failed to add multiple products:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add products in bulk. Check DB connection.' });
            }
        } else {
            const newProducts = productsData.map(p => ({
                ...p,
                sellingPrice: p.buyingPrice + (p.buyingPrice * p.profitMargin / 100),
                id: `prod-${Date.now()}-${Math.random()}`,
                initialStock: p.stock,
                containerSize: p.stock,
            }));
            const updatedProducts = [...products, ...newProducts];
            setProducts(updatedProducts);
            saveDataToLocalStorage('products', updatedProducts);
            toast({ title: "Products Added (Local)", description: `${newProducts.length} products added locally.` });
        }
    }, [isDbConnected, toast, loadAllData, products, saveDataToLocalStorage]);

    const updateProduct = useCallback(async (productId: string, updatedData: Partial<Omit<Product, 'id' | 'sellingPrice'>>, isAdditive: boolean) => {
        const productToUpdate = products.find(p => p.id === productId);
        if (!productToUpdate) return;
    
        let completeUpdateData: Partial<Omit<Product, 'id' | 'sellingPrice'>>;
    
        if (isAdditive) {
            const stockToAdd = updatedData.stock || 0;
            completeUpdateData = { ...updatedData, stock: stockToAdd };
        } else {
            completeUpdateData = { ...updatedData };
        }
    
        if (isDbConnected) {
            try {
                await productActions.updateProduct(productId, completeUpdateData, isAdditive);
                await loadAllData();
                toast({ title: "Product Updated", description: `Details for ${completeUpdateData.name || 'product'} have been updated.` });
            } catch (error) {
                console.error("Failed to update product:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to update product. Check DB connection.' });
            }
        } else {
            // Local storage logic
            let finalProductData: Product;
            if (isAdditive) {
                const stockToAdd = updatedData.stock || 0;
                const finalStock = productToUpdate.stock + stockToAdd;
                 finalProductData = {
                    ...productToUpdate,
                    ...completeUpdateData,
                    stock: finalStock,
                    initialStock: finalStock,
                    containerSize: finalStock,
                };
            } else {
                finalProductData = {
                    ...productToUpdate,
                    ...completeUpdateData,
                    sellingPrice: (completeUpdateData.buyingPrice !== undefined && completeUpdateData.profitMargin !== undefined) 
                        ? completeUpdateData.buyingPrice + (completeUpdateData.buyingPrice * completeUpdateData.profitMargin / 100) 
                        : productToUpdate.sellingPrice,
                };
            }
    
            const newProducts = products.map(p => p.id === productId ? finalProductData : p);
            
            setProducts(newProducts);
            saveDataToLocalStorage('products', newProducts);
            toast({ title: "Product Updated (Local)", description: `Details updated locally.` });
        }
    }, [isDbConnected, toast, loadAllData, products, saveDataToLocalStorage]);

    const deleteProduct = useCallback(async (productId: string) => {
        if (isDbConnected) {
            try {
                await productActions.deleteProduct(productId);
                await loadAllData();
                toast({ title: "Product Deleted", description: `The product has been removed.` });
            } catch (error) {
                 console.error("Failed to delete product:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product. Check DB connection.' });
            }
        } else {
            const newProducts = products.filter(p => p.id !== productId);
            setProducts(newProducts);
            saveDataToLocalStorage('products', newProducts);
            toast({ title: "Product Deleted (Local)", description: `The product has been removed locally.` });
        }
    }, [isDbConnected, toast, loadAllData, products, saveDataToLocalStorage]);

    const getProductById = useCallback((productId: string) => products.find(p => p.id === productId), [products]);
    
    const getFinalInvoiceData = (draftInvoice: DraftInvoice, date: string): Omit<Invoice, 'id'> => {
        const finalItems: InvoiceItem[] = draftInvoice.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: parseFloat(String(item.quantity)) || 0,
            price: parseFloat(String(item.price)) || 0,
            buyingPrice: item.buyingPrice,
            profitAmount: item.profitAmount,
        }));

        return {
            buyerId: draftInvoice.buyerId,
            customerName: draftInvoice.customerName,
            customerAddress: draftInvoice.customerAddress,
            customerPhone: draftInvoice.customerPhone,
            items: finalItems,
            subtotal: draftInvoice.subtotal,
            paidAmount: draftInvoice.paidAmount || 0,
            dueAmount: draftInvoice.dueAmount,
            date,
            totalProfit: draftInvoice.totalProfit,
        };
    }

    const addInvoice = useCallback(async (draftInvoice: DraftInvoice): Promise<number | null> => {
        const invoiceToSave = getFinalInvoiceData(draftInvoice, new Date().toISOString());
        
        if (isDbConnected) {
            try {
                const newInvoice = await dataActions.addInvoice(invoiceToSave);
                await loadAllData();
                if (settings.printFormat === 'pos' && settings.posPrinterType !== 'disabled') {
                   await printInvoice(newInvoice);
                }
                return newInvoice.id;
            } catch (error) {
                console.error("Failed to save invoice:", error);
                throw error; // Re-throw to be caught by the calling function
            }
        } else {
            // --- Local Storage Logic ---
            const newId = lastInvoiceId + 1;
            let newInvoiceData = { ...invoiceToSave };
            
            let tempBuyers = [...buyers];
            let buyerToUpdate = tempBuyers.find(b => b.id === newInvoiceData.buyerId);
    
            if (buyerToUpdate) {
                tempBuyers = tempBuyers.map(b => b.id === buyerToUpdate!.id ? { ...b, invoiceIds: [...b.invoiceIds, String(newId)] } : b);
            } else if (newInvoiceData.customerName) {
                buyerToUpdate = tempBuyers.find(b => b.name.toLowerCase() === newInvoiceData.customerName.toLowerCase());
                 if (buyerToUpdate) {
                     newInvoiceData.buyerId = buyerToUpdate.id;
                     tempBuyers = tempBuyers.map(b => b.id === buyerToUpdate!.id ? { ...b, invoiceIds: [...b.invoiceIds, String(newId)] } : b);
                 } else {
                    const newBuyerId = `buyer-${Date.now()}`;
                    newInvoiceData.buyerId = newBuyerId;
                    const newBuyer: Buyer = {
                        id: newBuyerId,
                        name: newInvoiceData.customerName,
                        address: newInvoiceData.customerAddress,
                        phone: newInvoiceData.customerPhone,
                        invoiceIds: [String(newId)]
                    };
                    tempBuyers.push(newBuyer);
                 }
            }
    
            setBuyers(tempBuyers);
            saveDataToLocalStorage('buyers', tempBuyers);
    
            const finalInvoice: Invoice = { ...newInvoiceData, id: newId };

            const newInvoices = [finalInvoice, ...invoices];
            setInvoices(newInvoices);
            saveDataToLocalStorage('invoices', newInvoices);
            
            setLastInvoiceId(newId);
            saveDataToLocalStorage('lastInvoiceId', newId);

            // Update stock locally
            const stockUpdates = finalInvoice.items.map(item => ({ id: item.id, stockChange: -item.quantity }));
            const newProducts = products.map(p => {
                const update = stockUpdates.find(u => u.id === p.id);
                return update ? { ...p, stock: p.stock + update.stockChange } : p;
            });
            setProducts(newProducts);
            saveDataToLocalStorage('products', newProducts);
            
            toast({ title: "Invoice Saved (Local)", description: `Invoice #${newId} saved locally.` });
            
            if (settings.printFormat === 'pos' && settings.posPrinterType !== 'disabled') {
                await printInvoice(finalInvoice);
            }
            return newId;
        }
    }, [isDbConnected, lastInvoiceId, invoices, products, buyers, loadAllData, settings, printInvoice, toast, saveDataToLocalStorage]);

    const updateInvoice = useCallback(async (invoiceId: number, draftInvoice: DraftInvoice): Promise<number | null> => {
        const originalInvoice = invoices.find(inv => inv.id === invoiceId);
        if (!originalInvoice) {
            toast({ variant: 'destructive', title: 'Error', description: 'Original invoice not found for update.' });
            return null;
        }

        const invoiceToSave = getFinalInvoiceData(draftInvoice, originalInvoice.date);

        if (isDbConnected) {
            try {
                const updatedInvoice = await dataActions.updateInvoice(invoiceId, invoiceToSave);
                await loadAllData();
                if (settings.printFormat === 'pos' && settings.posPrinterType !== 'disabled') {
                    await printInvoice(updatedInvoice);
                }
                return updatedInvoice.id;
            } catch (error) {
                 console.error("Failed to update invoice:", error);
                throw error;
            }
        } else {
            // Local storage update logic
            const newInvoices = invoices.map(inv => inv.id === invoiceId ? { ...invoiceToSave, id: invoiceId } : inv);
            setInvoices(newInvoices);
            saveDataToLocalStorage('invoices', newInvoices);
            
            // Adjust stock
            const originalItems = originalInvoice.items;
            const newItems = invoiceToSave.items;
            const stockChanges = new Map<string, number>();

            originalItems.forEach(item => {
                stockChanges.set(item.id, (stockChanges.get(item.id) || 0) + item.quantity);
            });
            newItems.forEach(item => {
                stockChanges.set(item.id, (stockChanges.get(item.id) || 0) - item.quantity);
            });

            const newProducts = products.map(p => {
                if (stockChanges.has(p.id)) {
                    return { ...p, stock: p.stock + (stockChanges.get(p.id) || 0) };
                }
                return p;
            });
            setProducts(newProducts);
            saveDataToLocalStorage('products', newProducts);
            
            toast({ title: "Invoice Updated (Local)", description: `Invoice #${invoiceId} updated locally.` });

            if (settings.printFormat === 'pos' && settings.posPrinterType !== 'disabled') {
                await printInvoice({ ...invoiceToSave, id: invoiceId });
            }
            return invoiceId;
        }
    }, [isDbConnected, invoices, products, loadAllData, settings, printInvoice, toast, saveDataToLocalStorage]);
    
    const deleteInvoice = useCallback(async (invoiceId: number) => {
        if (isDbConnected) {
            try {
                await dataActions.deleteInvoice(invoiceId);
                await loadAllData();
                toast({ title: "Invoice Deleted", description: `Invoice #${invoiceId} has been successfully deleted.` });
            } catch (error) {
                console.error("Failed to delete invoice:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete invoice. Check DB connection.' });
            }
        } else {
            const invoiceToDelete = invoices.find(inv => inv.id === invoiceId);
            if (!invoiceToDelete) return;

            const newInvoices = invoices.filter(inv => inv.id !== invoiceId);
            setInvoices(newInvoices);
            saveDataToLocalStorage('invoices', newInvoices);

            // Update buyer's invoice list or delete buyer
            let tempBuyers = [...buyers];
            if (invoiceToDelete.buyerId) {
                const buyer = tempBuyers.find(b => b.id === invoiceToDelete.buyerId);
                if (buyer) {
                    const updatedInvoiceIds = buyer.invoiceIds.filter(id => id !== String(invoiceId));
                    if (updatedInvoiceIds.length === 0) {
                        // If no invoices are left, delete the buyer
                        tempBuyers = tempBuyers.filter(b => b.id !== invoiceToDelete.buyerId);
                    } else {
                        // Otherwise, just update the buyer's invoice list
                        tempBuyers = tempBuyers.map(b => b.id === invoiceToDelete.buyerId ? { ...b, invoiceIds: updatedInvoiceIds } : b);
                    }
                    setBuyers(tempBuyers);
                    saveDataToLocalStorage('buyers', tempBuyers);
                }
            }
            
            const newPayments = payments.filter(p => p.invoiceId !== invoiceId);
            setPayments(newPayments);
            saveDataToLocalStorage('payments', newPayments);
            
            const stockUpdates = invoiceToDelete.items.map(item => ({ id: item.id, stockChange: +item.quantity }));
            const newProducts = products.map(p => {
                const update = stockUpdates.find(u => u.id === p.id);
                return update ? { ...p, stock: p.stock + update.stockChange } : p;
            });
            setProducts(newProducts);
            saveDataToLocalStorage('products', newProducts);
            toast({ title: "Invoice Deleted (Local)", description: `Invoice #${invoiceId} deleted locally.` });
        }
    }, [isDbConnected, toast, loadAllData, invoices, payments, products, buyers, saveDataToLocalStorage]);

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
    
    const getGrossProfitForDateRange = useCallback((invoicesInRange: Invoice[]): { grossProfit: number; cogs: number } => {
        let totalGrossProfit = 0;
        let totalCOGS = 0;
        
        for (const invoice of invoicesInRange) {
            const subtotal = parseFloat(String(invoice.subtotal)) || 0;
            const invoiceProfit = parseFloat(String(invoice.totalProfit)) || 0;

            if (typeof invoice.totalProfit === 'number' && isFinite(invoiceProfit)) {
                totalGrossProfit += invoiceProfit;
                totalCOGS += (subtotal - invoiceProfit);
            } else {
                let cogsForInvoice = 0;
                for (const item of invoice.items) {
                    cogsForInvoice += (parseFloat(String(item.buyingPrice)) || 0) * (parseFloat(String(item.quantity)) || 0);
                }
                totalCOGS += cogsForInvoice;
                totalGrossProfit += (subtotal - cogsForInvoice);
            }
        }
        return { grossProfit: totalGrossProfit, cogs: totalCOGS };
    }, []);


    const addPayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'date'>): Promise<{ payment: Payment; updatedInvoice: Invoice } | null> => {
        if (isDbConnected) {
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
        } else {
            const newPayment: Payment = { ...paymentData, id: `pay-${Date.now()}`, date: new Date().toISOString() };
            const newPayments = [newPayment, ...payments];
            setPayments(newPayments);
            saveDataToLocalStorage('payments', newPayments);
            
            let updatedInvoice: Invoice | null = null;
            const newInvoices = invoices.map(inv => {
                if (inv.id === paymentData.invoiceId) {
                    updatedInvoice = { ...inv, paidAmount: inv.paidAmount + paymentData.amount, dueAmount: inv.dueAmount - paymentData.amount };
                    return updatedInvoice;
                }
                return inv;
            });
            setInvoices(newInvoices);
            saveDataToLocalStorage('invoices', newInvoices);

            if (updatedInvoice) {
                return { payment: newPayment, updatedInvoice };
            }
            return null;
        }
    }, [isDbConnected, toast, payments, invoices, saveDataToLocalStorage]);

    const getPaymentsForInvoice = useCallback((invoiceId: number) => {
        return payments.filter(p => p.invoiceId === invoiceId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payments]);

    const addExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
        if (isDbConnected) {
            try {
                await dataActions.addExpense(expenseData);
                await loadAllData();
                toast({ title: "Expense Added", description: `New expense of ৳ ${expenseData.amount} has been recorded.` });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add expense. Check DB connection.' });
            }
        } else {
            const newExpense = { ...expenseData, id: `exp-${Date.now()}` };
            const newExpenses = [newExpense, ...expenses];
            setExpenses(newExpenses);
            saveDataToLocalStorage('expenses', newExpenses);
            toast({ title: "Expense Added (Local)", description: `New expense of ৳ ${expenseData.amount} recorded locally.` });
        }
    }, [isDbConnected, toast, loadAllData, expenses, saveDataToLocalStorage]);

    const updateExpense = useCallback(async (expenseId: string, updatedData: Omit<Expense, 'id'>) => {
        if (isDbConnected) {
            try {
                await dataActions.updateExpense(expenseId, updatedData);
                await loadAllData();
                toast({ title: "Expense Updated", description: "The expense details have been updated." });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to update expense. Check DB connection.' });
            }
        } else {
            const newExpenses = expenses.map(e => e.id === expenseId ? { ...e, ...updatedData } : e);
            setExpenses(newExpenses);
            saveDataToLocalStorage('expenses', newExpenses);
            toast({ title: "Expense Updated (Local)", description: "The expense details updated locally." });
        }
    }, [isDbConnected, toast, loadAllData, expenses, saveDataToLocalStorage]);

    const deleteExpense = useCallback(async (expenseId: string) => {
        if (isDbConnected) {
            try {
                await dataActions.deleteExpense(expenseId);
                await loadAllData();
                toast({ title: "Expense Deleted", description: "The expense record has been removed." });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete expense. Check DB connection.' });
            }
        } else {
            const newExpenses = expenses.filter(e => e.id !== expenseId);
            setExpenses(newExpenses);
            saveDataToLocalStorage('expenses', newExpenses);
            toast({ title: "Expense Deleted (Local)", description: "The expense record has been removed locally." });
        }
    }, [isDbConnected, toast, loadAllData, expenses, saveDataToLocalStorage]);
    
    const getExpensesForDateRange = useCallback((startDate: Date, endDate: Date) => {
        const start = startOfDay(startDate);
        const end = endOfDay(endDate);
        return expenses.filter(exp => isWithinInterval(new Date(exp.date), { start, end }));
    }, [expenses]);

    const addEmployee = useCallback(async (employeeData: Omit<Employee, 'id'>) => {
        if (isDbConnected) {
            try {
                await dataActions.addEmployee(employeeData);
                await loadAllData();
                toast({ title: "Employee Added", description: `${employeeData.name} has been added.` });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add employee. Check DB connection.' });
            }
        } else {
            const newEmployee = { ...employeeData, id: `emp-${Date.now()}` };
            const newEmployees = [...employees, newEmployee];
            setEmployees(newEmployees);
            saveDataToLocalStorage('employees', newEmployees);
            toast({ title: "Employee Added (Local)", description: `${employeeData.name} added locally.` });
        }
    }, [isDbConnected, toast, loadAllData, employees, saveDataToLocalStorage]);

    const updateEmployee = useCallback(async (employeeId: string, updatedData: Omit<Employee, 'id'>) => {
        if (isDbConnected) {
            try {
                await dataActions.updateEmployee(employeeId, updatedData);
                await loadAllData();
                toast({ title: "Employee Updated", description: "The employee details have been updated." });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to update employee. Check DB connection.' });
            }
        } else {
            const newEmployees = employees.map(e => e.id === employeeId ? { ...e, ...updatedData } : e);
            setEmployees(newEmployees);
            saveDataToLocalStorage('employees', newEmployees);
            toast({ title: "Employee Updated (Local)", description: "The employee details updated locally." });
        }
    }, [isDbConnected, toast, loadAllData, employees, saveDataToLocalStorage]);

    const deleteEmployee = useCallback(async (employeeId: string) => {
        if (isDbConnected) {
            try {
                await dataActions.deleteEmployee(employeeId);
                await loadAllData();
                toast({ title: "Employee Deleted", description: "The employee record has been removed." });
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete employee. Check DB connection.' });
            }
        } else {
            const newEmployees = employees.filter(e => e.id !== employeeId);
            setEmployees(newEmployees);
            saveDataToLocalStorage('employees', newEmployees);
            toast({ title: "Employee Deleted (Local)", description: "The employee record has been removed locally." });
        }
    }, [isDbConnected, toast, loadAllData, employees, saveDataToLocalStorage]);

    const markAttendance = useCallback(async (employeeId: string, date: Date, status: AttendanceStatus) => {
        if (isDbConnected) {
            try {
                await dataActions.markAttendance({ employeeId, date: date.toISOString(), status });
                await loadAllData();
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to mark attendance. Check DB connection.' });
            }
        } else {
            const dateString = date.toISOString().split('T')[0];
            const newAttendance = [...attendance.filter(a => !(a.employeeId === employeeId && a.date.startsWith(dateString)))];
            newAttendance.push({ id: `att-${Date.now()}`, employeeId, date: date.toISOString(), status });
            setAttendance(newAttendance);
            saveDataToLocalStorage('attendance', newAttendance);
        }
    }, [isDbConnected, loadAllData, toast, attendance, saveDataToLocalStorage]);

    const getAttendanceForDate = useCallback((date: Date) => {
        return attendance.filter(a => isSameDay(new Date(a.date), date));
    }, [attendance]);

    const addSalaryPayment = useCallback(async (paymentData: Omit<SalaryPayment, 'id'>): Promise<SalaryPayment | null> => {
        if (isDbConnected) {
            try {
                const newPayment = await dataActions.addSalaryPayment(paymentData);
                await loadAllData();
                return newPayment;
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add salary payment. Check DB connection.' });
                return null;
            }
        } else {
            const newPayment = { ...paymentData, id: `sal-${Date.now()}` };
            const newPayments = [...salaryPayments, newPayment];
            setSalaryPayments(newPayments);
            saveDataToLocalStorage('salaryPayments', newPayments);
            toast({ title: "Salary Paid (Local)", description: "Payment recorded locally." });
            return newPayment;
        }
    }, [isDbConnected, loadAllData, toast, salaryPayments, saveDataToLocalStorage]);
    
    const deleteSalaryPayment = useCallback(async (paymentId: string) => {
        if (isDbConnected) {
            try {
                await dataActions.deleteSalaryPayment(paymentId);
                await loadAllData();
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete salary payment.' });
            }
        } else {
            const newPayments = salaryPayments.filter(p => p.id !== paymentId);
            setSalaryPayments(newPayments);
            saveDataToLocalStorage('salaryPayments', newPayments);
        }
    }, [isDbConnected, loadAllData, toast, salaryPayments, saveDataToLocalStorage]);


    const getPaymentsForMonth = useCallback((employeeId: string, startDate: Date, endDate: Date) => {
        return salaryPayments.filter(p => 
            p.employeeId === employeeId && 
            isWithinInterval(new Date(p.date), { start: startOfDay(startDate), end: endOfDay(endDate) })
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
        products, invoices, buyers, expenses, employees, attendance, salaryPayments, payments, isAppDataLoading, isDbConnected, lastInvoiceId, centralDateRange, setCentralDateRange,
        addProduct, addMultipleProducts, updateProduct, deleteProduct, getProductById,
        addInvoice, updateInvoice, deleteInvoice, printInvoice, getBuyerById, getInvoicesForBuyer, getInvoicesForDateRange, getGrossProfitForDateRange,
        addPayment, getPaymentsForInvoice,
        addExpense, updateExpense, deleteExpense, getExpensesForDateRange,
        addEmployee, updateEmployee, deleteEmployee, markAttendance, getAttendanceForDate,
        addSalaryPayment, deleteSalaryPayment, getPaymentsForMonth, getSalaryPaymentsForDateRange, getDueSalaryForMonth,
    }), [
        products, invoices, buyers, expenses, employees, attendance, salaryPayments, payments, isAppDataLoading, isDbConnected, lastInvoiceId, centralDateRange, setCentralDateRange,
        addProduct, addMultipleProducts, updateProduct, deleteProduct, getProductById,
        addInvoice, updateInvoice, deleteInvoice, printInvoice, getBuyerById, getInvoicesForBuyer, getInvoicesForDateRange, getGrossProfitForDateRange,
        addPayment, getPaymentsForInvoice,
        addExpense, updateExpense, deleteExpense, getExpensesForDateRange,
        addEmployee, updateEmployee, deleteEmployee, markAttendance, getAttendanceForDate,
        addSalaryPayment, deleteSalaryPayment, getPaymentsForMonth, getSalaryPaymentsForDateRange, getDueSalaryForMonth
    ]);
    
    if (isAppDataLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Connecting to database...
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
