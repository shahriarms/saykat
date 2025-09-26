
'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { Invoice, Product, Buyer, InvoiceItem } from '@/lib/types';
import { useToast } from './use-toast';
import { useAppData } from './use-app-data';

export interface DraftInvoiceItem {
    id: string; // product id
    name: string;
    quantity: number | string;
    price: number | string;
    originalPrice: number;
    buyingPrice: number;
    profitMargin: number;
    profitAmount: number;
}

export interface DraftInvoice {
    id: number | string;
    label: string;
    items: DraftInvoiceItem[];
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    paidAmount?: number;
    dueAmount: number;
    subtotal: number;
    totalProfit: number;
    cashReceived?: number;
    changeAmount?: number;
    buyerId?: string;
    originalInvoiceId?: number; // To track if we are editing an existing invoice
}

interface EnrichedProduct extends Product {
    totalSold: number;
    totalEverAdded: number;
}

interface InvoiceFormContextType {
    drafts: DraftInvoice[];
    activeDraftIndex: number;
    activeDraft: DraftInvoice | null;
    addNewDraft: () => void;
    removeDraft: (draftId: string | number) => void;
    setActiveDraftIndex: (index: number) => void;
    updateActiveDraft: (update: Partial<Omit<DraftInvoice, 'subtotal' | 'changeAmount' | 'label' | 'dueAmount' | 'totalProfit'>>) => Promise<DraftInvoice>;
    addInvoiceItem: (product: Product) => void;
    updateInvoiceItem: (itemId: string, itemUpdate: { [key: string]: any }) => void;
    removeInvoiceItem: (itemId: string) => void;
    resetActiveDraft: () => void;
    loadInvoiceForEditing: (invoice: Invoice) => void;
    isFormLoading: boolean;
    products: Product[];
    invoiceItemProducts: EnrichedProduct[];
}

const InvoiceFormContext = createContext<InvoiceFormContextType | undefined>(undefined);

const createNewDraft = (index: number, lastInvoiceId: number, isLoading: boolean): DraftInvoice => {
    let id: number | string;
    let label: string;

    if (isLoading) {
        id = '...';
        label = `New Memo ${index + 1}`;
    } else {
        id = lastInvoiceId + index + 1;
        label = `Memo #${id}`;
    }

    return {
        id,
        label,
        items: [],
        customerName: '',
        customerAddress: '',
        customerPhone: '',
        paidAmount: undefined,
        dueAmount: 0,
        subtotal: 0,
        totalProfit: 0,
        cashReceived: undefined,
        changeAmount: 0,
        buyerId: undefined,
        originalInvoiceId: undefined,
    }
};

const calculateTotals = (items: (DraftInvoiceItem | InvoiceItem)[], paidAmount?: number, cashReceived?: number) => {
    const subtotal = items.reduce((acc, item) => {
        const quantity = parseFloat(String(item.quantity)) || 0;
        const price = parseFloat(String(item.price)) || 0;
        return acc + (quantity * price);
    }, 0);

    const totalProfit = items.reduce((acc, item) => {
        const profit = (item as DraftInvoiceItem).profitAmount || 0;
        return acc + profit;
    }, 0);

    const validPaidAmount = (typeof paidAmount === 'number' && !isNaN(paidAmount)) ? paidAmount : 0;
    
    const dueAmount = subtotal - validPaidAmount;
    
    const validCashReceived = (typeof cashReceived === 'number' && !isNaN(cashReceived)) ? cashReceived : 0;
    const changeAmount = (validCashReceived > subtotal) ? validCashReceived - subtotal : 0;
    
    return { subtotal, dueAmount, paidAmount: validPaidAmount, changeAmount, totalProfit };
};


const STORAGE_KEYS = {
    invoiceDrafts: 'stockpilot-invoice-drafts',
    activeInvoiceDraftIndex: 'stockpilot-active-invoice-draft-index'
};

