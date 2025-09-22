
'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import type { Invoice, Product, Buyer } from '@/lib/types';
import { useToast } from './use-toast';
import { useAppData } from './use-app-data';

export interface DraftInvoiceItem extends Omit<Invoice, 'items' | 'id'> {
    id: string; // product id
    name: string;
    quantity: number | string;
    price: number | string;
    originalPrice: number;
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
    cashReceived?: number;
    changeAmount?: number;
    buyerId?: string;
}

interface InvoiceFormContextType {
    drafts: DraftInvoice[];
    activeDraftIndex: number;
    activeDraft: DraftInvoice | null;
    addNewDraft: () => void;
    removeDraft: (draftId: string | number) => void;
    setActiveDraftIndex: (index: number) => void;
    updateActiveDraft: (update: Partial<Omit<DraftInvoice, 'subtotal' | 'changeAmount' | 'label' | 'dueAmount'>>) => Promise<DraftInvoice>;
    addInvoiceItem: (product: Product) => void;
    updateInvoiceItem: (itemId: string, itemUpdate: { [key: string]: any }) => void;
    removeInvoiceItem: (itemId: string) => void;
    resetActiveDraft: () => void;
    isFormLoading: boolean;
    products: Product[];
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
        cashReceived: undefined,
        changeAmount: 0,
        buyerId: undefined,
    }
};

const calculateTotals = (items: (DraftInvoiceItem | { quantity: number | string, price: number | string })[], paidAmount?: number, cashReceived?: number) => {
    const subtotal = items.reduce((acc, item) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0;
        const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
        return acc + price * quantity;
    }, 0);

    let validPaidAmount = (typeof paidAmount === 'number' && !isNaN(paidAmount)) ? paidAmount : 0;
    
    // Constraint: paidAmount cannot be more than subtotal
    if (validPaidAmount > subtotal) {
        validPaidAmount = subtotal;
    }
    
    const changeAmount = (cashReceived && cashReceived > validPaidAmount) ? cashReceived - validPaidAmount : 0;
    
    let dueAmount = 0;
    if(paidAmount && paidAmount > 0) {
        dueAmount = subtotal - validPaidAmount;
    }


    return { subtotal, changeAmount, paidAmount: validPaidAmount, dueAmount };
};

const STORAGE_KEYS = {
    invoiceDrafts: 'stockpilot-invoice-drafts',
    activeInvoiceDraftIndex: 'stockpilot-active-invoice-draft-index'
};

const useInvoiceFormData = (): InvoiceFormContextType => {
    const { isAppDataLoading, products, lastInvoiceId, buyers } = useAppData();
    const { toast } = useToast();
    
    const [drafts, setDrafts] = useState<DraftInvoice[]>([]);
    const [activeDraftIndex, setActiveDraftIndex] = useState(0);

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
                const newId = lastInvoiceId + index + 1;
                // Only update if it's a new session or the ID is clearly a placeholder
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
    
    const activeDraft = useMemo(() => drafts[activeDraftIndex] || null, [drafts, activeDraftIndex]);
    
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

    const updateActiveDraft = useCallback((update: Partial<Omit<DraftInvoice, 'subtotal' | 'changeAmount' | 'label' | 'dueAmount'>>): Promise<DraftInvoice> => {
        return new Promise((resolve) => {
            setDrafts(prev => {
                let resolvedDraft: DraftInvoice | undefined;
                const newDrafts = prev.map((draft, index) => {
                    if (index === activeDraftIndex) {
                        const newVersion = { ...draft, ...update };
                        
                        const { subtotal, changeAmount, paidAmount, dueAmount } = calculateTotals(newVersion.items, newVersion.paidAmount, newVersion.cashReceived);
                        
                        newVersion.subtotal = subtotal;
                        newVersion.paidAmount = paidAmount;
                        newVersion.changeAmount = changeAmount;
                        newVersion.dueAmount = subtotal - paidAmount;

                        if(typeof newVersion.id === 'string' || (typeof newVersion.id === 'number' && update.customerName && newVersion.label.startsWith('Memo'))) {
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
        setDrafts(prev => prev.map((draft, index) => {
            if (index !== activeDraftIndex) return draft;

            const existingItem = draft.items.find(item => item.id === product.id);
            let newItems;
            if (existingItem) {
                // If item exists, do not auto-increment. Keep the existing items array.
                newItems = draft.items;
            } else {
                const newItem: DraftInvoiceItem = {
                    id: product.id,
                    name: product.name,
                    quantity: 0,
                    price: product.sellingPrice,
                    originalPrice: product.sellingPrice,
                } as DraftInvoiceItem;
                newItems = [...draft.items, newItem];
            }
            const { subtotal, changeAmount, paidAmount, dueAmount } = calculateTotals(newItems, draft.paidAmount, draft.cashReceived);
            return { ...draft, items: newItems, subtotal, changeAmount, paidAmount, dueAmount: subtotal - paidAmount };
        }));
    }, [activeDraftIndex]);
    
    const updateInvoiceItem = useCallback((itemId: string, itemUpdate: { [key: string]: any }) => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index !== activeDraftIndex) return draft;
    
            const newItems = draft.items.map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, ...itemUpdate };
                    // Allow empty string for user input, but treat as 0 for calculation
                    const newQuantity = String(updatedItem.quantity);
                    const newPrice = String(updatedItem.price);
                    
                    updatedItem.quantity = newQuantity;
                    updatedItem.price = newPrice;
                    
                    return updatedItem;
                }
                return item;
            });
    
            const { subtotal, changeAmount, paidAmount, dueAmount } = calculateTotals(newItems, draft.paidAmount, draft.cashReceived);
            return { ...draft, items: newItems, subtotal, changeAmount, paidAmount, dueAmount: subtotal - paidAmount };
        }));
    }, [activeDraftIndex]);

    const removeInvoiceItem = useCallback((itemId: string) => {
        setDrafts(prev => prev.map((draft, index) => {
            if (index !== activeDraftIndex) return draft;
            const newItems = draft.items.filter(item => item.id !== itemId);
            const { subtotal, changeAmount, paidAmount, dueAmount } = calculateTotals(newItems, draft.paidAmount, draft.cashReceived);
            return { ...draft, items: newItems, subtotal, changeAmount, paidAmount, dueAmount: subtotal - paidAmount };
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
        isFormLoading: isAppDataLoading,
        products,
    }), [drafts, activeDraftIndex, activeDraft, addNewDraft, removeDraft, setActiveDraftIndex, updateActiveDraft, addInvoiceItem, updateInvoiceItem, removeInvoiceItem, resetActiveDraft, isAppDataLoading, products]);
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
