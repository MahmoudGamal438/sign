import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent {
  loginEmail = signal('');
  loginPassword = signal('');
  rememberMe = signal(false);
  isLoggingIn = signal(false);
  loginAttempts = signal(0);

  // ✅ إضافة showPassword كـ signal
  showPassword = signal(false);

  // Events
  switchToSignup = output<void>();

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  handleLogin() {
    const email = this.loginEmail();
    const password = this.loginPassword();

    // Increment login attempts
    this.loginAttempts.update((attempts) => attempts + 1);

    // Validation
    if (!email || !password) {
      this.toastService.addToast('error', 'Validation Error', 'Please fill in all fields');
      this.highlightEmptyFields();
      return;
    }

    if (!this.isValidEmail(email)) {
      this.toastService.addToast('error', 'Invalid Email', 'Please enter a valid email address');
      return;
    }

    // If more than 3 failed attempts, add extra delay
    if (this.loginAttempts() > 3) {
      this.toastService.addToast(
        'warning',
        'Multiple Attempts',
        'Please wait a moment before trying again',
      );
    }

    this.isLoggingIn.set(true);

    this.authService.login({ email, password }).subscribe({
      next: (user) => {
        this.isLoggingIn.set(false);
        this.loginAttempts.set(0);
        this.toastService.addToast(
          'success',
          `Welcome back, ${user.name}!`,
          'Login successful! Redirecting...',
        );

        // Clear form
        this.loginEmail.set('');
        this.loginPassword.set('');
        this.rememberMe.set(false);
        this.showPassword.set(false); // ✅ إعادة تعيين showPassword

        // Reset login attempts
        this.loginAttempts.set(0);
      },
      error: (err) => {
        this.isLoggingIn.set(false);

        let message = 'Invalid credentials';
        if (err.status === 404) {
          message = 'User not found. Please check your email';
        } else if (err.status === 401) {
          message = 'Incorrect password. Please try again';
          if (this.loginAttempts() > 2) {
            message += ` (Attempt ${this.loginAttempts()}/5)`;
          }
        }

        this.toastService.addToast('error', 'Login Failed', message);
      },
    });
  }

  highlightEmptyFields() {
    setTimeout(() => {
      const inputs = document.querySelectorAll('.input-group input');
      inputs.forEach((input) => {
        const htmlInput = input as HTMLInputElement;
        if (!htmlInput.value?.trim()) {
          htmlInput.classList.add('error');
          setTimeout(() => {
            htmlInput.classList.remove('error');
          }, 3000);
        }
      });
    }, 0);
  }

  onSwitchToSignup() {
    this.switchToSignup.emit();
  }

  // ✅ إضافة دالة مساعدة لتغيير حالة showPassword
  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }
}
