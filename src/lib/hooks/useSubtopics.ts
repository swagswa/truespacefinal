import { useState, useEffect, useCallback } from 'react';

interface Lesson {
  id: number;
  title: string;
  name: string;
  description: string;
  content: string;
  slug: string;
  duration: number;
  date: string;
  link?: string;
}

interface Subtopic {
  id: number;
  title: string;
  name: string;
  description: string;
  slug: string;
  lessonsCount: number;
  lessons: Lesson[];
}

interface UseSubtopicsReturn {
  subtopics: Subtopic[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSubtopics(themeSlug: string): UseSubtopicsReturn {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubtopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:1337/api/themes/${themeSlug}/subtopics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSubtopics(data.data);
      } else {
        throw new Error('Failed to fetch subtopics');
      }
    } catch (err) {
      console.error('Error fetching subtopics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [themeSlug]);

  useEffect(() => {
    if (themeSlug) {
      fetchSubtopics();
    }
  }, [themeSlug, fetchSubtopics]);

  const refetch = () => {
    fetchSubtopics();
  };

  return {
    subtopics,
    loading,
    error,
    refetch
  };
}