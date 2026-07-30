import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-welcome-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-section.component.html',
  styleUrls: ['./welcome-section.component.scss']
})
export class WelcomeSectionComponent {
  currentMode = input<'login' | 'signup'>('login');
  animation = input<string>('');

  constructor(private authService: AuthService) {}

  welcomeTitle = computed(() =>
    this.currentMode() === 'login' ? 'Welcome Back!' : 'Join Our Community!'
  );

  welcomeText = computed(() =>
    this.currentMode() === 'login'
      ? 'Sign in to continue your journey with us'
      : 'Create your account and start your journey'
  );

  welcomeQuote = computed(() =>
    this.currentMode() === 'login'
      ? 'Experience the future of digital authentication with elegance and security.'
      : 'Join thousands of satisfied users who trust ElSeady for their authentication needs.'
  );

  getAnimationClass(): string {
    const animationMap: Record<string, string> = {
      'fadeInUp': 'fade-in-up',
      'fadeOutLeft': 'fade-out-left',
      'fadeInRight': 'fade-in-right',
      'fadeOutRight': 'fade-out-right',
      'fadeInLeft': 'fade-in-left'
    };
    return animationMap[this.animation()] || '';
  }

  getStatNumber(stat: string): string {
    // Return the actual stat value
    const stats = {
      '10K+': '10000',
      '99%': '99',
      '24/7': '24'
    };
    return stats[stat as keyof typeof stats] || '0';
  }
}
