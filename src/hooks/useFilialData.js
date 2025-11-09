import { useState, useEffect } from 'react';
import { getFilialByUserPhone } from '../action/filial';

export const useFilialData = (role, userPhone) => {
  const [filialData, setFilialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFilialData = async () => {
      if (role !== 'filial') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getFilialByUserPhone(userPhone);
        if (data?.filialText) {
          setFilialData(data);
        }
      } catch (err) {
        setError(err);
        console.error('Error loading filial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilialData();
  }, [role, userPhone]);

  return { filialData, isLoading, error };
};