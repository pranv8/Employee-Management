
import {
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Employee } from '../../interface/employee.interface';
import { CustomInput } from '../../interface/custom-input.interface';
import { ButtonComponent } from '../button/button.component';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CustomInputComponent,
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css',
})
export class EmployeeFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  // Signal input: receives employee data from the parent component.
  public employee = input<Employee | null>(null);

  public isEditMode = input(false);

  public save = output<Omit<Employee, 'employeeId'>>();

  public cancel = output<void>();

  // Reactive form with validation.
  public employeeForm = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.pattern('^[A-Za-z\\s]+$'),
    ]),

    email: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),

    age: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(18),
      Validators.max(60),
    ]),

    department: this.formBuilder.nonNullable.control('', [
      Validators.required,
    ]),

    position: this.formBuilder.nonNullable.control('', [
      Validators.required,
    ]),
  });

  public isFormValid = this.employeeForm.valid;

  // Configuration for reusable input fields.
  public readonly fields: CustomInput[] = [
    {
      type: 'text',
      label: 'Full Name',
      required: true,
      value: '',
      disable: false,
      name: 'name',
      placeholder: 'Enter full name',
      errorMessages: {
        pattern: 'Please enter a valid name using letters and spaces only.',
      },
    },
    {
      type: 'email',
      label: 'Email',
      required: true,
      value: '',
      disable: false,
      name: 'email',
      placeholder: 'Enter email address',
      errorMessages: {
        email: 'Please enter a valid email address.',
      },
    },
    {
      type: 'number',
      label: 'Age',
      required: true,
      value: '',
      disable: false,
      name: 'age',
      placeholder: 'Enter age',
      errorMessages: {
        min: 'Age must be at least 18.',
        max: 'Age cannot be greater than 60.',
      },
    },
    {
      type: 'select',
      label: 'Department',
      required: true,
      value: '',
      disable: false,
      name: 'department',
      placeholder: 'Select department',
      options: [
        'IT',
        'HR',
        'Finance',
        'Marketing',
        'Sales',
        'Management',
      ],
    },
    {
      type: 'text',
      label: 'Position',
      required: true,
      value: '',
      disable: false,
      name: 'position',
      placeholder: 'Enter position',
    },
  ];

  constructor() {
    // Update form validity whenever a form value changes.
    this.employeeForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.isFormValid = this.employeeForm.valid;
      });

    // Signal-based replacement for ngOnChanges().
    effect(() => {
      const employee = this.employee();

      this.employeeForm.reset({
        name: employee?.employeeName ?? '',
        email: employee?.employeeEmail ?? '',
        age: employee?.employeeAge ?? null,
        department: employee?.employeeDepartment ?? '',
        position: employee?.employeePosition ?? '',
      });
    });
  }

  public onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formValue = this.employeeForm.getRawValue();

    const employeeData: Omit<Employee, 'employeeId'> = {
      employeeName: formValue.name.trim(),
      employeeEmail: formValue.email.trim(),
      employeeAge: Number(formValue.age),
      employeeDepartment: formValue.department.trim(),
      employeePosition: formValue.position.trim(),
    };

    this.save.emit(employeeData);
  }

  public onCancel(): void {
    this.cancel.emit();
  }
}
