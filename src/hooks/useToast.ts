import { useState, useCallback, useRef, useEffect } from 'react';

export function useToast(duration: number = 4500) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const triggerToast = useCallback((msg: string) => {
    clearTimeout(timerRef.current);
    setToastMessage(msg);
    timerRef.current = setTimeout(() => setToastMessage(null), duration);
  }, [duration]);

  return { toastMessage, triggerToast };
}
