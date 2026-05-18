import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { useInventory, useWarehouses } from '../hooks/useInventory';
import type { InventoryItem } from '../api/inventory';
import { StockAdjustModal } from '../components/StockAdjustModal';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [warehouseFilter, setWarehouseFilter] = useState<string>('');
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);

  // Modal state
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

  // Data queries
  const inventoryQuery = useInventory(page, limit, warehouseFilter ? Number(warehouseFilter) : undefined);
  const warehousesQuery = useWarehouses();

  const items = inventoryQuery.data?.items ?? [];
  const total = inventoryQuery.data?.total ?? 0;
  const totalPages = inventoryQuery.data?.totalPages ?? 1;
  const warehouses = warehousesQuery.data ?? [];
  const loading = inventoryQuery.isLoading;
  const error = inventoryQuery.error?.message ?? null;

  // Columns
  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => {
      const base: ColumnDef<InventoryItem>[] = [
        {
          accessorKey: 'product',
          header: 'Product',
          cell: ({ row }) => (
            <span className="font-medium">{row.original.product.name}</span>
          ),
        },
        {
          id: 'sku',
          header: 'SKU',
          cell: ({ row }) => (
            <Badge variant="outline">{row.original.product.sku}</Badge>
          ),
        },
        {
          accessorKey: 'warehouse',
          header: 'Warehouse',
          cell: ({ row }) => {
            const w = row.original.warehouse;
            return (
              <span>
                {w.name}
                {w.region && <span className="text-muted-foreground"> ({w.region})</span>}
              </span>
            );
          },
        },
        {
          accessorKey: 'quantity',
          header: 'Quantity',
          cell: ({ row }) => {
            const qty = row.original.quantity;
            return (
              <span className={qty <= 0 ? 'text-destructive font-medium' : ''}>
                {qty}
              </span>
            );
          },
        },
      ];

      if (isAdmin) {
        base.push({
          id: 'actions',
          header: '',
          cell: ({ row }) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAdjustItem(row.original);
                setAdjustOpen(true);
              }}
            >
              Adjust Stock
            </Button>
          ),
        });
      }

      return base;
    },
    [isAdmin],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Loading skeletons
  if (loading && items.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <Alert variant="destructive">
          <AlertTitle>Error loading inventory</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => inventoryQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="size-6" />
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={warehouseFilter}
          onValueChange={(val) => {
            setWarehouseFilter(val === '__all__' ? '' : (val ?? ''));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="__all__">All warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={String(w.id)}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Data table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={columns.length}>
                  No inventory data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page} of {totalPages} · {total} total
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(val) => {
              setLimit(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(1)}
          >
            {'\u00AB'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            {'\u00BB'}
          </Button>
        </div>
      </div>

      {/* Stock Adjust Modal */}
      {adjustItem && (
        <StockAdjustModal
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
          item={adjustItem}
          onSuccess={() => {
            setAdjustOpen(false);
            setAdjustItem(null);
          }}
        />
      )}
    </div>
  );
}