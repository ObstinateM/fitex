import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authedFetch } from './api-client';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const queryKeys = {
  template: ['template'] as const,
  pdfUsage: ['pdf-usage'] as const,
  creditBalance: ['credit-balance'] as const,
  billingData: ['billing-data'] as const,
  stories: ['stories'] as const,
  images: ['images'] as const,
  generationHistory: ['generation-history'] as const,
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CvTemplate {
  id: string;
  tex: string;
  filename?: string;
  updatedAt: string;
}

export interface PdfUsage {
  used: number;
  limit: number;
}

export interface CreditBalance {
  balance: number;
  isUnlimited: boolean;
  unlimitedExpiresAt: string | null;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  productType: string;
  creditsAdded: number | null;
  invoiceUrl: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  stripeSubscriptionId: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CvImage {
  id: string;
  originalFilename: string;
  label: string | null;
  url: string;
  createdAt: string;
}

export interface GenerationHistoryEntry {
  id: string;
  jobDescription: string;
  atsKeywords: string[];
  storyIds: string[];
  matchScore: number | null;
  adjustmentComment: string | null;
  createdAt: string;
}

export interface GenerationHistoryEntryFull extends GenerationHistoryEntry {
  tex: string;
}

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useTemplate(enabled = true) {
  return useQuery({
    queryKey: queryKeys.template,
    queryFn: async (): Promise<CvTemplate | null> => {
      const res = await authedFetch('/cv/template');
      if (!res.ok) return null;
      return res.json();
    },
    enabled,
  });
}

export function usePdfUsage(enabled = true) {
  return useQuery({
    queryKey: queryKeys.pdfUsage,
    queryFn: async (): Promise<PdfUsage> => {
      const res = await authedFetch('/cv/pdf-usage');
      if (!res.ok) throw new Error('Failed to fetch PDF usage');
      return res.json();
    },
    enabled,
  });
}

export function useCreditBalance(enabled = true) {
  return useQuery({
    queryKey: queryKeys.creditBalance,
    queryFn: async (): Promise<CreditBalance> => {
      const res = await authedFetch('/credits/balance');
      if (!res.ok) throw new Error('Failed to fetch credit balance');
      return res.json();
    },
    enabled,
  });
}

export function useBillingData(enabled = true) {
  return useQuery({
    queryKey: queryKeys.billingData,
    queryFn: async () => {
      const [bal, pays, subscription] = await Promise.all([
        authedFetch('/credits/balance').then((r) => r.json()),
        authedFetch('/stripe/invoices').then((r) => r.json()).catch(() => []),
        authedFetch('/stripe/subscription').then((r) => r.json()).catch(() => null),
      ]);
      return {
        balance: bal as CreditBalance,
        payments: pays as Payment[],
        subscription: subscription as Subscription | null,
      };
    },
    enabled,
  });
}

export function useStories(enabled = true) {
  return useQuery({
    queryKey: queryKeys.stories,
    queryFn: async (): Promise<Story[]> => {
      const res = await authedFetch('/stories');
      if (!res.ok) throw new Error('Failed to fetch stories');
      return res.json();
    },
    enabled,
  });
}

export function useImages() {
  return useQuery({
    queryKey: queryKeys.images,
    queryFn: async (): Promise<CvImage[]> => {
      const res = await authedFetch('/image');
      if (!res.ok) return [];
      return res.json();
    },
  });
}

export function useGenerationHistory() {
  return useQuery({
    queryKey: queryKeys.generationHistory,
    queryFn: async (): Promise<GenerationHistoryEntry[]> => {
      const res = await authedFetch('/cv/history');
      if (!res.ok) throw new Error('Failed to fetch generation history');
      return res.json();
    },
  });
}

export function useGenerationHistoryEntry(id: string | null) {
  return useQuery({
    queryKey: [...queryKeys.generationHistory, id],
    queryFn: async (): Promise<GenerationHistoryEntryFull> => {
      const res = await authedFetch(`/cv/history/${id}`);
      if (!res.ok) throw new Error('Failed to fetch history entry');
      return res.json();
    },
    enabled: !!id,
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useAddStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (story: { title: string; description: string; tags: string[] }) => {
      const res = await authedFetch('/stories', {
        method: 'POST',
        body: JSON.stringify(story),
      });
      if (!res.ok) throw new Error('Failed to add story');
      return res.json() as Promise<Story>;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Story[]>(queryKeys.stories, (old) =>
        old ? [created, ...old] : [created],
      );
    },
  });
}

export function useUpdateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title: string; description: string; tags: string[] }) => {
      const res = await authedFetch(`/stories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update story');
      return res.json() as Promise<Story>;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Story[]>(queryKeys.stories, (old) =>
        old ? old.map((s) => (s.id === updated.id ? updated : s)) : [],
      );
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authedFetch(`/stories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete story');
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Story[]>(queryKeys.stories, (old) =>
        old ? old.filter((s) => s.id !== id) : [],
      );
    },
  });
}

