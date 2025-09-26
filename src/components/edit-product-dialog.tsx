
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppData } from '@/hooks/use-app-data';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Product } from '@/lib/types';
import { useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useTranslation } from '@/hooks/use-translation';
import { FormDescription } from './ui/form';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  sku: z.string().min(2, { message: 'SKU must be at least 2 characters.' }),
  mainCategory: z.enum(['Material', 'Hardware'], { required_error: 'You must select a main category.' }),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }),
  subCategory: z.string().min(1, { message: 'Sub-category is required.' }),
  buyingPrice: z.coerce.number().optional().default(0),
  profitMargin: z.coerce.number().positive({ message: 'Profit margin must be a positive number.'}),
  sellingPrice: z.coerce.number().positive({ message: 'Selling price must be a positive number.'}),
  stock: z.coerce.number().min(0, { message: 'Stock must be a non-negative number.' }),
  containerSize: z.coerce.number().min(0, { message: 'Container size must be a non-negative number.' }),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function EditProductDialog({ open, onOpenChange, product }: EditProductDialogProps) {
  const { updateProduct } = useAppData();
  const { t } = useTranslation();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {}, // Will be reset by useEffect
  });

  const buyingPrice = useWatch({ control: form.control, name: 'buyingPrice' });
  const profitMargin = useWatch({ control: form.control, name: 'profitMargin' });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        mainCategory: product.mainCategory,
        category: product.category,
        subCategory: product.subCategory,
        buyingPrice: product.buyingPrice,
        profitMargin: product.profitMargin,
        sellingPrice: product.sellingPrice,
        stock: undefined, // "Stock to Add" should be empty initially
        containerSize: product.containerSize,
      });
    }
  }, [product, form, open]); // Depend on `open` to reset form when dialog reopens

  useEffect(() => {
    const bp = parseFloat(String(buyingPrice)) || 0;
    const pm = parseFloat(String(profitMargin)) || 0;

    if (isFinite(bp) && isFinite(pm)) {
        const calculatedPrice = bp + (bp * pm / 100);
        form.setValue('sellingPrice', parseFloat(calculatedPrice.toFixed(2)));
    } else {
        form.setValue('sellingPrice', 0);
    }
  }, [buyingPrice, profitMargin, form]);

  const onSubmit = (data: ProductFormValues) => {
    // Here, 'data.stock' is the "Stock to Add". We pass it to the update function.
    // The `isAdditive: true` flag tells the hook to add this to the current remaining stock.
    updateProduct(product.id, { ...data, stock: data.stock || 0 }, true);
    onOpenChange(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('edit_product_dialog_title')}</DialogTitle>
          <DialogDescription>
            {t('edit_product_dialog_description', { name: product.name })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
             <FormField
              control={form.control}
              name="mainCategory"
              render={({ field }) => (
                <FormItem className="space-y-3 col-span-2">
                  <FormLabel>{t('main_category_label')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Material" />
                        </FormControl>
                        <FormLabel className="font-normal">{t('material_tab')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Hardware" />
                        </FormControl>
                        <FormLabel className="font-normal">{t('hardware_tab')}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{t('product_name_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Classic T-Shirt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('category_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Angel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('subcategory_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 28" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('sku_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ANG-1-4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock to Add ({product.mainCategory === 'Material' ? 'kg' : 'pcs'})</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" inputMode="decimal" placeholder="0" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormDescription>
                      Current Remaining Stock: {product.stock}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="buyingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('buying_price_label')}</FormLabel>
                  <FormControl>
                    <Input type="text" inputMode="decimal" placeholder="0.00" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profitMargin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profit_margin_label')}</FormLabel>
                  <FormControl>
                    <Input type="text" inputMode="decimal" placeholder="0" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>{t('selling_price_label')}</FormLabel>
                        <FormControl>
                             <Input type="text" inputMode="decimal" {...field} readOnly className="bg-muted font-bold" value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter className="col-span-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {t('cancel_button')}
              </Button>
              <Button type="submit">{t('save_changes_button')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
