
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Pencil, Trash2, ShieldAlert, Loader2, Search } from 'lucide-react';
import { useAppData } from '@/hooks/use-app-data';
import { useUser } from '@/hooks/use-user';
import { useTranslation } from '@/hooks/use-translation';
import type { Employee } from '@/lib/types';
import { format } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import dynamic from 'next/dynamic';

const EditEmployeeDialog = dynamic(() => import('@/components/employee-dialog'), {
    ssr: false,
    loading: () => <Loader2 className="h-5 w-5 animate-spin" />
});

interface EmployeeListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmployeeListDialog({ open, onOpenChange }: EmployeeListDialogProps) {
    const { employees, deleteEmployee } = useAppData();
    const { user } = useUser();
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [showAdminAlert, setShowAdminAlert] = useState(false);

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => 
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);
    
    const handleEdit = (employee: Employee) => {
        if (user?.role !== 'admin') {
            setShowAdminAlert(true);
            return;
        }
        setEmployeeToEdit(employee);
    };
    
    const handleDelete = (employee: Employee) => {
        if (user?.role !== 'admin') {
            setShowAdminAlert(true);
            return;
        }
        setEmployeeToDelete(employee);
    };

    const confirmDelete = () => {
        if (employeeToDelete) {
            deleteEmployee(employeeToDelete.id);
            setEmployeeToDelete(null);
        }
    };
    
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{t('employee_list_title')}</DialogTitle>
                        <DialogDescription>{t('employee_list_description')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder={t('search_by_name_or_role_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <ScrollArea className="h-[60vh] rounded-md border">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background">
                                    <TableRow>
                                        <TableHead>{t('name_header')}</TableHead>
                                        <TableHead className="hidden md:table-cell">{t('role_header')}</TableHead>
                                        <TableHead className="hidden lg:table-cell">{t('phone_header')}</TableHead>
                                        <TableHead className="hidden lg:table-cell">{t('joining_date_header')}</TableHead>
                                        <TableHead className="text-right">{t('salary_header')}</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.map(employee => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-medium">
                                                {employee.name}
                                                <div className="text-muted-foreground text-xs md:hidden">{employee.role}</div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{employee.role}</TableCell>
                                            <TableCell className="hidden lg:table-cell">{employee.phone}</TableCell>
                                            <TableCell className="hidden lg:table-cell">{format(new Date(employee.joiningDate), 'PP')}</TableCell>
                                            <TableCell className="text-right font-mono">৳ {employee.salary.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={user?.role !== 'admin'}>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(employee)}><Pencil className="mr-2 h-4 w-4"/> {t('edit_button')}</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(employee)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> {t('delete_button')}</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {employeeToEdit && (
                <EditEmployeeDialog 
                    open={!!employeeToEdit} 
                    onOpenChange={(isOpen) => { if (!isOpen) setEmployeeToEdit(null) }}
                    employee={employeeToEdit}
                />
            )}

            <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('are_you_sure_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('delete_employee_confirmation_description', { name: employeeToDelete?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('delete_button')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showAdminAlert} onOpenChange={setShowAdminAlert}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="text-destructive"/> {t('access_denied_title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                    {t('admin_permission_required_description')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setShowAdminAlert(false)}>
                    {t('ok_button')}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
