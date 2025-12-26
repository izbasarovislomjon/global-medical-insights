import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Journal {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  issn: string;
  impact_factor: string | null;
  frequency: string | null;
  image_url: string | null;
  slug: string;
  editor_in_chief: string | null;
  scope: string | null;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  journal_id: string;
  volume: number;
  issue_number: number;
  year: number;
  month: string | null;
  is_current: boolean;
  published_at: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  issue_id: string;
  title: string;
  abstract: string | null;
  keywords: string[] | null;
  authors: { name: string; affiliation: string; email: string }[];
  pdf_url: string | null;
  doi: string | null;
  pages: string | null;
  published_at: string;
  views: number;
  downloads: number;
  created_at: string;
}

export const useJournals = () => {
  return useQuery({
    queryKey: ['journals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('journals').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data as Journal[];
    }
  });
};

export const useJournal = (slug: string) => {
  return useQuery({
    queryKey: ['journal', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('journals').select('*').eq('slug', slug).maybeSingle();
      if (error) throw error;
      return data as Journal | null;
    },
    enabled: !!slug
  });
};

export const useJournalIssues = (journalId: string) => {
  return useQuery({
    queryKey: ['journal-issues', journalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('journal_id', journalId)
        .order('year', { ascending: false })
        .order('issue_number', { ascending: false });
      if (error) throw error;
      return data as Issue[];
    },
    enabled: !!journalId
  });
};

export const useAllIssues = () => {
  return useQuery({
    queryKey: ['all-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select(`*, journals (title, slug)`)
        .order('year', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
};

export const useIssueArticles = (issueId: string) => {
  return useQuery({
    queryKey: ['issue-articles', issueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Article[];
    },
    enabled: !!issueId
  });
};

export const useAllArticles = () => {
  return useQuery({
    queryKey: ['all-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`*, issues (volume, issue_number, year, journals (title))`)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });
};

// Mutations
export const useCreateJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (journal: Omit<Journal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('journals').insert(journal).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journals'] })
  });
};

export const useUpdateJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...journal }: Partial<Journal> & { id: string }) => {
      const { data, error } = await supabase.from('journals').update(journal).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journals'] })
  });
};

export const useDeleteJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('journals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journals'] })
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (issue: Omit<Issue, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('issues').insert(issue).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      queryClient.invalidateQueries({ queryKey: ['journal-issues'] });
    }
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...issue }: Partial<Issue> & { id: string }) => {
      const { data, error } = await supabase.from('issues').update(issue).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      queryClient.invalidateQueries({ queryKey: ['journal-issues'] });
    }
  });
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('issues').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      queryClient.invalidateQueries({ queryKey: ['journal-issues'] });
    }
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (article: Omit<Article, 'id' | 'created_at' | 'views' | 'downloads'>) => {
      const { data, error } = await supabase.from('articles').insert(article).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-articles'] });
      queryClient.invalidateQueries({ queryKey: ['issue-articles'] });
    }
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...article }: Partial<Article> & { id: string }) => {
      const { data, error } = await supabase.from('articles').update(article).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-articles'] });
      queryClient.invalidateQueries({ queryKey: ['issue-articles'] });
    }
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-articles'] });
      queryClient.invalidateQueries({ queryKey: ['issue-articles'] });
    }
  });
};
