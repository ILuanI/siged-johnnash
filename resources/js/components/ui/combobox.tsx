import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
    value: string;
    label: string;
    /** Texto adicional usado solo para el filtro de búsqueda. */
    keywords?: string;
};

type ComboboxProps = {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    /** Muestra una acción "Crear …" cuando la búsqueda no coincide con ninguna opción. */
    onCreate?: (query: string) => void;
    createLabel?: string;
};

/**
 * Select con búsqueda integrada (escribir para filtrar). Reemplazo directo
 * de <Select> de Shadcn cuando la lista de opciones es larga o el usuario
 * quiere teclear en lugar de desplazarse.
 */
export function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar…',
    searchPlaceholder = 'Buscar…',
    emptyText = 'Sin resultados.',
    disabled = false,
    className,
    id,
    onCreate,
    createLabel = 'Crear',
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');

    const selected = options.find((option) => option.value === value);
    const queryTrimmed = query.trim();
    const exactMatch = options.some(
        (option) => option.label.toLowerCase() === queryTrimmed.toLowerCase(),
    );

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal bg-white dark:bg-transparent',
                        !selected && 'text-muted-foreground',
                        className,
                    )}
                >
                    <span className="truncate">{selected ? selected.label : placeholder}</span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
            >
                <Command
                    filter={(itemValue, search, keywords) => {
                        const haystack = `${itemValue} ${keywords?.join(' ') ?? ''}`.toLowerCase();
                        return haystack.includes(search.toLowerCase()) ? 1 : 0;
                    }}
                >
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {onCreate && queryTrimmed.length > 0 ? (
                                <button
                                    type="button"
                                    className="text-primary mx-auto flex items-center gap-1.5 text-sm font-medium hover:underline"
                                    onClick={() => {
                                        onCreate(queryTrimmed);
                                        setOpen(false);
                                        setQuery('');
                                    }}
                                >
                                    <Plus className="size-3.5" />
                                    {createLabel} “{queryTrimmed}”
                                </button>
                            ) : (
                                emptyText
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    keywords={option.keywords ? [option.keywords] : undefined}
                                    onSelect={() => {
                                        onChange(option.value === value ? '' : option.value);
                                        setOpen(false);
                                        setQuery('');
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'size-4',
                                            option.value === value ? 'opacity-100' : 'opacity-0',
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                            {onCreate && queryTrimmed.length > 0 && !exactMatch && (
                                <CommandItem
                                    value={`__create__${queryTrimmed}`}
                                    onSelect={() => {
                                        onCreate(queryTrimmed);
                                        setOpen(false);
                                        setQuery('');
                                    }}
                                >
                                    <Plus className="size-4" />
                                    {createLabel} “{queryTrimmed}”
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
