
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Product, Invoice } from '@/lib/types';
import { StockVolumeDisplay } from './stock-volume-display';
import { Weight, ThumbsUp } from 'lucide-react';

interface StockStatusCardProps {
  products: Product[];
  invoices: Invoice[];
}

export function StockStatusCard({ products, invoices }: StockStatusCardProps) {
  const { materialProducts, hardwareProducts } = React.useMemo(() => {
    const soldQuantities = new Map<string, number>();
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        soldQuantities.set(item.id, (soldQuantities.get(item.id) || 0) + item.quantity);
      });
    });

    const enrichedProducts = products.map(p => {
      const totalSold = soldQuantities.get(p.id) || 0;
      const totalEverAdded = p.stock + totalSold;
      return { ...p, totalSold, totalEverAdded };
    });

    const materialProducts = enrichedProducts.filter(p => p.mainCategory === 'Material');
    const hardwareProducts = enrichedProducts.filter(p => p.mainCategory === 'Hardware');

    return { materialProducts, hardwareProducts };
  }, [products, invoices]);

  const renderCarousel = (
    productList: (Product & { totalSold: number, totalEverAdded: number })[],
    unit: string
  ) => {
    if (productList.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No products in this category.
        </div>
      );
    }

    return (
      <Carousel
        opts={{
          align: 'start',
          loop: productList.length > 5,
        }}
        className="w-full px-12"
      >
        <CarouselContent>
          {productList.map(product => (
            <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
              <div className="p-1">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-3 gap-2">
                    <StockVolumeDisplay
                      productName={product.name}
                      currentStock={product.stock}
                      maxStock={product.totalEverAdded}
                      unit={unit}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Stock Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="material">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="material">
              <Weight className="mr-2 h-4 w-4" /> Material
            </TabsTrigger>
            <TabsTrigger value="hardware">
              <ThumbsUp className="mr-2 h-4 w-4" /> Hardware
            </TabsTrigger>
          </TabsList>
          <TabsContent value="material" className="pt-4">
            {renderCarousel(materialProducts, 'kg')}
          </TabsContent>
          <TabsContent value="hardware" className="pt-4">
            {renderCarousel(hardwareProducts, 'pcs')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
