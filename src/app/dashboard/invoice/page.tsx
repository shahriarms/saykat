
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppData } from '@/hooks/use-app-data';
import { Plus, Trash2, Printer, X, Loader2, Search, Eye, EyeOff, ChevronsUpDown, Save } from 'lucide-react';
import { useInvoiceForm, InvoiceFormProvider } from '@/hooks/use-invoice-form';
import { useToast } from '@/hooks/use-toast';
import { InvoicePrintLayout } from '@/components/invoice-print-layout';
import { useSettings } from '@/hooks/use-settings';
import { useTranslation } from '@/hooks/use-translation';
import type { DraftInvoice } from '@/hooks/use-invoice-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Product, Buyer } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { StockVolumeDisplay } from '@/components/stock-volume-display';


function InvoicePage() {
  const { addInvoice, updateInvoice, buyers, invoices: allInvoices } = useAppData();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    drafts,
    activeDraftIndex,
    setActiveDraftIndex,
    activeDraft,
    addNewDraft,
    removeDraft,
    updateActiveDraft,
    updateInvoiceItem,
    removeInvoiceItem,
    addInvoiceItem,
    resetActiveDraft,
    isFormLoading,
    products
  } = useInvoiceForm();
  
  const [draftToDelete, setDraftToDelete] = useState<DraftInvoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceToPrint, setInvoiceToPrint] = useState<DraftInvoice | null>(null);
  const [showProfit, setShowProfit] = useState(true);

  // Autocomplete state for buyers
  const [buyerSearch, setBuyerSearch] = useState('');
  const [isBuyerPopoverOpen, setBuyerPopoverOpen] = useState(false);
  const buyerInputRef = useRef<HTMLInputElement>(null);
  
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
        const product = products.find(p => p.id === item.id);
        if (!product) return null;

        const totalSold = soldQuantities.get(product.id) || 0;
        const currentStock = parseFloat(String(product.stock)) || 0;
        const totalEverAdded = currentStock + totalSold;
        
        const quantityInCart = parseFloat(String(item.quantity)) || 0;
        const liveStock = currentStock - quantityInCart;

        return { ...product, stock: liveStock, totalSold, totalEverAdded };
    }).filter((p): p is Product & { totalSold: number; totalEverAdded: number } => p !== null);
  }, [activeDraft, products, allInvoices]);


  useEffect(() => {
    const handleAfterPrint = async () => {
      if (!invoiceToPrint) return;
      document.title = 'StockPilot'; // Reset title after print
      setIsProcessing(true);
      try {
        let newInvoiceId: number | null;
        if(invoiceToPrint.originalInvoiceId) {
          newInvoiceId = await updateInvoice(invoiceToPrint.originalInvoiceId, invoiceToPrint);
        } else {
          newInvoiceId = await addInvoice(invoiceToPrint);
        }

        if (newInvoiceId) {
          toast({
            title: `Invoice #${newInvoiceId} Saved`,
            description: `The invoice has been successfully ${invoiceToPrint.originalInvoiceId ? 'updated' : 'saved'}.`,
          });
        }
      } catch (error: any) {
        console.error("Failed to save invoice after printing:", error);
        toast({
          variant: 'destructive',
          title: 'Error Saving Invoice',
          description: error.message || 'The invoice was printed, but failed to save.',
        });
      } finally {
        setInvoiceToPrint(null);
        resetActiveDraft();
        setIsProcessing(false);
        toast({
          title: "Memo Ready",
          description: "A new, empty memo is ready for you.",
        });
      }
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [invoiceToPrint, addInvoice, updateInvoice, resetActiveDraft, toast, t]);
  
  const { id: draftId, customerName, customerAddress, customerPhone, paidAmount, subtotal, items, cashReceived, changeAmount, dueAmount, originalInvoiceId } = activeDraft || {};

  const handleCustomerNameChange = (name: string) => {
      updateActiveDraft({ customerName: name, buyerId: undefined, customerAddress: '', customerPhone: '' });
      setBuyerSearch(name);
  };
  
  const handleBuyerSelect = (buyer: Buyer) => {
    updateActiveDraft({
        customerName: buyer.name,
        customerAddress: buyer.address,
        customerPhone: buyer.phone,
        buyerId: buyer.id
    });
    setBuyerSearch(buyer.name);
    setBuyerPopoverOpen(false);
  };
  
  const filteredBuyers = useMemo(() => {
      if (!buyerSearch) return buyers;
      return buyers.filter(b => b.name.toLowerCase().includes(buyerSearch.toLowerCase()));
  }, [buyers, buyerSearch]);

  const validateInvoice = () => {
    if (!customerName) {
      toast({ variant: 'destructive', title: t('validation_error_title'), description: t('customer_name_required_error') });
      return false;
    }
    if (!items || items.length === 0) {
      toast({ variant: 'destructive', title: t('validation_error_title'), description: t('invoice_items_required_error') });
      return false;
    }
    if ((dueAmount || 0) > 0 && (!customerPhone || customerPhone.length < 11)) {
        toast({
            variant: 'destructive',
            title: 'Phone Number Required for Due',
            description: 'Please enter a valid 11-digit phone number for invoices with a due balance.',
        });
        return false;
    }
    return true;
  };
  
  const handlePrintConfirm = () => {
     if (!validateInvoice() || isProcessing || !activeDraft) return;
     
     const originalTitle = document.title;
     document.title = `invoice-${activeDraft.id}`;

     // Prepare the data for printing.
     setInvoiceToPrint(activeDraft);

     // Use a timeout to ensure the state update has rendered before printing.
     setTimeout(() => {
        window.print();
        document.title = originalTitle; // Restore title in case 'afterprint' doesn't fire (e.g., user cancels print)
     }, 100);
  };

  const [mainCategoryFilter, setMainCategoryFilter] = useState<'Material' | 'Hardware'>('Material');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');

  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  const resetFilters = () => {
    setCategoryFilter('');
    setSubCategoryFilter('');
    productSearch && setProductSearch('');
    categorySearch && setCategorySearch('');
    subCategorySearch && setSubCategorySearch('');
  };
  
  useEffect(() => {
    resetFilters();
  }, [mainCategoryFilter]);
  
  useEffect(() => {
    setSubCategoryFilter('');
    setSubCategorySearch('');
  }, [categoryFilter]);

  const categories = useMemo(() => {
    const allCategories = [...new Set(products.filter(p => p.mainCategory === mainCategoryFilter).map(p => p.category))];
    if (!categorySearch) return allCategories;
    return allCategories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [products, mainCategoryFilter, categorySearch]);
  
  const subCategories = useMemo(() => {
    const allSubCategories = [...new Set(products.filter(p => p.mainCategory === mainCategoryFilter && p.category === categoryFilter).map(p => p.subCategory))];
     if (!subCategorySearch) return allSubCategories;
    return allSubCategories.filter(sc => sc.toLowerCase().includes(subCategorySearch.toLowerCase()));
  }, [products, mainCategoryFilter, categoryFilter, subCategorySearch]);

  const filteredProducts = useMemo(() => {
    let prods = products
      .filter(p => p.mainCategory === mainCategoryFilter)
      .filter(p => categoryFilter ? p.category === categoryFilter : true)
      .filter(p => subCategoryFilter ? p.subCategory === subCategoryFilter : true);

    if (productSearch) {
      prods = prods.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    }
    return prods;
  }, [products, mainCategoryFilter, categoryFilter, subCategoryFilter, productSearch]);

  const handleAddProduct = (product: Product) => {
    addInvoiceItem(product);
  };
  
  const handleDeleteDraftClick = (draft: DraftInvoice) => {
    if (drafts.length <= 1) {
        toast({
            variant: 'destructive',
            title: "Cannot Delete",
            description: "You cannot delete the last remaining memo.",
        });
        return;
    }
    setDraftToDelete(draft);
  };
  
  const confirmDeleteDraft = () => {
    if (draftToDelete) {
        removeDraft(draftToDelete.id);
        setDraftToDelete(null);
    }
  };
  
  if (isFormLoading || !activeDraft) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );
  }

  const isFullyPaid = subtotal > 0 && Math.abs(subtotal - (paidAmount || 0)) < 0.001;
  const isEditing = !!originalInvoiceId;

  return (
    <>
      <div className="flex flex-col gap-4 h-full no-print">
        {/* Memo Tabs */}
        <div className="flex items-center gap-2 border-b pb-2 flex-wrap">
            {drafts.map((draft, index) => (
                <div key={draft.id} className="relative group">
                    <Button 
                        variant={index === activeDraftIndex ? 'secondary' : 'ghost'}
                        onClick={() => setActiveDraftIndex(index)}
                        className="pr-8"
                    >
                        {draft.label}
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 opacity-50 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDraftClick(draft);
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button variant="outline" size="icon" onClick={addNewDraft} disabled={drafts.length >= 10}>
                <Plus className="h-4 w-4"/>
            </Button>
        </div>

        {/* Change Calculator */}
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="text-center sm:text-left">
                    <p className="text-sm text-muted-foreground">Total Bill</p>
                    <p className="text-2xl font-bold">৳ {(subtotal || 0).toFixed(2)}</p>
                </div>
                <Separator orientation={"vertical"} className={'w-px h-10 hidden sm:block'} />
                <Separator orientation={"horizontal"} className={'h-px w-full sm:hidden'} />
                <div className="flex items-center gap-2">
                    <Label htmlFor="cashReceived" className="text-sm font-medium">Cash Received:</Label>
                    <div className="relative w-40">
                         <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                         <Input 
                            id='cashReceived' 
                            type="text"
                            inputMode='decimal'
                            value={cashReceived ?? ''} 
                            onChange={e => updateActiveDraft({ cashReceived: parseFloat(e.target.value) || undefined })} 
                            className="pl-5 text-right font-bold text-lg h-11"
                            placeholder='0'
                        />
                    </div>
                </div>
                <Separator orientation={"vertical"} className={'w-px h-10 hidden sm:block'} />
                <Separator orientation={"horizontal"} className={'h-px w-full sm:hidden'} />
                <div className="text-center sm:text-left">
                    <p className="text-sm text-muted-foreground">Change</p>
                    <p className="text-2xl font-bold text-green-600">৳ {(changeAmount || 0).toFixed(2)}</p>
                </div>
            </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 flex-1 min-h-0">
          
          {/* Left Column: Product Adder & Invoice Items */}
          <div className="xl:col-span-3 flex flex-col gap-4">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <CardTitle>{t('add_products_label')}</CardTitle>
                    <RadioGroup
                        value={mainCategoryFilter}
                        onValueChange={(value) => setMainCategoryFilter(value as 'Material' | 'Hardware')}
                        className="flex space-x-4 pt-2"
                    >
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Material" id="r-material" /><Label htmlFor="r-material">{t('material_tab')}</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Hardware" id="r-hardware" /><Label htmlFor="r-hardware">{t('hardware_tab')}</Label></div>
                    </RadioGroup>
                </CardHeader>
                <CardContent className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 min-h-0">
                        {/* Category List */}
                        <div className="flex flex-col gap-2 min-h-0">
                           <Label>{t('category_header')}</Label>
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Search..." className="pl-8 h-9" value={categorySearch} onChange={e => setCategorySearch(e.target.value)} />
                            </div>
                           <ScrollArea className="flex-1 border rounded-md force-show-scrollbar">
                               <div className="p-2 space-y-1">
                                    <Button variant={!categoryFilter ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-xs" onClick={() => setCategoryFilter('')}>{t('all_categories')}</Button>
                                    {categories.map(c => <Button key={c} variant={categoryFilter === c ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-xs" onClick={() => setCategoryFilter(c)}>{c}</Button>)}
                               </div>
                           </ScrollArea>
                        </div>
                        {/* Sub-Category List */}
                        <div className="flex flex-col gap-2 min-h-0">
                            <Label>{t('subcategory_header')}</Label>
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Search..." className="pl-8 h-9" value={subCategorySearch} onChange={e => setSubCategorySearch(e.target.value)} disabled={!categoryFilter}/>
                            </div>
                           <ScrollArea className="flex-1 border rounded-md force-show-scrollbar">
                                <div className="p-2 space-y-1">
                                     <Button variant={!subCategoryFilter ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-xs" onClick={() => setSubCategoryFilter('')} disabled={!categoryFilter}>{t('all_subcategories')}</Button>
                                     {categoryFilter && subCategories.map(sc => <Button key={sc} variant={subCategoryFilter === sc ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-xs" onClick={() => setSubCategoryFilter(sc)}>{sc}</Button>)}
                                </div>
                           </ScrollArea>
                        </div>
                        {/* Product List */}
                         <div className="flex flex-col gap-2 min-h-0">
                            <Label>{t('products_sidebar')}</Label>
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Search..." className="pl-8 h-9" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                            </div>
                           <ScrollArea className="flex-1 border rounded-md force-show-scrollbar">
                                <div className="p-2 space-y-1">
                                     {filteredProducts.map(p => <Button key={p.id} variant="ghost" className="w-full justify-start h-8 text-xs" onClick={() => handleAddProduct(p)}>{p.name}</Button>)}
                                </div>
                           </ScrollArea>
                        </div>
                </CardContent>
              </Card>
              <Card className="flex-1 flex flex-col">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Invoice Items</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => setShowProfit(prev => !prev)}>
                            {showProfit ? <EyeOff /> : <Eye />}
                        </Button>
                        <Button onClick={handlePrintConfirm} disabled={!items || items.length === 0 || isProcessing}>
                           {isProcessing 
                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                : (isEditing ? <Save className="mr-2 h-4 w-4"/> : <Printer className="mr-2 h-4 w-4"/>)
                            }
                            {isProcessing 
                                ? 'Processing...' 
                                : (isEditing ? 'Update & Save' : 'Print & Save')
                            }
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className='p-0 flex-1 flex flex-col'>
                    <ScrollArea className="flex-1">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items && items.length > 0 ? items.map((item, index) => {
                                    const product = invoiceItemProducts[index];
                                    return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                          <div className="max-w-xs">
                                              <p className="font-medium break-words">{item.name}</p>
                                              <div className='text-xs text-muted-foreground flex flex-col items-start'>
                                                  <span>Sug: ৳{item.originalPrice.toFixed(2)}</span>
                                                  {showProfit && (
                                                      <>
                                                          <span>Buy: ৳{item.buyingPrice.toFixed(2)}</span>
                                                          <span className={cn(item.profitMargin < 0 ? 'text-red-500' : 'text-green-600')}>
                                                              Profit: {item.profitMargin.toFixed(1)}% (৳{item.profitAmount.toFixed(2)})
                                                          </span>
                                                      </>
                                                  )}
                                              </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="pr-8">
                                            {product && (
                                                <div className="w-16">
                                                     <StockVolumeDisplay
                                                        productName={product.name}
                                                        currentStock={product.stock}
                                                        totalSold={product.totalSold}
                                                        maxStock={product.totalEverAdded}
                                                        unit={product.mainCategory === 'Material' ? 'kg' : 'pcs'}
                                                    />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input type="text" inputMode="decimal" value={item.quantity} onChange={e => updateInvoiceItem(item.id, { quantity: e.target.value })} className="h-9 w-20" placeholder="0" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative flex items-center w-28">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">৳</span>
                                                <Input type="text" inputMode="decimal" value={item.price} onChange={e => updateInvoiceItem(item.id, { price: e.target.value })} className="pl-5 text-right font-medium h-9" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold w-32">৳ {(parseFloat(String(item.price)) * parseFloat(String(item.quantity))).toFixed(2)}</TableCell>
                                        <TableCell className="w-12">
                                            <Button variant="ghost" size="icon" onClick={() => removeInvoiceItem(item.id)} className="h-9 w-9">
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}) : (
                                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No items added yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex-col items-stretch space-y-2 pt-4">
                    <div className="w-full md:w-80 ml-auto space-y-2">
                    <div className="flex justify-between items-center font-semibold text-lg border-t pt-2 mt-2">
                        <span>{t('subtotal_label')}</span>
                        <span className="font-medium">৳ {(subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor='paidAmount' className="shrink-0 text-muted-foreground text-sm">{t('paid_label')}</Label>
                        <div className="relative flex items-center gap-2">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
                            <Input 
                                id='paidAmount' 
                                type="text"
                                inputMode='decimal'
                                value={paidAmount ?? ''} 
                                onChange={e => updateActiveDraft({ paidAmount: parseFloat(e.target.value) || undefined })} 
                                className="h-9 pl-5 pr-2 text-right font-medium w-32"
                                placeholder='0'
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className={cn(
                                    "h-8 px-2 text-xs",
                                    isFullyPaid
                                    ? "bg-green-600 hover:bg-green-700"
                                    : ""
                                )}
                                onClick={() => updateActiveDraft({ paidAmount: subtotal })}
                            >
                                Full
                            </Button>
                        </div>
                    </div>
                     <div className={cn("flex justify-between items-center font-semibold", (dueAmount || 0) > 0 ? "text-destructive" : "text-foreground")}>
                        <Label htmlFor='dueAmount' className="shrink-0 text-sm">{t('due_label')}</Label>
                        <span className="font-medium">৳ {(dueAmount || 0).toFixed(2)}</span>
                    </div>
                    </div>
                </CardFooter>
              </Card>
          </div>

          {/* Right Column: Customer Info & Preview */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>{activeDraft.label}</CardTitle>
                    <CardDescription>{t('invoice_no_label')}: {draftId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">{t('customer_name_label')}</Label>
                            <Popover open={isBuyerPopoverOpen} onOpenChange={setBuyerPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <div className="relative">
                                    <Input
                                        id="customerName"
                                        placeholder={t('customer_name_placeholder')}
                                        value={customerName || ''}
                                        onChange={(e) => handleCustomerNameChange(e.target.value)}
                                        onClick={() => setBuyerPopoverOpen(true)}
                                        autoComplete="off"
                                        ref={buyerInputRef}
                                    />
                                    <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="p-0" style={{ width: buyerInputRef.current?.offsetWidth }}>
                                    <ScrollArea className="h-60">
                                    {filteredBuyers.length > 0 ? filteredBuyers.map(buyer => (
                                        <div
                                            key={buyer.id}
                                            onClick={() => handleBuyerSelect(buyer)}
                                            className="p-2 hover:bg-muted cursor-pointer"
                                        >
                                            {buyer.name}
                                        </div>
                                    )) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">No buyers found. Type to add a new one.</div>
                                    )}
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerPhone">{t('customer_phone_label')}</Label>
                            <Input id="customerPhone" placeholder={t('customer_phone_placeholder')} value={customerPhone || ''} onChange={(e) => updateActiveDraft({ customerPhone: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerAddress">{t('customer_address_label')}</Label>
                        <Input id="customerAddress" placeholder={t('customer_address_placeholder')} value={customerAddress || ''} onChange={(e) => updateActiveDraft({ customerAddress: e.target.value })} />
                    </div>
                </CardContent>
            </Card>
            <Card className="flex-1">
                  <CardHeader>
                      <CardTitle>{t('live_print_preview_title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="h-full min-h-[500px] flex items-center justify-center bg-muted/50 rounded-lg p-4">
                      <div className="w-full h-full overflow-x-auto flex justify-center items-center">
                          <InvoicePrintLayout 
                              invoiceId={draftId}
                              currentDate={new Date().toLocaleDateString()}
                              customerName={customerName}
                              customerAddress={customerAddress}
                              customerPhone={customerPhone}
                              invoiceItems={items}
                              subtotal={subtotal}
                              paidAmount={paidAmount || 0}
                              dueAmount={dueAmount || 0}
                              printFormat={settings.printFormat}
                              locale={settings.locale}
                              previewMode={true}
                          />
                      </div>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
      
      {invoiceToPrint && (
        <div className="print-source">
            <InvoicePrintLayout
                invoiceId={invoiceToPrint.id}
                currentDate={new Date().toLocaleDateString()}
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

      <AlertDialog open={!!draftToDelete} onOpenChange={() => setDraftToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <DialogTitle>{t('are_you_sure_title')}</DialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to delete this memo? This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteDraft} className="bg-destructive hover:bg-destructive/90">{t('delete_button')}</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

    </>
  );
}

export default function InvoicePageWrapper() {
  return (
    <InvoiceFormProvider>
      <InvoicePage />
    </InvoiceFormProvider>
  );
}

    