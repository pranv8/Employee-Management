import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('persists registered credentials and stores the current user with a timestamp', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000);
    expect(
      service.register('Taylor', 'taylor@example.com', 'Taylor@123'),
    ).toBe(true);

    expect(
      JSON.parse(localStorage.getItem('employee-management:registered-users')!),
    ).toEqual([
      {
        username: 'Taylor',
        email: 'taylor@example.com',
        password: 'Taylor@123',
      },
    ]);
    expect(service.login('taylor@example.com', 'Taylor@123')).toBe(true);

    expect(
      JSON.parse(localStorage.getItem('employee-management:logged-in-users')!),
    ).toEqual([
      {
        username: 'Taylor',
        email: 'taylor@example.com',
        lastLoginAt: 1_000,
      },
    ]);
    expect(
      JSON.parse(sessionStorage.getItem('employee-management:current-session')!),
    ).toEqual({
      username: 'Taylor',
      email: 'taylor@example.com',
      loginTimestamp: 1_000,
    });
    expect(service.isLoggedIn()).toBe(true);
    vi.restoreAllMocks();
  });

  it('restores a session on refresh before ten minutes and expires it at ten minutes', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_000);
    service.register('Taylor', 'taylor@example.com', 'Taylor@123');
    service.login('taylor@example.com', 'Taylor@123');

    nowSpy.mockReturnValue(600_999);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);

    expect(service.isLoggedIn()).toBe(true);

    nowSpy.mockReturnValue(601_000);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);

    expect(service.isLoggedIn()).toBe(false);
    expect(
      sessionStorage.getItem('employee-management:current-session'),
    ).toBeNull();
    vi.restoreAllMocks();
  });

  it('clears the current session on logout but preserves login history', () => {
    service.register('Taylor', 'taylor@example.com', 'Taylor@123');
    service.login('taylor@example.com', 'Taylor@123');

    service.logout();

    expect(
      sessionStorage.getItem('employee-management:current-session'),
    ).toBeNull();
    expect(
      localStorage.getItem('employee-management:logged-in-users'),
    ).not.toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});
