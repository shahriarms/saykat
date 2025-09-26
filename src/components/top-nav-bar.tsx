
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
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard_sidebar', color: 'bg-blue-100', iconColor: 'text-blue-600' },
  { href: '/dashboard/products', icon: Package, labelKey: 'products_sidebar', color: 'bg-amber-100', iconColor: 'text-amber-600' },
  { href: '/dashboard/invoice', icon: FileText, labelKey: 'invoice_sidebar', color: 'bg-green-100', iconColor: 'text-green-600' },
  { href: '/dashboard/buyers', icon: Users, labelKey: 'buyer_purchases_sidebar', color: 'bg-cyan-100', iconColor: 'text-cyan-600' },
  { href: '/dashboard/buyers-due', icon: HandCoins, labelKey: 'buyers_due_sidebar', color: 'bg-red-100', iconColor: 'text-red-600' },
  { href: '/dashboard/expenses', icon: Receipt, labelKey: 'expenses_sidebar', color: 'bg-orange-100', iconColor: 'text-orange-600' },
  { href: '/dashboard/employees', icon: UserCog, labelKey: 'employee_attendance_sidebar', color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { href: '/dashboard/salaries', icon: Wallet, labelKey: 'salaries_sidebar', color: 'bg-teal-100', iconColor: 'text-teal-600' },
  { href: '/dashboard/settings', icon: Settings, labelKey: 'settings_sidebar', color: 'bg-slate-200', iconColor: 'text-slate-600' },
] as const;

export function TopNavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <nav className="bg-muted/30 py-2">
      <div className="flex justify-center items-center gap-2 sm:gap-4 px-2 overflow-x-auto no-scrollbar mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Tooltip key={item.href} delayDuration={isMobile ? 500 : 0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all duration-200 ease-in-out transform group",
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center rounded-full w-16 h-16 transition-all duration-200 ease-in-out",
                    "shadow-lg border border-white/50",
                    "group-hover:-translate-y-1",
                    "group-active:translate-y-px group-active:shadow-inner",
                    item.color,
                    isActive && "ring-2 ring-offset-2 ring-primary"
                  )}>
                    <Icon className={cn("h-8 w-8 text-white transition-all", isActive ? 'text-white' : item.iconColor)} />
                  </div>
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
