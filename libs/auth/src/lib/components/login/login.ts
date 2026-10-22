import { Component, inject } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CustomInput, CustomInputComponent } from '@employee-management/shared-ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CustomInputComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {

  private readonly formBuilder = inject(FormBuilder);

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  public loginError = '';

  public loginForm = this.formBuilder.nonNullable.group({
    email: ['', [
        Validators.required,
        Validators.email,
      ]],
    password: ['', [
        Validators.required,
      ]],
  });


  public readonly emailField: CustomInput = {
    type: 'email',
    label: 'Email',
    name: 'email',
    required: false,
    placeholder: 'you@company.com',
    autocomplete: 'email',
  };

  public readonly passwordField: CustomInput = {
    type: 'password',
    label: 'Password',
    name: 'password',
    required: false,
    placeholder: 'Enter your password',
    autocomplete: 'current-password',
  };

  public onSubmit(): void {

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;
    }

    const {
      email,
      password,
    } = this.loginForm.getRawValue();


    const loginSuccessful =
      this.authService.login(
        email,
        password
      );


    if (!loginSuccessful) {

      this.loginError =
        'Invalid email or password.';

      return;
    }


    this.loginError = '';

    this.router.navigate(['/employees']);
  }


  public goToSignup(): void {

    this.router.navigate(['/signup']);

  }

}