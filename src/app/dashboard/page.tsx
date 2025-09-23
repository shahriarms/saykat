
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useAppData } from '@/hooks/use-app-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, Users, Package, HandCoins, Receipt, Loader2, BadgeIndianRupee, Container, Wallet, ThumbsUp, Weight, FileText } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import type { DateRange, Invoice, Expense, SalaryPayment, Attendance, Product } from '@/lib/types';
import dynamic from 'next/dynamic';
import { DateRangePicker } from '@/components/date-range-picker';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


const DailySalesDialog = dynamic(() => import('@/components/daily-sales-report-dialog').then(mod => mod.DailySalesDialog), { ssr: false });
const DailyExpensesReportDialog = dynamic(() => import('@/components/daily-expenses-report-dialog').then(mod => mod.DailyExpensesReportDialog), { ssr: false });
const DailyDueReportDialog = dynamic(() => import('@/components/daily-due-report-dialog').then(mod => mod.DailyDueReportDialog), { ssr: false });
const DailyUnitsSoldReportDialog = dynamic(() => import('@/components/daily-units-sold-report-dialog').then(mod => mod.DailyUnitsSoldReportDialog), { ssr: false });
const DailyAttendanceReportDialog = dynamic(() => import('@/components/daily-attendance-report-dialog').then(mod => mod.DailyAttendanceReportDialog), { ssr: false });
const GrossProfitReportDialog = dynamic(() => import('@/components/gross-profit-report-dialog').then(mod => mod.GrossProfitReportDialog), { ssr: false });

const MonthlySalesDialog = dynamic(() => import('@/components/monthly-sales-report-dialog').then(mod => mod.MonthlySalesDialog), { ssr: false });
const MonthlyExpensesDialog = dynamic(() => import('@/components/monthly-expenses-report-dialog').then(mod => mod.MonthlyExpensesDialog), { ssr: false });
const MonthlyDueDialog = dynamic(() => import('@/components/monthly-due-report-dialog').then(mod => mod.MonthlyDueDialog), { ssr: false });
const MonthlyUnitsSoldDialog = dynamic(() => import('@/components/monthly-units-sold-report-dialog').then(mod => mod.MonthlyUnitsSoldDialog), { ssr: false });
const MonthlySalaryReportDialog = dynamic(() => import('@/components/monthly-salary-report-dialog').then(mod => mod.MonthlySalaryReportDialog), { ssr: false });
const InvoicePreviewDialog = dynamic(() => import('@/components/invoice-preview-dialog').then(mod => mod.InvoicePreviewDialog), { ssr: false });


