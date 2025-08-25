import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  user_id: string;
  username?: string | null;
  display_name?: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchProfiles = async () => {
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    // Only admins can view all profiles
    if (profile?.role !== 'admin' || profile?.status !== 'approved') {
      setProfiles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user profiles.",
        });
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch user profiles.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update profile.",
        });
        return null;
      }

      // Refresh profiles list
      fetchProfiles();
      
      toast({
        title: "Profile updated",
        description: "User profile has been successfully updated.",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile.",
      });
      return null;
    }
  };

  const deleteProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete profile.",
        });
        return false;
      }

      // Refresh profiles list
      fetchProfiles();
      
      toast({
        title: "Profile deleted",
        description: "User profile has been successfully deleted.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete profile.",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user, profile]);

  return {
    profiles,
    loading,
    fetchProfiles,
    updateProfile,
    deleteProfile,
  };
};