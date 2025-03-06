import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message = '';
  @Input() autoClose = true;
  isVisible = signal(true);

  ngOnInit() {
    if (this.autoClose) {
      setTimeout(() => this.isVisible.set(false), 3000);
    }
  }

  closeAlert() {
    this.isVisible.set(false);
  }
}
