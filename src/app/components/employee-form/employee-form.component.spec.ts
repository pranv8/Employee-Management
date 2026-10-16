import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeFormComponent } from './employee-form.component';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows an invalid-name message when the name contains a digit', () => {
    const nameInput = fixture.nativeElement.querySelector('#name') as HTMLInputElement;

    nameInput.value = 'Jordan2';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    nameInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.employeeForm.get('name')?.invalid).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      'Please enter a valid name using letters and spaces only.',
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.save-btn').disabled).toBe(true);
  });

  it('tracks form validity through valueChanges', () => {
    component.employeeForm.patchValue({
      name: 'Jordan Smith',
      email: 'jordan@example.com',
      age: 30,
      department: 'IT',
      position: 'Analyst',
    });
    fixture.detectChanges();

    expect(component.isFormValid).toBe(true);
    expect(fixture.nativeElement.querySelector('.save-btn').disabled).toBe(false);

    component.employeeForm.controls.email.setValue('not-an-email');
    fixture.detectChanges();

    expect(component.isFormValid).toBe(false);
    expect(fixture.nativeElement.querySelector('.save-btn').disabled).toBe(true);
  });

  it('updates the submit label when edit mode changes', () => {
    fixture.componentRef.setInput('isEditMode', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.save-btn').textContent).toContain(
      'Update Employee',
    );
  });

  it('updates the reactive form when the employee input changes', () => {
    fixture.componentRef.setInput('employee', {
      employeeId: 1,
      employeeName: 'Jordan Smith',
      employeeEmail: 'jordan@example.com',
      employeeAge: 30,
      employeeDepartment: 'IT',
      employeePosition: 'Analyst',
    });
    fixture.detectChanges();

    expect(component.employeeForm.getRawValue()).toEqual({
      name: 'Jordan Smith',
      email: 'jordan@example.com',
      age: 30,
      department: 'IT',
      position: 'Analyst',
    });
  });

  it('emits employee data when the valid form is submitted', () => {
    let savedEmployee: unknown;
    component.save.subscribe((value) => {
      savedEmployee = value;
    });

    const nativeElement = fixture.nativeElement as HTMLElement;
    const setInputValue = (selector: string, value: string): void => {
      const input = nativeElement.querySelector(selector) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    setInputValue('#name', 'Jordan Smith');
    setInputValue('#email', 'jordan@example.com');
    setInputValue('#age', '30');
    setInputValue('#position', 'Analyst');

    const department = nativeElement.querySelector('#department') as HTMLSelectElement;
    department.value = 'IT';
    department.dispatchEvent(new Event('change', { bubbles: true }));

    fixture.detectChanges();
    (nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    expect(component.employeeForm.valid).toBe(true);
    expect(savedEmployee).toEqual({
      employeeName: 'Jordan Smith',
      employeeEmail: 'jordan@example.com',
      employeeAge: 30,
      employeeDepartment: 'IT',
      employeePosition: 'Analyst',
    });
  });
});
