import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_size?: number | null;
  file_type?: string | null;
  upload_date: string;
  processing_status: string;
  ocr_confidence?: number | null;
  extracted_text?: string | null;
  document_type?: string | null;
  is_shipping_label?: boolean | null;
  tracking_number?: string | null;
  origin_address?: any;
  destination_address?: any;
  processing_message?: string | null;
  created_at: string;
  updated_at: string;
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from('documents').select('*');

      // If user is admin and approved, they can see all documents
      if (profile?.role === 'admin' && profile?.status === 'approved') {
        // Admin sees all documents
      } else {
        // Regular users see only their own documents
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch documents.",
        });
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch documents.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (documentData: Partial<Document>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to upload documents.",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{ 
          filename: documentData.filename || '',
          user_id: user.id,
          ...documentData 
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create document record.",
        });
        return null;
      }

      // Refresh documents list
      fetchDocuments();
      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create document record.",
      });
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating document:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update document.",
        });
        return null;
      }

      // Refresh documents list
      fetchDocuments();
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update document.",
      });
      return null;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete document.",
        });
        return false;
      }

      // Refresh documents list
      fetchDocuments();
      toast({
        title: "Document deleted",
        description: "Document has been successfully deleted.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document.",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user, profile]);

  return {
    documents,
    loading,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
};