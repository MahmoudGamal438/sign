import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service';
import { LoginFormComponent } from './components/auth/login-form/login-form.component';
import { SignupFormComponent } from './components/auth/signup-form/signup-form.component';
import { WelcomeSectionComponent } from './components/auth/welcome-section/welcome-section.component';
import { ToastComponent } from './components/shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoginFormComponent,
    SignupFormComponent,
    WelcomeSectionComponent,
    ToastComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  currentMode = signal<'login' | 'signup'>('login');
  welcomeAnimation = signal('');
  formAnimation = signal('');
  showLoginForm = signal(true);
  showSignupForm = signal(false);

  // Computed signal for toasts
  toasts = computed(() => this.toastService.getToasts()());

  constructor(
    public authService: AuthService,
    public toastService: ToastService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.welcomeAnimation.set('fadeInUp');
    }, 100);
  }

  switchToSignup() {
    if (this.currentMode() === 'signup') return;

    this.currentMode.set('signup');
    this.welcomeAnimation.set('fadeOutLeft');
    this.formAnimation.set('slideOut');

    setTimeout(() => {
      this.showLoginForm.set(false);
      this.showSignupForm.set(true);

      setTimeout(() => {
        this.welcomeAnimation.set('fadeInRight');
        this.formAnimation.set('slideIn');
      }, 50);
    }, 300);
  }

  switchToLogin() {
    if (this.currentMode() === 'login') return;

    this.currentMode.set('login');
    this.welcomeAnimation.set('fadeOutRight');
    this.formAnimation.set('slideOut');

    setTimeout(() => {
      this.showSignupForm.set(false);
      this.showLoginForm.set(true);

      setTimeout(() => {
        this.welcomeAnimation.set('fadeInLeft');
        this.formAnimation.set('slideIn');
      }, 50);
    }, 300);
  }

  getAnimationClass(animation: string): string {
    const animations: Record<string, string> = {
      fadeInUp: 'fade-in-up',
      fadeOutLeft: 'fade-out-left',
      fadeInRight: 'fade-in-right',
      fadeOutRight: 'fade-out-right',
      fadeInLeft: 'fade-in-left',
      slideIn: 'slide-in',
      slideOut: 'slide-out'
    };
    return animations[animation] || '';
  }
}
