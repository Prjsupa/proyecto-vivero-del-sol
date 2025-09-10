
'use client';

import { useState } from 'react';
import { ChevronsUpDown, Building, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import useBranchStore from '@/hooks/use-branch-store';
import { cn } from '@/lib/utils';

const branches = [
    { value: 'vivero-del-sol', label: 'Vivero del Sol' },
    { value: 'prueba', label: 'Prueba' },
]

export function BranchSwitcher() {
    const [open, setOpen] = useState(false);
    const { activeBranch, setActiveBranch } = useBranchStore();
    
    const selectedBranch = branches.find(branch => branch.value === activeBranch);

    return (
        <div className="px-3">
             <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                         <div className="flex items-center gap-2">
                             <Building className="h-4 w-4" />
                            <span className="truncate">{selectedBranch?.label || 'Seleccionar sucursal...'}</span>
                         </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--sidebar-width] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar sucursal..." />
                        <CommandList>
                            <CommandEmpty>No se encontró la sucursal.</CommandEmpty>
                            <CommandGroup>
                                {branches.map((branch) => (
                                    <CommandItem
                                        key={branch.value}
                                        value={branch.value}
                                        onSelect={(currentValue) => {
                                            setActiveBranch(currentValue as 'vivero-del-sol' | 'prueba');
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                activeBranch === branch.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {branch.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
