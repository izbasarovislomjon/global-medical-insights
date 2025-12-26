import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Submission {
  id: string;
  user_id: string;
  journal_id: string;
  title: string;
  abstract: string | null;
  keywords: string[] | null;
  authors: { name: string; affiliation: string; email: string }[];
  manuscript_url: string | null;
  supplementary_files: { name: string; url: string }[];
  status: 'pending' | 'under_review' | 'revision_required' | 'accepted' | 'rejected' | 'published';
  editor_notes: string | null;
  submitted_at: string;
  updated_at: string;
}

export const useMySubmissions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-submissions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          journals (title, slug)
        `)
        .eq('user_id', user!.id)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useAllSubmissions = () => {
  return useQuery({
    queryKey: ['all-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          journals (title, slug),
          profiles (full_name, email)
        `)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (submission: {
      journal_id: string;
      title: string;
      abstract: string;
      keywords: string[];
      authors: { name: string; affiliation: string; email: string }[];
    }) => {
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          ...submission,
          user_id: user!.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
    }
  });
};

export const useUpdateSubmissionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, editor_notes }: { 
      id: string; 
      status: Submission['status']; 
      editor_notes?: string 
    }) => {
      const { data, error } = await supabase
        .from('submissions')
        .update({ status, editor_notes })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
    }
  });
};
