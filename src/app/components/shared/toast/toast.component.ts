import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  toast = input.required<Toast>();
  onClose = output<string>();

  getIcon(): string {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    return icons[this.toast().type] || 'fa-info-circle';
  }

  getColor(): string {
    const colors = {
      success: '#48bb78',
      error: '#fc8181',
      warning: '#ed8936',
      info: '#4299e1'
    };
    return colors[this.toast().type] || '#718096';
  }

  close() {
    this.onClose.emit(this.toast().id);
  }
}
