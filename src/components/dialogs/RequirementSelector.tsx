import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { requirementsData } from '@/data/mockData';

interface RequirementOption {
  id: string;
  reqId: string;
  title: string;
}

interface RequirementSelectorProps {
  value?: string;
  onChange: (reqId: string, reqTitle: string, reqNumber: string) => void;
  placeholder?: string;
  className?: string;
}

export function RequirementSelector({
  value,
  onChange,
  placeholder = "Select requirement...",
  className
}: RequirementSelectorProps) {
  const [open, setOpen] = useState(false);

  const requirements: RequirementOption[] = useMemo(() => {
    return requirementsData.map(req => ({
      id: req.id,
      reqId: req.reqId,
      title: req.title
    }));
  }, []);

  const selectedReq = requirements.find(r => r.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal h-auto min-h-[36px] py-1",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex flex-col gap-0.5 truncate">
            {selectedReq ? (
              <>
                <span className="text-xs font-semibold text-foreground truncate">{selectedReq.title}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{selectedReq.reqId}</span>
              </>
            ) : (
              <span className="text-xs">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search requirement..." className="h-9" />
          <CommandList>
            <CommandEmpty>No requirement found.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {requirements.map((req) => (
                <CommandItem
                  key={req.id}
                  value={`${req.reqId} ${req.title}`}
                  onSelect={() => {
                    onChange(req.id, req.title, req.reqId);
                    setOpen(false);
                  }}
                  className="flex items-start gap-2 py-2"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 mt-0.5",
                      value === req.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium truncate">{req.title}</span>
                    <span className="text-xs text-muted-foreground font-mono">{req.reqId}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
