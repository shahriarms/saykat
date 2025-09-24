
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
import { Product } from '@/lib/types';
import { StockVolumeDisplay } from './stock-volume-display';
import { Weight, ThumbsUp } from 'lucide-react';

interface StockStatusCardProps {
  products: Product[];
}

export function StockStatusCard({ products }: StockStatusCardProps) {
  const { materialProducts, hardwareProducts, maxMaterialStock, maxHardwareStock } = React.useMemo(() => {
    const materialProducts = products.filter(p => p.mainCategory === 'Material');
    const hardwareProducts = products.filter(p => p.mainCategory === 'Hardware');

    const maxMaterialStock = Math.max(...materialProducts.map(p => p.stock), 100);
    const maxHardwareStock = Math.max(...hardwareProducts.map(p => p.stock), 100);

    return { materialProducts, hardwareProducts, maxMaterialStock, maxHardwareStock };
  }, [products]);

  const renderCarousel = (
    productList: Product[],
    maxStock: number,
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
                <Card className="overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center p-3 gap-2">
                    <StockVolumeDisplay
                      currentStock={product.stock}
                      maxStock={maxStock}
                      unit={unit}
                    />
                    <div className="text-center">
                      <p className="text-sm font-semibold truncate w-32" title={product.name}>
                        {product.name}
                      </p>
                    </div>
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
            {renderCarousel(materialProducts, maxMaterialStock, 'kg')}
          </TabsContent>
          <TabsContent value="hardware" className="pt-4">
            {renderCarousel(hardwareProducts, maxHardwareStock, 'pcs')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
