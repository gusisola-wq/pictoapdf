import { useState, useCallback } from 'react';

export function useToast(duration: number = 4500) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  }, [duration]);

  return { toastMessage, triggerToast };
}
