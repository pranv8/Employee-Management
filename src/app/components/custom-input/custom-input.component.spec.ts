import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CustomInputComponent } from './custom-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CustomInputComponent],
  template: `
    <form [formGroup]="form">
      <app-input-field [field]="field" formControlName="name"></app-input-field>
    </form>
  `,
})
class InputFieldHostComponent {
  public readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  public readonly field = {
    type: 'text' as const,
    label: 'Full Name',
    required: true,
    name: 'name',
    placeholder: 'Enter full name',
  };
}

describe('InputFieldComponent', () => {
  let fixture: ComponentFixture<InputFieldHostComponent>;
  let host: InputFieldHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputFieldHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputFieldHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and register as a form control', () => {
    expect(fixture.nativeElement.querySelector('app-input-field')).toBeTruthy();
    expect(host.form.controls.name.value).toBe('');
  });

  it('should write form values to the native input and report input changes', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    host.form.controls.name.setValue('Avery Employee');
    fixture.detectChanges();
    expect(input.value).toBe('Avery Employee');

    input.value = 'Morgan Employee';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.form.controls.name.value).toBe('Morgan Employee');
  });

  it('should update touched and disabled state through the value accessor', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(host.form.controls.name.touched).toBe(true);

    host.form.controls.name.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);

    host.form.controls.name.enable();
    fixture.detectChanges();
    expect(input.disabled).toBe(false);
  });

  it('should show the configured validation message after blur', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain(
      'Full Name is required.',
    );
  });

  it('should refresh the validation message when the parent marks controls touched', () => {
    host.form.markAllAsTouched();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain(
      'Full Name is required.',
    );
  });
});
