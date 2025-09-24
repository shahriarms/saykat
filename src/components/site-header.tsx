
'use client';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Settings, KeyRound, Languages } from 'lucide-react';
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
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks/use-translation';
import { useSettings } from '@/hooks/use-settings';
import type { Locale } from '@/lib/types';
import Link from 'next/link';
import { StockPilotLogo } from './stock-pilot-logo';
import { DatabaseStatus } from './database-status';
import { Loader2 } from 'lucide-react';


const LiveClock = dynamic(() => import('./live-clock').then(mod => mod.LiveClock), {
  ssr: false,
});

const RedeemAdminCodeDialog = dynamic(() => import('./redeem-admin-code-dialog').then(mod => mod.RedeemAdminCodeDialog), {
    ssr: false,
    loading: () => <Loader2 className="h-5 w-5 animate-spin" />
});

const ShowAdminCodeDialog = dynamic(() => import('./show-admin-code-dialog').then(mod => mod.ShowAdminCodeDialog), {
    ssr: false,
    loading: () => <Loader2 className="h-5 w-5 animate-spin" />
});


export function SiteHeader() {
  const { user, logout, generateAdminCode, adminCode } = useUser();
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();

  const [isRedeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [isShowCodeDialogOpen, setShowCodeDialogOpen] = useState(false);
  
  const handleShowCode = () => {
    generateAdminCode();
    setShowCodeDialogOpen(true);
  }

  const handleLocaleChange = (value: string) => {
    updateSettings({ locale: value as Locale });
  }
  
  if (!user) {
    return (
       <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-center gap-4 bg-muted/30 px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <StockPilotLogo className="w-14 h-14" />
            <h1 className="text-xl font-semibold">
              <span className="text-foreground">Mahmud Engineering Shop</span>
            </h1>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 bg-muted/30 px-4 sm:px-6">
        {/* Left Section: Logo and Title */}
        <div className="flex items-center gap-2 min-w-0">
            <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-2">
                <StockPilotLogo className="w-14 h-14 flex-shrink-0" />
            </Link>
            <h1 className="text-lg font-bold sm:text-2xl">
                <span className="text-foreground">Mahmud Engineering Shop</span>
            </h1>
        </div>
        
        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Right Section: Clock and User Menu */}
        <div className="flex flex-shrink-0 items-center justify-end gap-2 sm:gap-4">
            <div className="hidden sm:flex"><LiveClock /></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-8 w-8" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-center px-2 py-1.5">
                  <DatabaseStatus />
                </div>
                <DropdownMenuLabel>
                  <div>{t('my_account_label')}</div>
                  <div className="text-xs font-normal text-muted-foreground">{user.email} ({t(`role_${user.role}` as any)})</div>
                </DropdownMenuLabel>
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
