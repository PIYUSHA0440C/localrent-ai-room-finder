import { useEffect, useRef, useState } from 'react';

// Debounce hook for search inputs
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Polling hook for notifications
export const usePolling = (callback, interval = 30000, enabled = true) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => savedCallback.current();
    tick(); // Run immediately
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
};

// Outside click hook for dropdowns
export const useOutsideClick = (callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
};
