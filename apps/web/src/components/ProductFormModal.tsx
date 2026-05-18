import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productCreateSchema, type ProductOutput, type ProductCreateInput } from '@legacy/shared';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import { useSuppliers } from '../hooks/useInventory';
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

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductOutput | null;
  onSuccess: () => void;
}

type FormValues = ProductCreateInput;

export function ProductFormModal({ open, onOpenChange, product, onSuccess }: ProductFormModalProps) {
  const isEdit = product !== null;
  const [formError, setFormError] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<number | undefined>(undefined);

  const suppliersQuery = useSuppliers();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const suppliers = suppliersQuery.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      price: undefined as unknown as number,
      category: '',
      supplierId: undefined,
    },
  });

  // Pre-populate form for edit mode
  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku,
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        category: product.category ?? '',
        supplierId: product.supplierId ?? undefined,
      });
    } else {
      reset({
        sku: '',
        name: '',
        description: '',
        price: undefined as unknown as number,
        category: '',
        supplierId: undefined,
      });
    }
    setFormError(null);
  }, [product, reset]);

  const submitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  // Sync mutation error to formError
  useEffect(() => {
    if (mutationError) {
      if (mutationError instanceof Error && 'response' in mutationError) {
        const axiosErr = mutationError as unknown as { response?: { data?: { error?: string; errors?: Record<string, string> } } };
        if (axiosErr.response?.data?.errors) {
          for (const [field, message] of Object.entries(axiosErr.response.data.errors)) {
            setError(field as keyof FormValues, { message: message as string });
          }
        } else {
          setFormError(axiosErr.response?.data?.error || 'An unexpected error occurred');
        }
      } else {
        setFormError('Network error. Please try again.');
      }
    }
  }, [mutationError, setError]);

  const onSubmit = async (data: FormValues) => {
    setFormError(null);
    // Clean up empty strings to null/undefined
    const cleanData = {
      ...data,
      description: data.description || undefined,
      category: data.category || undefined,
      supplierId: data.supplierId || undefined,
      price: Number(data.price),
    };

    if (isEdit && product) {
      updateMutation.mutate(
        { id: product.id, input: cleanData },
        { onSuccess },
      );
    } else {
      createMutation.mutate(cleanData, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'New Product'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the product details below.' : 'Fill in the details to create a new product.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input id="sku" {...register('sku')} placeholder="e.g. WIDGET-001" />
            {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name')} placeholder="Product name" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Optional description" />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price *</Label>
              <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="0.00" />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register('category')} placeholder="e.g. Electronics" />
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="supplierId">Supplier</Label>
            <Select
              value={supplierId ? String(supplierId) : ''}
              onValueChange={(val) => {
                const num = val ? Number(val) : undefined;
                setSupplierId(num);
                setValue('supplierId', num);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.supplierId && <p className="text-xs text-destructive">{errors.supplierId.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}