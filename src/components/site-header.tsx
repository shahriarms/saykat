
'use client';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Settings, KeyRound, Languages, Database } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/use-user';
import { useState, useRef } from 'react';
import { RedeemAdminCodeDialog } from './redeem-admin-code-dialog';
import { ShowAdminCodeDialog } from './show-admin-code-dialog';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks/use-translation';
import { useSettings } from '@/hooks/use-settings';
import type { Locale } from '@/lib/types';
import Link from 'next/link';
import { StockPilotLogo } from './stock-pilot-logo';
import { useAppData } from '@/hooks/use-app-data';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from './use-toast';
import * as XLSX from 'xlsx';
import type { Product } from '@/lib/types';


const LiveClock = dynamic(() => import('./live-clock').then(mod => mod.LiveClock), {
  ssr: false,
});


export function SiteHeader() {
  const { user, logout, generateAdminCode, adminCode } = useUser();
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const { isDbConnected, isAppDataLoading, addMultipleProducts } = useAppData();
  const { toast } = useToast();

  const [isRedeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [isShowCodeDialogOpen, setShowCodeDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShowCode = () => {
    generateAdminCode();
    setShowCodeDialogOpen(true);
  }

  const handleLocaleChange = (value: string) => {
    updateSettings({ locale: value as Locale });
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const newProducts: Omit<Product, 'id' | 'sellingPrice'>[] = json.map((row: any) => ({
          name: String(row['Name'] || ''),
          sku: String(row['SKU'] || ''),
          buyingPrice: parseFloat(String(row['Buying Price'] || 0)),
          profitMargin: parseFloat(String(row['Profit Margin'] || 0)),
          stock: parseInt(String(row['Stock'] || 0), 10),
          mainCategory: (row['Main Category'] === 'Hardware' ? 'Hardware' : 'Material') as 'Material' | 'Hardware',
          category: String(row['Category'] || ''),
          subCategory: String(row['Sub-Category'] || ''),
        })).filter(p => p.name && p.sku);

        if (newProducts.length > 0) {
          addMultipleProducts(newProducts);
          toast({
            title: t('upload_successful_toast_title'),
            description: t('upload_successful_toast_description', { count: newProducts.length }),
          });
        } else {
          toast({
            variant: 'destructive',
            title: t('upload_failed_toast_title'),
            description: t('upload_failed_toast_description'),
          });
        }
      } catch (error) {
        console.error("Error parsing uploaded file:", error);
        toast({
          variant: 'destructive',
          title: t('upload_error_toast_title'),
          description: t('upload_error_toast_description'),
        });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  if (!user) {
    return (
       <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-center gap-4 border-b bg-card px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <StockPilotLogo className="w-10 h-10" />
            <h1 className="text-xl font-semibold">
              <span className="text-foreground">Mahmud Engineering Shop</span>
            </h1>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-20 grid h-16 grid-cols-3 items-center border-b bg-card px-4 sm:px-6">
        {/* Left Section: Empty */}
        <div className="flex justify-start">
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".xlsx, .xls, .csv"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={user?.role !== 'admin'}>
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('upload_button')}</span>
          </Button>
        </div>

        {/* Center Section: Logo and Title */}
        <div className="flex items-center justify-center">
            <Link href="/dashboard" className="flex items-center gap-2">
                <StockPilotLogo className="w-10 h-10" />
                <h1 className="hidden sm:block text-xl sm:text-2xl font-bold">
                    <span className="text-foreground">Mahmud Engineering Shop</span>
                </h1>
            </Link>
        </div>
        
        {/* Right Section: Clock and User Menu */}
        <div className="flex items-center justify-end gap-2 sm:gap-4">
            <div className="hidden sm:flex"><LiveClock /></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-8 w-8" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>{t('my_account_label')}</div>
                  <div className="text-xs font-normal text-muted-foreground">{user.email} ({t(`role_${user.role}` as any)})</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem disabled>
                    <div className="flex items-center w-full">
                        <Database className="mr-2 h-4 w-4" />
                        <span>Database:</span>
                        <div className="flex items-center gap-2 ml-auto">
                            {isAppDataLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <span className={`h-2.5 w-2.5 rounded-full ${ isDbConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            )}
                            <span className="font-mono text-xs font-semibold">
                                {isAppDataLoading ? '...' : (isDbConnected ? 'Online' : 'Local')}
                            </span>
                        </div>
                    </div>
                 </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Languages className="mr-2 h-4 w-4" />
                    <span>{t('language_label')}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup value={settings.locale} onValueChange={handleLocaleChange}>
                          <DropdownMenuRadioItem value="en">{t('language_english')}</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="bn">{t('language_bengali')}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                {user.role === 'admin' ? (
                  <DropdownMenuItem onClick={handleShowCode}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    {t('generate_admin_code_button')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setRedeemDialogOpen(true)}>
                     <KeyRound className="mr-2 h-4 w-4" />
                    {t('redeem_admin_code_button')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <Link href="/dashboard/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings_label')}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout_button')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <RedeemAdminCodeDialog
        open={isRedeemDialogOpen}
        onOpenChange={setRedeemDialogOpen}
      />
      <ShowAdminCodeDialog
        open={isShowCodeDialogOpen}
        onOpenChange={setShowCodeDialogOpen}
        code={adminCode}
      />
    </>
  );
}
