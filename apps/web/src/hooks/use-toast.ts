"use client";

interface UseToastReturn {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

export function useToast(): UseToastReturn {
  return { success, error, warning, info };
}
