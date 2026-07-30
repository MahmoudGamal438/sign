import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { User, LoginCredentials, SignupData } from '../models/user.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private usersSignal = signal<User[]>([
    {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: '123456',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Mahmoud ElSeady',
      email: 'elseady@example.com',
      password: '123456',
      createdAt: new Date('2024-06-15')
    }
  ]);

  // Computed signals
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  currentUser = this.currentUserSignal.asReadonly();

  constructor(private toastService: ToastService) {
    // Check localStorage on init
    effect(() => {
      const user = this.currentUserSignal();
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    });

    // Try to restore session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Don't restore if last login was more than 24 hours ago
        if (user.lastLogin && new Date(user.lastLogin).getTime() > Date.now() - 86400000) {
          this.currentUserSignal.set(user);
        } else {
          localStorage.removeItem('currentUser');
        }
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    const { email, password } = credentials;

    // Simulate network delay
    return new Observable<User>(observer => {
      setTimeout(() => {
        const user = this.usersSignal().find(u => u.email === email);

        if (!user) {
          observer.error({ status: 404, message: 'User not found' });
          return;
        }

        if (user.password !== password) {
          observer.error({ status: 401, message: 'Invalid password' });
          return;
        }

        // Update user with login info
        const loggedInUser = {
          ...user,
          lastLogin: new Date()
        };
        delete loggedInUser.password;

        // Update users list
        this.usersSignal.update(users =>
          users.map(u => u.id === user.id ? { ...u, lastLogin: new Date() } : u)
        );

        this.currentUserSignal.set(loggedInUser);

        observer.next(loggedInUser);
        observer.complete();
      }, 1200 + Math.random() * 600); // Random delay 1.2-1.8s
    });
  }

  signup(data: SignupData): Observable<User> {
    const { name, email, password } = data;

    return new Observable<User>(observer => {
      setTimeout(() => {
        // Check if email already exists
        if (this.usersSignal().some(u => u.email === email)) {
          observer.error({ status: 409, message: 'Email already registered' });
          return;
        }

        // Validate name (at least 2 parts)
        if (!name.trim() || name.trim().split(' ').length < 2) {
          observer.error({ status: 400, message: 'Please enter your full name' });
          return;
        }

        // Validate password strength
        if (password.length < 6) {
          observer.error({ status: 400, message: 'Password must be at least 6 characters' });
          return;
        }

        const newUser: User = {
          id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password,
          createdAt: new Date()
        };

        this.usersSignal.update(users => [...users, newUser]);

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        observer.next(userWithoutPassword as User);
        observer.complete();
      }, 1500 + Math.random() * 500); // Random delay 1.5-2s
    });
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
    this.toastService.addToast('info', 'Logged Out', 'You have been successfully logged out');
  }

  // Helper method for demo purposes
  getAllUsers(): Observable<User[]> {
    return of(this.usersSignal().map(({ password, ...user }) => user as User))
      .pipe(delay(300));
  }

  // Check if a user exists (for validation)
  userExists(email: string): boolean {
    return this.usersSignal().some(u => u.email === email.toLowerCase().trim());
  }
}
