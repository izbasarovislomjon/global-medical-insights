import { useQuery } from '@tanstack/react-query';
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

export const useJournals = () => {
  return useQuery({
    queryKey: ['journals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Journal[];
    }
  });
};

export const useJournal = (slug: string) => {
  return useQuery({
    queryKey: ['journal', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
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
      return data;
    },
    enabled: !!journalId
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
      return data;
    },
    enabled: !!issueId
  });
};
