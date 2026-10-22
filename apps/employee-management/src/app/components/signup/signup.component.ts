import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CustomInput, CustomInputComponent } from '@employee-management/shared-ui';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CustomInputComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public signupError = '';

  public signupForm = this.formBuilder.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
      ],
    ],

    email: ['', [Validators.required, Validators.email]],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
      ],
    ],

    confirmPassword: ['', [Validators.required, this.passwordMatchValidator]],
  });

  // Attached to the confirmPassword control so the shared input component
  // can show the error like any other field error.
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.parent?.get('password')?.value;
    const confirmPassword = control.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  public readonly usernameField: CustomInput = {
    type: 'text',
    label: 'Username',
    name: 'username',
    required: false,
    showValidState: true,
    placeholder: 'Enter your username',
    autocomplete: 'username',
    errorMessages: {
      minlength: 'Username must be at least 3 characters.',
      maxlength: 'Username cannot exceed 20 characters.',
      pattern: 'Username can contain only letters, numbers and underscore.',
    },
  };

  public readonly emailField: CustomInput = {
    type: 'email',
    label: 'Email',
    name: 'email',
    required: false,
    showValidState: true,
    placeholder: 'Enter your email',
    autocomplete: 'email',
  };

  public readonly passwordField: CustomInput = {
    type: 'password',
    label: 'Password',
    name: 'password',
    required: false,
    showValidState: true,
    placeholder: 'Enter your password',
    autocomplete: 'new-password',
    hint: 'Minimum 8 characters with uppercase, lowercase, number and special character.',
    errorMessages: {
      minlength: 'Password must be at least 8 characters.',
      pattern: 'Password must contain uppercase, lowercase, number and special character.',
    },
  };

  public readonly confirmPasswordField: CustomInput = {
    type: 'password',
    label: 'Confirm Password',
    name: 'confirmPassword',
    required: false,
    showValidState: true,
    placeholder: 'Confirm your password',
    autocomplete: 'new-password',
    errorMessages: {
      required: 'Please confirm your password.',
      passwordMismatch: 'Passwords do not match.',
    },
  };

  constructor() {
    this.signupForm.controls.password.valueChanges.subscribe(() =>
      this.signupForm.controls.confirmPassword.updateValueAndValidity(),
    );
  }

  public onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.signupForm.getRawValue();

    const registrationSuccessful = this.authService.register(username, email, password);

    if (!registrationSuccessful) {
      this.signupError = 'An account with this email already exists.';
      return;
    }

    this.signupError = '';

    this.router.navigate(['/login']);
  }

  public goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
