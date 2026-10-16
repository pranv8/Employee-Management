import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EmployeeComponent } from './employee.component';

describe('EmployeeComponent', () => {
  let fixture: ComponentFixture<EmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the sidebar and child route outlet', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-sidebar')).toBeTruthy();
    expect(element.querySelector('router-outlet')).toBeTruthy();
    expect(element.textContent).toContain('Employee Table');
    expect(element.textContent).toContain('Employee List');
  });
});
