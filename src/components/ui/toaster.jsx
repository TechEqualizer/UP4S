import React from 'react';
import { Toaster as Sonner } from 'sonner';

// App-wide toast notifications. Trigger with: import { toast } from 'sonner'
export function Toaster() {
  return <Sonner position="top-right" richColors closeButton />;
}
