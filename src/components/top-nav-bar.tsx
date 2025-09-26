
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  HandCoins,
  Receipt,
  UserCog,
  Wallet,
  Settings,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard_sidebar' },
  { href: '/dashboard/products', icon: Package, labelKey: 'products_sidebar' },
  { href: '/dashboard/invoice', icon: FileText, labelKey: 'invoice_sidebar' },
  { href: '/dashboard/buyers', icon: Users, labelKey: 'buyer_purchases_sidebar' },
  { href: '/dashboard/buyers-due', icon: HandCoins, labelKey: 'buyers_due_sidebar' },
  { href: '/dashboard/expenses', icon: Receipt, labelKey: 'expenses_sidebar' },
  { href: '/dashboard/employees', icon: UserCog, labelKey: 'employee_attendance_sidebar' },
  { href: '/dashboard/salaries', icon: Wallet, labelKey: 'salaries_sidebar' },
  { href: '/dashboard/settings', icon: Settings, labelKey: 'settings_sidebar' },
] as const;

export function TopNavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <nav className="bg-muted/30 py-2">
      <div className="flex justify-center items-center gap-1 sm:gap-2 px-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1.5 rounded-lg text-center transition-all duration-200 ease-in-out transform",
                    "h-20 w-24", // Fixed size for consistency
                    "bg-slate-100 border-slate-200 border-t border-l shadow-md", // Base 3D styles
                    isActive 
                      ? "bg-sky-100 text-sky-600 shadow-inner -translate-y-px" // Active State
                      : "text-slate-500 hover:bg-slate-200 hover:-translate-y-px active:translate-y-px active:shadow-inner", // Inactive State
                  )}
                >
                    <div className={cn(
                        "p-2.5 rounded-full",
                         isActive ? "bg-sky-200" : "bg-slate-200"
                    )}>
                        <Icon className={cn(
                            "h-6 w-6 transition-colors",
                             isActive ? "text-sky-700" : "text-slate-600"
                        )} />
                    </div>
                    <span className={cn(
                        "text-[11px] font-bold truncate transition-colors",
                         isActive ? 'text-sky-800' : 'text-slate-600'
                    )}>
                        {t(item.labelKey)}
                    </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t(item.labelKey)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}
