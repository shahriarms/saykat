
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Weight, Wrench } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface StockStatusCardProps {
  products: Product[];
  invoices: Invoice[];
}

// Helper to chunk array
const chunk = <T,>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );


export function StockStatusCard({ products, invoices }: StockStatusCardProps) {
  const [activeTab, setActiveTab] = React.useState<'Material' | 'Hardware'>('Material');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [subCategoryFilter, setSubCategoryFilter] = React.useState('');
  const isMobile = useIsMobile();

  const { filteredProducts, categories, subCategories } = React.useMemo(() => {
    const soldQuantities = new Map<string, number>();
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const quantity = parseFloat(String(item.quantity)) || 0;
        soldQuantities.set(item.id, (soldQuantities.get(item.id) || 0) + quantity);
      });
    });

    const enrichedProducts = products.map(p => {
      const totalSold = soldQuantities.get(p.id) || 0;
      const currentStock = parseFloat(String(p.stock)) || 0;
      const totalEverAdded = currentStock + totalSold;
      return { ...p, stock: currentStock, totalSold, totalEverAdded };
    });

    const productsForTab = enrichedProducts.filter(p => p.mainCategory === activeTab);
    const uniqueCategories = [...new Set(productsForTab.map(p => p.category).filter(Boolean))];
    const productsAfterCategoryFilter = categoryFilter ? productsForTab.filter(p => p.category === categoryFilter) : productsForTab;
    const uniqueSubCategories = [...new Set(productsAfterCategoryFilter.map(p => p.subCategory).filter(Boolean))];

    // Default sort by stock percentage (ascending)
    productsForTab.sort((a, b) => {
        const stockPercentA = a.totalEverAdded > 0 ? (a.stock / a.totalEverAdded) * 100 : 0;
        const stockPercentB = b.totalEverAdded > 0 ? (b.stock / b.totalEverAdded) * 100 : 0;
        return stockPercentA - stockPercentB;
    });
    
    const isAnyFilterActive = searchTerm || categoryFilter || subCategoryFilter;

    const finalFiltered = isAnyFilterActive ?
      productsForTab
      .filter(p => searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
      .filter(p => categoryFilter ? p.category === categoryFilter : true)
      .filter(p => subCategoryFilter ? p.subCategory === subCategoryFilter : true)
      : productsForTab;

    return {
      filteredProducts: finalFiltered,
      categories: uniqueCategories,
      subCategories: uniqueSubCategories,
    };
  }, [products, invoices, activeTab, searchTerm, categoryFilter, subCategoryFilter]);
  
  const resetFilters = () => {
      setSearchTerm('');
      setCategoryFilter('');
      setSubCategoryFilter('');
  }

  const renderCarousel = (
    productList: (Product & { totalSold: number, totalEverAdded: number })[]
  ) => {
    if (productList.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No products match your filters.
        </div>
      );
    }
    
    // Determine chunk size based on screen size for a 2-row layout
    const chunkSize = isMobile ? 4 : 8;
    const chunkedProducts = chunk(productList, chunkSize);

    return (
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full px-12"
      >
        <CarouselContent>
          {chunkedProducts.map((chunk, index) => (
            <CarouselItem key={index}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-4">
                {chunk.map(product => (
                   <div key={product.id} className="flex flex-col items-center justify-start h-full">
                      <StockVolumeDisplay
                        productName={product.name}
                        dbStock={product.stock}
                        totalSold={product.totalSold}
                        maxStock={product.totalEverAdded}
                        unit={product.mainCategory === 'Material' ? 'kg' : 'pcs'}
                      />
                   </div>
                ))}
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
    <Card className="bg-transparent shadow-none border-0">
      <CardHeader>
        <CardTitle>Live Stock Status</CardTitle>
        <CardDescription>Search, filter, and view the real-time stock levels of your products.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'Material' | 'Hardware')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Material">
              <Weight className="mr-2 h-4 w-4" /> Material
            </TabsTrigger>
            <TabsTrigger value="Hardware">
              <Wrench className="mr-2 h-4 w-4" /> Hardware
            </TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-2 py-4 border-b">
              <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                      type="search" 
                      placeholder="Search by product name..."
                      className="pl-8" 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
              <Select value={categoryFilter} onValueChange={(value) => {setCategoryFilter(value === 'all' ? '' : value); setSubCategoryFilter('')}}>
                  <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Select value={subCategoryFilter} onValueChange={(value) => setSubCategoryFilter(value === 'all' ? '' : value)} disabled={!categoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by Sub-Category" />
                  </SelectTrigger>
                  <SelectContent>
                        <SelectItem value="all">All Sub-Categories</SelectItem>
                      {subCategories.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters}>Reset</Button>
          </div>

          <TabsContent value="Material" className="pt-4">
            {renderCarousel(filteredProducts)}
          </TabsContent>
          <TabsContent value="Hardware" className="pt-4">
            {renderCarousel(filteredProducts)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
