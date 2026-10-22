
import { Injectable } from '@angular/core';

export interface LoggedInUser {
  username: string;
  email: string;
  timestamp: number;
}

export interface Permissions {
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export type UserRole = 'admin' | 'user';

export interface RegisteredUser {
  username: string;
  email: string;
  role: UserRole;
  permissions: Permissions;
}

export interface storedUser extends RegisteredUser {
  password: string;
}

const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@company.com';
const ADMIN_PASSWORD = 'Admin@123';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usersKey = 'users';
  private readonly sessionKey = 'session';
  private readonly sessionTime = 1 * 60 * 1000;

  private getUsers(): storedUser[] {
    try {
      const data = localStorage.getItem(this.usersKey);
      const users = JSON.parse(data || '[]');

      return this.ensureAdmin(Array.isArray(users) ? users : []);
    } catch {
      return this.ensureAdmin([]);
    }
  }

  // Makes sure the default admin account exists.
  private ensureAdmin(users: storedUser[]): storedUser[] {
    const hasAdmin = users.some((user) => user.role === 'admin');

    if (!hasAdmin) {
      users.push({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        permissions: { add: true, edit: true, delete: true },
      });
      this.saveUsers(users);
    }

    return users;
  }

  private saveUsers(users: storedUser[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  register(
    username: string,
    email: string,
    password: string,
  ): boolean {
    const users = this.getUsers();

    const existingUser = users.some(
      (user) =>
        typeof user.email === 'string' &&
        user.email.toLowerCase() === email.toLowerCase(),
    );

    if (existingUser) {
      return false;
    }

    users.push({
      username,
      email,
      password,
      role: 'user',
      permissions: { add: false, edit: false, delete: false },
    });

    this.saveUsers(users);

    return true;
  }

  login(email: string, password: string): boolean {
    const user = this.getUsers().find(
      (user) =>
        typeof user.email === 'string' &&
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password,
    );

    if (!user) {
      return false;
    }

    const session: LoggedInUser = {
      username: user.username,
      email: user.email,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(
      this.sessionKey,
      JSON.stringify(session),
    );

    return true;
  }

  // Runs once during Angular application initialization.
  initializeSession(): void {
    this.getCurrentUser();
  }

  getCurrentUser(): LoggedInUser | null {
    const data = sessionStorage.getItem(this.sessionKey);

    if (!data) {
      return null;
    }

    try {
      const session: LoggedInUser = JSON.parse(data);

      const invalidSession =
        !session ||
        typeof session.username !== 'string' ||
        !session.username.trim() ||
        typeof session.email !== 'string' ||
        !session.email.trim() ||
        typeof session.timestamp !== 'number' ||
        !Number.isFinite(session.timestamp) ||
        session.timestamp <= 0 ||
        Date.now() - session.timestamp >= this.sessionTime;

      if (invalidSession) {
        this.logout();
        return null;
      }

      return session;
    } catch {
      this.logout();
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // ---------- Access management ----------

  private getCurrentUserRecord(): storedUser | null {
    const session = this.getCurrentUser();

    if (!session) {
      return null;
    }

    return (
      this.getUsers().find(
        (user) =>
          typeof user.email === 'string' &&
          user.email.toLowerCase() === session.email.toLowerCase(),
      ) ?? null
    );
  }

  isAdmin(): boolean {
    return this.getCurrentUserRecord()?.role === 'admin';
  }

  // Admin can always do everything; other users need the permission.
  hasPermission(action: keyof Permissions): boolean {
    const user = this.getCurrentUserRecord();

    if (!user) {
      return false;
    }

    return user.role === 'admin' || user.permissions?.[action] === true;
  }

  // Registered non-admin users (admin's access cannot be changed).
  getManageableUsers(): RegisteredUser[] {
    return this.getUsers()
      .filter((user) => user.role !== 'admin')
      .map((user) => ({
        username: user.username,
        email: user.email,
        role: 'user' as UserRole,
        permissions: {
          add: user.permissions?.add === true,
          edit: user.permissions?.edit === true,
          delete: user.permissions?.delete === true,
        },
      }));
  }

  updatePermissions(email: string, permissions: Permissions): void {
    if (!this.isAdmin()) {
      return;
    }

    const users = this.getUsers();
    const user = users.find(
      (u) =>
        typeof u.email === 'string' &&
        u.email.toLowerCase() === email.toLowerCase() &&
        u.role !== 'admin',
    );

    if (!user) {
      return;
    }

    user.permissions = { ...permissions };
    this.saveUsers(users);
  }

  logout(): void {
    sessionStorage.removeItem(this.sessionKey);
  }
}
