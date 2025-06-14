import { EstimationResult } from '@/lib/types';
import { useState } from 'react';





export default function useEstimation() {
  const [estimationResult, setEstimationResult] = useState<EstimationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/estimate?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error('Failed to fetch estimation data');
      }
      const data: EstimationResult = await response.json();
      setEstimationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { estimationResult, loading, error, estimate };
}
