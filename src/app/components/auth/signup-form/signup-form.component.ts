import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent {
  signupName = signal('');
  signupEmail = signal('');
  signupPassword = signal('');
  signupConfirmPassword = signal('');
  agreeTerms = signal(false);
  isSigningUp = signal(false);

  // ✅ إضافة showPassword و showConfirmPassword كـ signals
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // Events
  switchToLogin = output<void>();

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePasswordStrength(password: string): { score: number; message: string } {
    let score = 0;
    const messages = [];

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, message: 'Weak password' };
    if (score <= 4) return { score, message: 'Medium password' };
    return { score, message: 'Strong password' };
  }

  handleSignup() {
    const name = this.signupName();
    const email = this.signupEmail();
    const password = this.signupPassword();
    const confirmPassword = this.signupConfirmPassword();

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      this.toastService.addToast('error', 'Validation Error', 'Please fill in all fields');
      this.highlightEmptyFields();
      return;
    }

    if (!this.isValidEmail(email)) {
      this.toastService.addToast('error', 'Invalid Email', 'Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (this.authService.userExists(email)) {
      this.toastService.addToast(
        'error',
        'Email Already Exists',
        'This email is already registered',
      );
      return;
    }

    // Validate name (at least 2 parts)
    if (name.trim().split(' ').length < 2) {
      this.toastService.addToast('error', 'Invalid Name', 'Please enter your full name');
      return;
    }

    // Password validation
    if (password.length < 6) {
      this.toastService.addToast(
        'error',
        'Weak Password',
        'Password must be at least 6 characters',
      );
      return;
    }

    const strength = this.validatePasswordStrength(password);
    if (strength.score <= 2) {
      this.toastService.addToast('warning', 'Weak Password', 'Consider using a stronger password');
    }

    if (password !== confirmPassword) {
      this.toastService.addToast('error', 'Password Mismatch', 'Passwords do not match');
      return;
    }

    if (!this.agreeTerms()) {
      this.toastService.addToast('error', 'Terms Required', 'Please agree to the Terms of Service');
      return;
    }

    this.isSigningUp.set(true);

    this.authService.signup({ name, email, password, confirmPassword }).subscribe({
      next: (user) => {
        this.isSigningUp.set(false);
        this.toastService.addToast(
          'success',
          'Account Created!',
          `Welcome ${user.name}! Please login to continue.`,
        );

        // Clear form
        this.signupName.set('');
        this.signupEmail.set('');
        this.signupPassword.set('');
        this.signupConfirmPassword.set('');
        this.agreeTerms.set(false);
        this.showPassword.set(false); // ✅ إعادة تعيين
        this.showConfirmPassword.set(false); // ✅ إعادة تعيين

        // Switch to login after delay
        setTimeout(() => {
          this.switchToLogin.emit();
        }, 2000);
      },
      error: (err) => {
        this.isSigningUp.set(false);
        let message = 'Could not create account';
        if (err.status === 409) {
          message = 'Email already registered. Please use a different email';
        } else if (err.status === 400) {
          message = err.message || 'Invalid data provided';
        }
        this.toastService.addToast('error', 'Signup Failed', message);
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

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }

  // ✅ إضافة دوال مساعدة لتغيير حالة showPassword
  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update((value) => !value);
  }
}
