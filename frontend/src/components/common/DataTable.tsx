import { cn, formatDate, formatDateTime } from "@/lib/utils/cn";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index?: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({ data, columns, keyExtractor, onRowClick, className }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]", className)}>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 text-[11px]">
            {columns.map((col) => (
              <th key={col.key} className={cn("px-5 py-3.5 text-left font-bold text-slate-600", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              className={cn(
                "transition-colors hover:bg-purple-50/30 text-slate-700 font-medium",
                onRowClick && "cursor-pointer",
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-5 py-3.5 text-xs text-slate-700", col.className)}>
                  {col.render
                    ? col.render(item, index)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { formatDate, formatDateTime };

