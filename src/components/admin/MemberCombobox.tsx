import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export interface MemberOption {
  user_id: string;
  full_name: string | null;
  email: string | null;
  department?: string | null;
}

interface MemberComboboxProps {
  value: string;
  onChange: (userId: string, member?: MemberOption) => void;
  placeholder?: string;
  className?: string;
  /** 이미 선택된 회원을 목록에서 제외 */
  excludeIds?: string[];
}

/**
 * 회원 수가 많은 환경(수백~수천 명)에서 기본 Select 는 사용이 어렵기 때문에
 * 이름/이메일을 서버에서 검색해 최대 50명씩 보여주는 검색형 회원 선택 UI.
 */
const MemberCombobox = ({
  value,
  onChange,
  placeholder = "회원 검색 (이름 또는 이메일)",
  className,
  excludeIds = [],
}: MemberComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(id);
  }, [term]);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["member-combobox", debounced],
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select("user_id, full_name, email, department")
        .order("full_name")
        .limit(50);
      if (debounced) {
        q = q.or(`full_name.ilike.%${debounced}%,email.ilike.%${debounced}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data as MemberOption[]) || [];
    },
  });

  // 선택된 회원이 현재 검색 결과에 없을 수 있으므로 별도로 조회해 라벨을 유지한다.
  const { data: selected } = useQuery({
    queryKey: ["member-combobox-selected", value],
    enabled: !!value,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, department")
        .eq("user_id", value)
        .maybeSingle();
      return (data as MemberOption) || null;
    },
  });

  const visible = useMemo(
    () => options.filter((o) => !excludeIds.includes(o.user_id)),
    [options, excludeIds],
  );

  const label = selected
    ? selected.full_name || selected.email || selected.user_id.slice(0, 8)
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !label && "text-muted-foreground")}>
            {label || "회원 선택"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={placeholder}
            className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
          />
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <Command shouldFilter={false}>
          <CommandList className="max-h-64">
            <CommandEmpty>
              {debounced ? "검색 결과가 없습니다." : "이름 또는 이메일을 입력하세요."}
            </CommandEmpty>
            <CommandGroup>
              {visible.map((m) => (
                <CommandItem
                  key={m.user_id}
                  value={m.user_id}
                  onSelect={() => {
                    onChange(m.user_id, m);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === m.user_id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {m.full_name || "(이름 미등록)"}
                    <span className="ml-2 text-xs text-muted-foreground">{m.email}</span>
                  </span>
                  {m.department && (
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      {m.department}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {visible.length >= 50 && (
          <p className="border-t px-3 py-2 text-[11px] text-muted-foreground">
            상위 50명만 표시됩니다. 검색어를 더 입력해 범위를 좁혀주세요.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MemberCombobox;
