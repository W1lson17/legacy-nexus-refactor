import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inventoryAdjustSchema, type InventoryAdjustInput } from '@legacy/shared';
import type { InventoryItem } from '../api/inventory';
import { useAdjustStock } from '../hooks/useInventory';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';

interface StockAdjustModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
  onSuccess: () => void;
}

const MOVEMENT_TYPES = [
  { value: 'IN', label: 'IN — Stock Received' },
  { value: 'OUT', label: 'OUT — Stock Shipped' },
  { value: 'ADJUST', label: 'ADJUST — Correction' },
  { value: 'SALE', label: 'SALE — Sold' },
  { value: 'PURCHASE', label: 'PURCHASE — Purchased' },
  { value: 'RETURN', label: 'RETURN — Customer Return' },
] as const;

type FormValues = Omit<InventoryAdjustInput, 'productId' | 'warehouseId'> & {
  type: string;
  qty: number;
};

export function StockAdjustModal({ open, onOpenChange, item, onSuccess }: StockAdjustModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const adjustMutation = useAdjustStock();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      inventoryAdjustSchema.pick({ qty: true, type: true, refId: true }),
    ),
    defaultValues: {
      type: 'IN',
      qty: 1,
      refId: undefined as unknown as number | undefined,
    },
  });

  // Reset form when item changes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset({ type: 'IN', qty: 1, refId: undefined as unknown as number | undefined });
      setFormError(null);
    }
    onOpenChange(newOpen);
  };

  const onSubmit = async (data: FormValues) => {
    setFormError(null);
    adjustMutation.mutate(
      {
        productId: item.product.id,
        warehouseId: item.warehouse.id,
        qty: Number(data.qty),
        type: data.type as InventoryAdjustInput['type'],
        refId: data.refId ? Number(data.refId) : undefined,
      },
      {
        onSuccess,
        onError: (err) => {
          if (err && typeof err === 'object' && 'response' in err) {
            const axiosErr = err as unknown as { response?: { data?: { error?: string } } };
            setFormError(axiosErr.response?.data?.error || 'An unexpected error occurred');
          } else {
            setFormError('Network error. Please try again.');
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Adjust stock for <strong>{item.product.name}</strong> ({item.product.sku}) at{' '}
            <strong>{item.warehouse.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Current stock: </span>
          <span className="font-semibold">{item.quantity}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="adjust-type">Type *</Label>
            <Select
              defaultValue="IN"
              onValueChange={(val) => { if (val) setValue('type', val as FormValues['type']); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {MOVEMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="qty">Quantity *</Label>
            <Input id="qty" type="number" min={1} {...register('qty', { valueAsNumber: true })} placeholder="1" />
            {errors.qty && <p className="text-xs text-destructive">{errors.qty.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="refId">Reference ID</Label>
            <Input id="refId" type="number" {...register('refId', { valueAsNumber: true })} placeholder="Optional" />
            {errors.refId && <p className="text-xs text-destructive">{errors.refId.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={adjustMutation.isPending}>
              {adjustMutation.isPending ? 'Adjusting...' : 'Adjust'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}