export function useEnhanceStory() {
  return useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await authedFetch('/stories/enhance', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Enhancement failed');
      return res.json() as Promise<{ description: string; tags: string[] }>;
    },
  });
}

export function useParseImport() {
  return useMutation({
    mutationFn: async (rawText: string) => {
      const res = await authedFetch('/stories/import', {
        method: 'POST',
        body: JSON.stringify({ rawText }),
      });
      if (!res.ok) throw new Error('Failed to parse');
      return res.json() as Promise<Array<{ title: string; description: string; tags: string[] }>>;
    },
  });
}

export function useBulkImportStories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stories: Array<{ title: string; description: string; tags: string[] }>) => {
      const res = await authedFetch('/stories/bulk', {
        method: 'POST',
        body: JSON.stringify({ stories }),
      });
      if (!res.ok) throw new Error('Failed to import');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories });
    },
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await authedFetch('/image/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `Failed to upload ${file.name}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.images });
    },
  });
}

export function useRenameImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      const res = await authedFetch(`/image/${id}/rename`, {
        method: 'PATCH',
        body: JSON.stringify({ filename }),
      });
      if (!res.ok) throw new Error('Failed to rename image');
      return res.json() as Promise<CvImage>;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<CvImage[]>(queryKeys.images, (old) =>
        old ? old.map((img) => (img.id === updated.id ? { ...img, originalFilename: updated.originalFilename } : img)) : [],
      );
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await authedFetch(`/image/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete image');
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<CvImage[]>(queryKeys.images, (old) =>
        old ? old.filter((img) => img.id !== id) : [],
      );
    },
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (priceType: 'starter' | 'pro' | 'unlimited') => {
      const res = await authedFetch('/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ priceType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Checkout request failed');
      }
      return res.json() as Promise<{ clientSecret: string }>;
    },
  });
}

export function usePortalSession() {
  return useMutation({
    mutationFn: async () => {
      const res = await authedFetch('/stripe/portal', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to open billing portal');
      return res.json() as Promise<{ url: string }>;
    },
  });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { tex: string; filename?: string }) => {
      const res = await authedFetch('/cv/template', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save template');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.template });
    },
  });
}

export function useCompileRaw() {
  return useMutation({
    mutationFn: async (data: { tex: string; includeImages?: boolean }) => {
      const res = await authedFetch('/cv/compile-raw', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Could not generate preview');
      return res.blob();
    },
  });
}

export function useConvertPdf() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('pdf', file);
      const res = await authedFetch('/cv/convert-pdf', {
        method: 'POST',
        body: formData,
      });
      if (res.status === 422) throw new Error('AI could not produce valid LaTeX. Try regenerating or use a different file.');
      if (res.status === 429) throw new Error('Monthly limit reached (5/month).');
      if (!res.ok) throw new Error('Conversion failed. Please try again.');
      return res.json() as Promise<{ tex: string }>;
    },
  });
}

export function useCompilePdf() {
  return useMutation({
    mutationFn: async () => {
      const res = await authedFetch('/cv/compile', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Compilation failed. Check your LaTeX source.');
      }
      return res.blob();
    },
  });
}