export default function Dashboard() {
  const { products, employees, getInvoicesForDateRange, getExpensesForDateRange, getSalaryPaymentsForDateRange, getGrossProfitForDateRange, invoices: allInvoices, getAttendanceForDate } = useAppData();
  const { t } = useTranslation();
  
  const [date, setDate] = useState<DateRange | undefined>({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
  });
  
  const [rangeInvoices, setRangeInvoices] = useState<Invoice[]>([]);
  const [rangeExpenses, setRangeExpenses] = useState<Expense[]>([]);
  const [rangeSalaries, setRangeSalaries] = useState<SalaryPayment[]>([]);
  const [todayInvoices, setTodayInvoices] = useState<Invoice[]>([]);
  const [todayExpenses, setTodayExpenses] = useState<Expense[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  
  const [isDailySalesReportOpen, setDailySalesReportOpen] = useState(false);
  const [isDailyExpensesReportOpen, setDailyExpensesReportOpen] = useState(false);
  const [isDailyDueReportOpen, setDailyDueReportOpen] = useState(false);
  const [isDailyUnitsSoldReportOpen, setDailyUnitsSoldReportOpen] = useState(false);
  const [isDailyAttendanceReportOpen, setDailyAttendanceReportOpen] = useState(false);
  const [isGrossProfitReportOpen, setGrossProfitReportOpen] = useState(false);
  
  const [isMonthlySalesReportOpen, setMonthlySalesReportOpen] = useState(false);
  const [isMonthlyExpensesReportOpen, setMonthlyExpensesReportOpen] = useState(false);
  const [isMonthlyDueReportOpen, setMonthlyDueReportOpen] = useState(false);
  const [isMonthlyUnitsSoldReportOpen, setMonthlyUnitsSoldReportOpen] = useState(false);
  const [isMonthlySalaryReportOpen, setMonthlySalaryReportOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const recentMemos = useMemo(() => {
    return [...allInvoices]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [allInvoices]);
  
  // This useEffect ensures all date-sensitive operations run only on the client, preventing hydration errors.
  useEffect(() => {
    const today = new Date();
    setTodayInvoices(getInvoicesForDateRange(today, today));
    setTodayExpenses(getExpensesForDateRange(today, today));
    setTodayAttendance(getAttendanceForDate(today));
  }, [getInvoicesForDateRange, getExpensesForDateRange, getAttendanceForDate]);

  // This useEffect updates the date range data when the range changes.
  useEffect(() => {
    if (date?.from && date?.to) {
      setRangeInvoices(getInvoicesForDateRange(date.from, date.to));
      setRangeExpenses(getExpensesForDateRange(date.from, date.to));
      setRangeSalaries(getSalaryPaymentsForDateRange(date.from, date.to));
    }
  }, [date, getInvoicesForDateRange, getExpensesForDateRange, getSalaryPaymentsForDateRange]);


  const calculateUnitsSold = useCallback((invoices: Invoice[], products: Product[]) => {
      let materialSoldKg = 0;
      let hardwareSoldPcs = 0;
      const productMap = new Map(products.map(p => [p.id, p]));

      invoices.forEach(invoice => {
          invoice.items.forEach(item => {
              const product = productMap.get(item.id);
              if (product) {
                  const quantity = parseFloat(String(item.quantity)) || 0;
                  if (product.mainCategory === 'Material') {
                      materialSoldKg += quantity;
                  } else if (product.mainCategory === 'Hardware') {
                      hardwareSoldPcs += quantity;
                  }
              }
          });
      });
      return { materialSoldKg, hardwareSoldPcs };
  }, []);

  const rangeStats = useMemo(() => {
    const totalSales = rangeInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalExpenses = rangeExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalSalaryPaid = rangeSalaries.reduce((sum, sal) => sum + sal.amount, 0);
    const { grossProfit, cogs } = getGrossProfitForDateRange(rangeInvoices);
    const profit = grossProfit - totalExpenses - totalSalaryPaid;
    const totalDue = rangeInvoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
    const { materialSoldKg, hardwareSoldPcs } = calculateUnitsSold(rangeInvoices, products);
    return { totalSales, totalExpenses, totalSalaryPaid, profit, totalDue, materialSoldKg, hardwareSoldPcs, grossProfit, cogs };
  }, [rangeInvoices, rangeExpenses, rangeSalaries, getGrossProfitForDateRange, products, calculateUnitsSold]);
  
  const todayStats = useMemo(() => {
      const totalSales = todayInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
      const totalExpenses = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const { grossProfit, cogs } = getGrossProfitForDateRange(todayInvoices);
      const profit = grossProfit - totalExpenses;
      const totalDue = todayInvoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
      const { materialSoldKg, hardwareSoldPcs } = calculateUnitsSold(todayInvoices, products);
      const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
      
      return { totalSales, totalExpenses, profit, totalDue, materialSoldKg, hardwareSoldPcs, presentToday, grossProfit, cogs };
  }, [todayInvoices, todayExpenses, todayAttendance, getGrossProfitForDateRange, products, calculateUnitsSold]);
  
  const { salesChartData, expensesChartData } = useMemo(() => {
    if (!date?.from || !date?.to) return { salesChartData: [], expensesChartData: [] };

    const daysInRange = eachDayOfInterval({ start: date.from, end: date.to });
    
    const salesData = daysInRange.map(day => ({
        name: format(day, 'd'),
        Sales: rangeInvoices
            .filter(inv => isSameDay(new Date(inv.date), day))
            .reduce((sum, inv) => sum + inv.subtotal, 0),
    }));

    const expensesData = daysInRange.map(day => ({
        name: format(day, 'd'),
        Expense: rangeExpenses
            .filter(exp => isSameDay(new Date(exp.date), day))
            .reduce((sum, exp) => sum + exp.amount, 0),
    }));

    return { salesChartData: salesData, expensesChartData: expensesData };
  }, [rangeInvoices, rangeExpenses, date]);


  const chartConfig: ChartConfig = {
    Sales: { label: t('sales_label'), color: "hsl(var(--primary))" },
    Expense: { label: t('expense_label'), color: "hsl(var(--destructive))" },
  };

  const rangeTitle = useMemo(() => {
    if (!date?.from) return "This Month";
    if (date.to) {
        if (isSameDay(date.from, startOfMonth(date.from)) && isSameDay(date.to, endOfMonth(date.from))) {
            return format(date.from, 'MMMM yyyy');
        }
        if (isSameDay(date.from, date.to)) {
            return format(date.from, 'PPP');
        }
        return `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}`;
    }
    return format(date.from, 'PPP');
  }, [date]);

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
              <h1 className="text-2xl font-bold">{t('dashboard_sidebar')}</h1>
              <p className="text-muted-foreground">{t('welcome_back_header')}</p>
          </div>
          <DateRangePicker initialDateRange={date} onDateChange={setDate} />
        </div>
        
        <div>
            <h2 className="text-lg font-semibold mb-4">Recent Memos</h2>
             {recentMemos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {recentMemos.map(invoice => (
                        <button key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden">
                           <div className="p-4 bg-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-8 w-8 bg-gray-100" style={{clipPath: 'polygon(100% 0, 0 0, 100% 100%)'}}></div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-base text-gray-700">Inv #{invoice.id}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${invoice.dueAmount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{invoice.dueAmount > 0 ? 'DUE' : 'PAID'}</span>
                                </div>
                                <p className="text-left text-sm text-gray-600 truncate">{invoice.customerName}</p>
                            </div>
                            <div className="p-4 bg-gray-50/50 border-t border-dashed">
                                <p className="text-left text-2xl font-bold font-mono text-gray-800">৳ {invoice.subtotal.toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-100 px-4 py-1.5">
                                <p className="text-xs text-gray-500 text-center">{format(new Date(invoice.date), 'PP')}</p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground p-8 border rounded-lg">No recent invoices found.</div>
            )}
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4">{t('todays_summary_title')}</h2>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                <Card as="button" onClick={() => setDailySalesReportOpen(true)} className="text-left hover:bg-muted/50 transition-colors flex items-center p-4 gap-4">
                  <div className="bg-blue-100 p-3 rounded-full"><DollarSign className="h-6 w-6 text-blue-600" /></div>
                  <div>
                      <p className="text-sm text-muted-foreground">{t('todays_sales_card_title')}</p>
                      <p className="text-xl font-bold">৳ {todayStats.totalSales.toFixed(2)}</p>
                  </div>
                </Card>
                <Card as="button" onClick={() => setDailyExpensesReportOpen(true)} className="text-left hover:bg-muted/50 transition-colors flex items-center p-4 gap-4">
                  <div className="bg-orange-100 p-3 rounded-full"><Receipt className="h-6 w-6 text-orange-600" /></div>
                  <div>
                      <p className="text-sm text-muted-foreground">{t('todays_expenses_card_title')}</p>
                      <p className="text-xl font-bold">৳ {todayStats.totalExpenses.toFixed(2)}</p>
                  </div>
                </Card>
                <Card as="button" onClick={() => setDailyDueReportOpen(true)} className="text-left hover:bg-muted/50 transition-colors flex items-center p-4 gap-4" disabled={todayStats.totalDue <= 0}>
                  <div className="bg-red-100 p-3 rounded-full"><HandCoins className="h-6 w-6 text-red-600" /></div>
                  <div>
                      <p className="text-sm text-muted-foreground">{t('todays_due_card_title')}</p>
                      <p className="text-xl font-bold">৳ {todayStats.totalDue.toFixed(2)}</p>
                  </div>
                </Card>
                <Card as="button" onClick={() => setDailyUnitsSoldReportOpen(true)} className="text-left hover:bg-muted/50 transition-colors flex items-center p-4 gap-4">
                  <div className="bg-purple-100 p-3 rounded-full"><Package className="h-6 w-6 text-purple-600" /></div>
                  <div>
                      <p className="text-sm text-muted-foreground">{t('units_sold_today_card_title')}</p>
                      <p className="text-base font-bold">{`${(todayStats.materialSoldKg).toFixed(1)}kg, ${todayStats.hardwareSoldPcs}pcs`}</p>
                  </div>
                </Card>
                 <Card as="button" onClick={() => setDailyAttendanceReportOpen(true)} className="text-left hover:bg-muted/50 transition-colors flex items-center p-4 gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full"><Users className="h-6 w-6 text-indigo-600" /></div>
                  <div>
                      <p className="text-sm text-muted-foreground">{t('todays_attendance_card_title')}</p>
                      <p className="text-xl font-bold">{todayStats.presentToday} <span className="text-sm text-muted-foreground">/ {employees.length}</span></p>
                  </div>
                </Card>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Card as="button" className="text-left flex items-center p-4 gap-4">
                            <div className={`p-3 rounded-full ${todayStats.profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                <TrendingUp className={`h-6 w-6 ${todayStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Net Profit</p>
                                <p className={`text-xl font-bold ${todayStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>৳ {todayStats.profit.toFixed(2)}</p>
                            </div>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-sm">Net Profit = Gross Profit - Expenses</p>
                        <p className="text-sm">৳{todayStats.profit.toFixed(2)} = ৳{todayStats.grossProfit.toFixed(2)} - ৳{todayStats.totalExpenses.toFixed(2)}</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Card as="button" onClick={() => setGrossProfitReportOpen(true)} className="text-left flex items-center p-4 gap-4">
                            <div className="bg-teal-100 p-3 rounded-full"><ThumbsUp className="h-6 w-6 text-teal-600" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Gross Profit</p>
                                <p className="text-xl font-bold">৳ {todayStats.grossProfit.toFixed(2)}</p>
                            </div>
                        </Card>
                    </TooltipTrigger>
                     <TooltipContent>
                        <p className="text-sm">Gross Profit = Selling Price - Cost of Goods</p>
                    </TooltipContent>
                </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="text-left flex items-center p-4 gap-4">
                            <div className="bg-cyan-100 p-3 rounded-full"><Weight className="h-6 w-6 text-cyan-600" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">COGS</p>
                                <p className="text-xl font-bold">৳ {todayStats.cogs.toFixed(2)}</p>
                            </div>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-sm">Cost of Goods Sold (Total Purchase Price of Sold Items)</p>
                    </TooltipContent>
                 </Tooltip>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-1 gap-6">
                <div>
                    <h2 className="text-lg font-semibold mb-4">{t('date_range_summary_title', { range: rangeTitle })}</h2>
                     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                      <Card as="button" onClick={() => setMonthlySalesReportOpen(true)} className="text-left hover:bg-muted/50 transition-colors flex items-center p-4 gap-4">
                         <div className="bg-blue-100 p-3 rounded-full"><ShoppingCart className="h-6 w-6 text-blue-600" /></div>
                         <div>
                          <p className="text-sm text-muted-foreground">{t('monthly_sales_card_title')}</p>
                          <p className="text-xl font-bold">৳ {rangeStats.totalSales.toFixed(2)}</p>
                         </div>
                      </Card>
                      <Card as="button" onClick={() => setMonthlyExpensesReportOpen(true)} className="text-left hover:bg-muted/50 transition-colors flex items-center p-4 gap-4">
                        <div className="bg-orange-100 p-3 rounded-full"><TrendingDown className="h-6 w-6 text-orange-600" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('monthly_expenses_card_title')}</p>
                          <p className="text-xl font-bold">৳ {rangeStats.totalExpenses.toFixed(2)}</p>
                        </div>
                      </Card>
                       <Card as="button" onClick={() => setMonthlySalaryReportOpen(true)} className="text-left hover:bg-muted/50 transition-colors flex items-center p-4 gap-4">
                        <div className="bg-teal-100 p-3 rounded-full"><Wallet className="h-6 w-6 text-teal-600" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('salary_paid_card_title')}</p>
                          <p className="text-xl font-bold">৳ {rangeStats.totalSalaryPaid.toFixed(2)}</p>
                        </div>
                      </Card>
                       <Card as="button" onClick={() => setMonthlyDueReportOpen(true)} className="text-left hover:bg-muted/50 transition-colors flex items-center p-4 gap-4" disabled={rangeStats.totalDue <= 0}>
                        <div className="bg-red-100 p-3 rounded-full"><BadgeIndianRupee className="h-6 w-6 text-red-600" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('total_due_card_title')}</p>
                          <p className="text-xl font-bold">৳ {rangeStats.totalDue.toFixed(2)}</p>
                        </div>
                      </Card>
                       <Card as="button" onClick={() => setMonthlyUnitsSoldReportOpen(true)} className="text-left hover:bg-muted/so transition-colors flex items-center p-4 gap-4">
                        <div className="bg-purple-100 p-3 rounded-full"><Container className="h-6 w-6 text-purple-600" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('total_units_sold_card_title')}</p>
                          <p className="text-base font-bold">{`${rangeStats.materialSoldKg.toFixed(1)}kg, ${rangeStats.hardwareSoldPcs}pcs`}</p>
                        </div>
                      </Card>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Card className="text-left flex items-center p-4 gap-4">
                              <div className={`p-3 rounded-full ${rangeStats.profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                  <TrendingUp className={`h-6 w-6 ${rangeStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">{t('profit_card_title')}</p>
                                <p className={`text-xl font-bold ${rangeStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>৳ {rangeStats.profit.toFixed(2)}</p>
                              </div>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-sm">Profit = Gross Profit - (Expenses + Salaries)</p>
                            <p className="text-sm">৳{rangeStats.profit.toFixed(2)} = ৳{rangeStats.grossProfit.toFixed(2)} - (৳{rangeStats.totalExpenses.toFixed(2)} + ৳{rangeStats.totalSalaryPaid.toFixed(2)})</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
              <CardHeader>
              <CardTitle>{t('daily_sales_chart_title', { range: rangeTitle })}</CardTitle>
              <CardDescription>{t('daily_sales_chart_description')}</CardDescription>
              </CardHeader>
              <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                  <BarChart data={salesChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis />
                  <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="Sales" fill="var(--color-Sales)" radius={4} />
                  </BarChart>
              </ChartContainer>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>{t('daily_expenses_chart_title', { range: rangeTitle })}</CardTitle>
                  <CardDescription>{t('daily_expenses_chart_description')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                      <BarChart data={expensesChartData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis />
                          <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                          />
                          <Bar dataKey="Expense" fill="var(--color-Expense)" radius={4} />
                      </BarChart>
                  </ChartContainer>
              </CardContent>
          </Card>
        </div>
      </div>

      { isDailySalesReportOpen && <DailySalesDialog
        open={isDailySalesReportOpen}
        onOpenChange={setDailySalesReportOpen}
        invoices={todayInvoices}
      /> }
      { isDailyExpensesReportOpen && <DailyExpensesReportDialog
        open={isDailyExpensesReportOpen}
        onOpenChange={setDailyExpensesReportOpen}
        expenses={todayExpenses}
      /> }
      { isDailyDueReportOpen && <DailyDueReportDialog
        open={isDailyDueReportOpen}
        onOpenChange={setDailyDueReportOpen}
        invoices={todayInvoices}
      /> }
      { isDailyUnitsSoldReportOpen && <DailyUnitsSoldReportDialog
        open={isDailyUnitsSoldReportOpen}
        onOpenChange={setDailyUnitsSoldReportOpen}
        invoices={todayInvoices}
        products={products}
      /> }
      { isDailyAttendanceReportOpen && <DailyAttendanceReportDialog
        open={isDailyAttendanceReportOpen}
        onOpenChange={setDailyAttendanceReportOpen}
        attendance={todayAttendance}
        employees={employees}
      /> }
      { isGrossProfitReportOpen && <GrossProfitReportDialog
        open={isGrossProfitReportOpen}
        onOpenChange={setGrossProfitReportOpen}
        invoices={todayInvoices}
      /> }

      {/* Monthly/Date Range Report Dialogs */}
      { isMonthlySalesReportOpen && <MonthlySalesDialog
        open={isMonthlySalesReportOpen}
        onOpenChange={setMonthlySalesReportOpen}
        invoices={rangeInvoices}
        dateRange={date}
      /> }
      { isMonthlyExpensesReportOpen && <MonthlyExpensesDialog
        open={isMonthlyExpensesReportOpen}
        onOpenChange={setMonthlyExpensesReportOpen}
        expenses={rangeExpenses}
        dateRange={date}
      /> }
      { isMonthlyDueReportOpen && <MonthlyDueDialog
        open={isMonthlyDueReportOpen}
        onOpenChange={setMonthlyDueReportOpen}
        invoices={rangeInvoices}
        dateRange={date}
      /> }
      { isMonthlyUnitsSoldReportOpen && <MonthlyUnitsSoldDialog
        open={isMonthlyUnitsSoldReportOpen}
        onOpenChange={setMonthlyUnitsSoldReportOpen}
        invoices={rangeInvoices}
        products={products}
        dateRange={date}
      /> }
      { isMonthlySalaryReportOpen && <MonthlySalaryReportDialog
        open={isMonthlySalaryReportOpen}
        onOpenChange={setMonthlySalaryReportOpen}
        salaryPayments={rangeSalaries}
        employees={employees}
        dateRange={date}
      /> }
       { selectedInvoice && <InvoicePreviewDialog
        invoice={selectedInvoice}
        open={!!selectedInvoice}
        onOpenChange={() => setSelectedInvoice(null)}
      />}
    </>
  );
}