const useInvoiceFormData = (): InvoiceFormContextType => {
    const { isAppDataLoading, products: dbProducts, lastInvoiceId, invoices: allInvoices } = useAppData();
    const { toast } = useToast();
    
    const [drafts, setDrafts] = useState<DraftInvoice[]>([]);
    const [activeDraftIndex, setActiveDraftIndex] = useState(0);
    const [stockError, setStockError] = useState<string | null>(null);

    // Initialize state from localStorage ONCE on mount
    useEffect(() => {
        try {
            const savedDrafts = localStorage.getItem(STORAGE_KEYS.invoiceDrafts);
            const savedIndex = localStorage.getItem(STORAGE_KEYS.activeInvoiceDraftIndex);

            if (savedDrafts) {
                let parsedDrafts: DraftInvoice[] = JSON.parse(savedDrafts);
                if (Array.isArray(parsedDrafts) && parsedDrafts.length > 0) {
                    setDrafts(parsedDrafts);
                    if (savedIndex) {
                        const parsedIndex = JSON.parse(savedIndex);
                        if (parsedIndex < parsedDrafts.length) {
                            setActiveDraftIndex(parsedIndex);
                        }
                    }
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to load invoice form state from localStorage", error);
        }
    }, []);

    // Effect to react to data loading and initialize/update drafts if needed
    useEffect(() => {
        if (isAppDataLoading) return;
        
        if (drafts.length === 0) {
            // This runs if localStorage was empty or invalid
            setDrafts([createNewDraft(0, lastInvoiceId, false)]);
        } else {
            // This runs on subsequent loads (e.g., after an invoice is created)
            // It ensures draft IDs are correct if lastInvoiceId has changed.
            const correctedDrafts = drafts.map((draft, index) => {
                if (draft.originalInvoiceId) {
                    return draft; // Don't change ID of an invoice being edited
                }
                const newId = lastInvoiceId + index + 1;
                 if (draft.label === `Memo #${draft.id}` || draft.label.startsWith('New Memo')) {
                     return { ...draft, id: newId, label: `Memo #${newId}` };
                 }
                return { ...draft, id: newId };
            });
            setDrafts(correctedDrafts);
        }
        // We only want this to run when the core data is loaded/reloaded, not on every draft change.
    }, [isAppDataLoading, lastInvoiceId]);


    // Save state to localStorage whenever it changes
    useEffect(() => {
        // Only save to localStorage when app data is fully loaded to avoid saving incomplete state
        if (drafts.length > 0 && !isAppDataLoading) {
            try {
                localStorage.setItem(STORAGE_KEYS.invoiceDrafts, JSON.stringify(drafts));
                localStorage.setItem(STORAGE_KEYS.activeInvoiceDraftIndex, JSON.stringify(activeDraftIndex));
            } catch (error) {
                console.error("Failed to save invoice form state to localStorage", error);
            }
        }
    }, [drafts, activeDraftIndex, isAppDataLoading]);

     useEffect(() => {
        if (stockError) {
            toast({
                variant: 'destructive',
                title: 'Stock Limit Exceeded',
                description: stockError,
            });
            setStockError(null); // Reset error after showing
        }
    }, [stockError, toast]);
    
    const activeDraft = useMemo(() => drafts[activeDraftIndex] || null, [drafts, activeDraftIndex]);
    
    // Memoize the available products by adding a live-calculated stock quantity
    const products = useMemo(() => {
        if (isAppDataLoading) return [];

        const quantitiesInAllDrafts = new Map<string, number>();
        drafts.forEach(draft => {
            draft.items.forEach(item => {
                const quantity = parseFloat(String(item.quantity)) || 0;
                quantitiesInAllDrafts.set(item.id, (quantitiesInAllDrafts.get(item.id) || 0) + quantity);
            });
        });

        return dbProducts.map(p => {
            const liveStock = p.stock - (quantitiesInAllDrafts.get(p.id) || 0);
            return {
                ...p,
                stock: liveStock < 0 ? 0 : liveStock, // Prevent negative stock in display
            };
        });
    }, [dbProducts, drafts, isAppDataLoading]);

    const invoiceItemProducts = useMemo(() => {
        if (!activeDraft) return [];
    
        const soldQuantities = new Map<string, number>();
        allInvoices.forEach(invoice => {
          invoice.items.forEach(item => {
            const quantity = parseFloat(String(item.quantity)) || 0;
            soldQuantities.set(item.id, (soldQuantities.get(item.id) || 0) + quantity);
          });
        });
      
        return activeDraft.items.map(item => {
            const product = dbProducts.find(p => p.id === item.id);
            if (!product) return null;
      
            const totalCommittedSold = soldQuantities.get(product.id) || 0;
            const dbStock = parseFloat(String(product.stock)) || 0;
            const totalEverAdded = dbStock + totalCommittedSold;
    
            return { ...product, stock: dbStock, totalSold: totalCommittedSold, totalEverAdded };
        }).filter((p): p is EnrichedProduct => p !== null);
    }, [activeDraft, dbProducts, allInvoices]);

    
    const addNewDraft = useCallback(() => {
        if (drafts.length >= 10) {
            toast({
                variant: 'destructive',
                title: "Memo Limit Reached",
                description: "You can only have a maximum of 10 open memos at a time.",
            });
            return;
        }
        setDrafts(prev => {
            const newDraft = createNewDraft(prev.length, lastInvoiceId, isAppDataLoading);
            return [...prev, newDraft];
        });
        setActiveDraftIndex(drafts.length);
    }, [drafts.length, toast, lastInvoiceId, isAppDataLoading]);
    
    const removeDraft = useCallback((draftId: string | number) => {
        setDrafts(prev => {
            const draftIndex = prev.findIndex(d => d.id === draftId);
            const newDrafts = prev.filter(d => d.id !== draftId);
            
            if (newDrafts.length === 0) {
                setActiveDraftIndex(0);
                return [createNewDraft(0, lastInvoiceId, isAppDataLoading)];
            }
            
            if (activeDraftIndex >= draftIndex && activeDraftIndex > 0) {
                 setActiveDraftIndex(activeDraftIndex - 1);
            }

            return newDrafts;
        });
    }, [activeDraftIndex, lastInvoiceId, isAppDataLoading]);

    const updateActiveDraft = useCallback((update: Partial<Omit<DraftInvoice, 'subtotal' | 'changeAmount' | 'label' | 'dueAmount' | 'totalProfit'>>): Promise<DraftInvoice> => {
        return new Promise((resolve) => {
            setDrafts(prev => {
                let resolvedDraft: DraftInvoice | undefined;
                const newDrafts = prev.map((draft, index) => {
                    if (index === activeDraftIndex) {
                        const newVersion = { ...draft, ...update };
                        
                        const { subtotal, changeAmount, paidAmount, dueAmount, totalProfit } = calculateTotals(newVersion.items, newVersion.paidAmount, newVersion.cashReceived);
                        
                        newVersion.subtotal = subtotal;
                        newVersion.paidAmount = paidAmount;
                        newVersion.changeAmount = changeAmount;
                        newVersion.dueAmount = dueAmount;
                        newVersion.totalProfit = totalProfit;

                        if(!newVersion.originalInvoiceId && (typeof newVersion.id === 'string' || (update.customerName && newVersion.label.startsWith('Memo')))) {
                            newVersion.label = update.customerName || `Memo #${newVersion.id}`;
                        }
                        resolvedDraft = newVersion;
                        return newVersion;
                    }
                    return draft;
                });

                if (resolvedDraft) {
                    resolve(resolvedDraft);
                }
                return newDrafts;
            });
        });
    }, [activeDraftIndex]);

    const addInvoiceItem = useCallback((product: Product) => {
        const currentDraft = drafts[activeDraftIndex];
        if (!currentDraft) return;

        const liveAvailableStock = product.stock;

        if (liveAvailableStock <= 0) {
            setStockError(`"${product.name}" is out of stock and cannot be added.`);
            return;
        }

        const existingItem = currentDraft.items.find(item => item.id === product.id);

        if (existingItem) {
            toast({
                variant: 'destructive',
                title: "Item Already Added",
                description: `"${product.name}" is already in the invoice. You can change its quantity.`,
            });
            return;
        }

        setDrafts(prev => prev.map((draft, index) => {
            if (index !== activeDraftIndex) return draft;

            const newItem: DraftInvoiceItem = {
                id: product.id,
                name: product.name,
                quantity: '',
                price: product.sellingPrice,
                originalPrice: product.sellingPrice,
                buyingPrice: product.buyingPrice,
                profitMargin: product.profitMargin,
                profitAmount: 0,
            };
            
            const newItems = [...draft.items, newItem];
            const { subtotal, changeAmount, paidAmount, dueAmount, totalProfit } = calculateTotals(newItems, draft.paidAmount, draft.cashReceived);
            return { ...draft, items: newItems, subtotal, changeAmount, paidAmount, dueAmount, totalProfit };
        }));
    }, [activeDraftIndex, toast, drafts, products]);
    
    const updateInvoiceItem = useCallback((itemId: string, itemUpdate: { [key: string]: any }) => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index !== activeDraftIndex) return draft;
    
            const itemToUpdate = draft.items.find(i => i.id === itemId);
            if (!itemToUpdate) return draft;
    
            const product = products.find(p => p.id === itemId);
            if (!product) return draft;
    
            // Live available stock is the product's current stock (which already accounts for other drafts)
            // plus the quantity of this item *already in this specific draft*.
            const currentQuantityInDraft = parseFloat(String(itemToUpdate.quantity)) || 0;
            const liveAvailableStock = product.stock + currentQuantityInDraft;
    
            const newQuantity = parseFloat(String(itemUpdate.quantity));
    
            if (itemUpdate.quantity !== undefined && newQuantity > liveAvailableStock) {
                const unit = product.mainCategory === 'Material' ? 'kg' : 'pcs';
                setStockError(`Cannot add more than available stock: ${liveAvailableStock.toFixed(2)} ${unit}`);
                return draft; // Don't update
            }
    
            const newItems = draft.items.map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, ...itemUpdate };
                    
                    const quantity = parseFloat(String(updatedItem.quantity)) || 0;
                    const price = parseFloat(String(updatedItem.price)) || 0;
                    
                    const profitAmount = (price - updatedItem.buyingPrice) * quantity;
                    const profitMargin = updatedItem.buyingPrice > 0 ? ((price - updatedItem.buyingPrice) / updatedItem.buyingPrice) * 100 : 0;
                    
                    updatedItem.quantity = String(updatedItem.quantity);
                    updatedItem.price = String(updatedItem.price);
                    updatedItem.profitAmount = profitAmount;
                    updatedItem.profitMargin = profitMargin;
                    
                    return updatedItem;
                }
                return item;
            });
    
            const { subtotal, changeAmount, paidAmount, dueAmount, totalProfit } = calculateTotals(newItems, draft.paidAmount, draft.cashReceived);
            return { ...draft, items: newItems, subtotal, changeAmount, paidAmount, dueAmount, totalProfit };
        }));
    }, [activeDraftIndex, products]);

    const removeInvoiceItem = useCallback((itemId: string) => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index !== activeDraftIndex) return draft;
            const newItems = draft.items.filter(item => item.id !== itemId);
            const { subtotal, changeAmount, paidAmount, dueAmount, totalProfit } = calculateTotals(newItems, draft.paidAmount, draft.cashReceived);
            return { ...draft, items: newItems, subtotal, changeAmount, paidAmount, dueAmount, totalProfit };
        }));
    }, [activeDraftIndex]);

    const resetActiveDraft = useCallback(() => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index === activeDraftIndex) {
                return createNewDraft(index, lastInvoiceId, isAppDataLoading);
            }
            return draft;
        }));
    }, [activeDraftIndex, lastInvoiceId, isAppDataLoading]);

    const loadInvoiceForEditing = useCallback((invoiceToEdit: Invoice) => {
        const draftItems: DraftInvoiceItem[] = invoiceToEdit.items.map(item => {
            const product = dbProducts.find(p => p.id === item.id);
            return {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                originalPrice: product?.sellingPrice || item.price,
                buyingPrice: product?.buyingPrice || item.buyingPrice,
                profitMargin: product?.profitMargin || 0,
                profitAmount: item.profitAmount,
            }
        });

        const draftToEdit: DraftInvoice = {
            ...invoiceToEdit,
            label: `Editing #${invoiceToEdit.id}`,
            items: draftItems,
            originalInvoiceId: invoiceToEdit.id,
        };

        setDrafts(prev => {
            const newDrafts = [...prev];
            newDrafts[activeDraftIndex] = draftToEdit;
            return newDrafts;
        });

    }, [activeDraftIndex, dbProducts]);


    return useMemo(() => ({
        drafts,
        activeDraftIndex,
        activeDraft,
        addNewDraft,
        removeDraft,
        setActiveDraftIndex,
        updateActiveDraft,
        addInvoiceItem,
        updateInvoiceItem,
        removeInvoiceItem,
        resetActiveDraft,
        loadInvoiceForEditing,
        isFormLoading: isAppDataLoading,
        products,
        invoiceItemProducts,
    }), [drafts, activeDraftIndex, activeDraft, addNewDraft, removeDraft, setActiveDraftIndex, updateActiveDraft, addInvoiceItem, updateInvoiceItem, removeInvoiceItem, resetActiveDraft, loadInvoiceForEditing, isAppDataLoading, products, invoiceItemProducts]);
}

export function InvoiceFormProvider({ children }: { children: ReactNode }) {
    const value = useInvoiceFormData();
    return (
        <InvoiceFormContext.Provider value={value}>
            {children}
        </InvoiceFormContext.Provider>
    );
}

export function useInvoiceForm() {
    const context = useContext(InvoiceFormContext);
    if (context === undefined) {
        throw new Error('useInvoiceForm must be used within an InvoiceFormProvider');
    }
    return context;
}
