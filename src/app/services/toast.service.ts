import { Injectable, signal, effect } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private idCounter = 0;

  getToasts() {
    return this.toasts.asReadonly();
  }

  addToast(type: Toast['type'], title: string, message: string, duration?: number) {
    const id = `toast-${++this.idCounter}-${Date.now()}`;
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration: duration || this.getRandomDuration()
    };

    this.toasts.update(toasts => [...toasts, toast]);

    // Auto remove after duration
    setTimeout(() => {
      this.removeToast(id);
    }, toast.duration);

    return id;
  }

  removeToast(id: string) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clearAll() {
    this.toasts.set([]);
  }

  private getRandomDuration(): number {
    // Random duration between 2500ms and 4000ms
    return Math.floor(Math.random() * 1500) + 2500;
  }
}
