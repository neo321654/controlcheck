
import { useState, useEffect } from 'react';

// Custom hook to read and write from localStorage
export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            // We need a way to handle files, which can't be stored in JSON.
            // For this app's purpose, we won't persist the file objects themselves,
            // only the rest of the form data. The hook is more general.
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            // We filter out File objects because they can't be stringified.
            const valueToStore = JSON.stringify(storedValue, (k, v) => {
                if (typeof v === 'object' && v !== null && v.constructor.name === 'File') {
                    return null; // Don't store files in localStorage
                }
                return v;
            });
            window.localStorage.setItem(key, valueToStore);
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
