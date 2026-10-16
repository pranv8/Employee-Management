import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  forwardRef,
  Injector,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';

import { CustomInput} from '../../interface/custom-input.interface';

@Component({
  selector: 'app-input-field',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() =>CustomInputComponent),
      multi: true,
    },
  ],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.css',
})
export class CustomInputComponent implements AfterViewInit, ControlValueAccessor {
  public field = input.required<CustomInput>();

  public value: string | number | null = '';
  public isDisabled = false;

  private readonly injector = inject(Injector);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private ngControl: NgControl | null = null;
  private onChange: (value: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  public ngAfterViewInit(): void {
    this.ngControl = this.injector.get(NgControl, null, { self: true });
    this.ngControl?.control?.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }

  public writeValue(value: string | number | null): void {
    this.value = value ?? '';
    this.changeDetectorRef.markForCheck();
  }

  public registerOnChange(
    fn: (value: string | number | null) => void,
  ): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  public get showError(): boolean {
    const control = this.ngControl?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  public get isTouched(): boolean {
    return this.ngControl?.control?.touched ?? false;
  }

  public get isValid(): boolean {
    return this.ngControl?.control?.valid ?? false;
  }

  public get isInvalid(): boolean {
    return this.ngControl?.control?.invalid ?? false;
  }

  public get isDirty(): boolean {
    return this.ngControl?.control?.dirty ?? false;
  }

  public getErrorMessage(): string {
    const errors = this.ngControl?.control?.errors;
    const field = this.field();

    if (!errors) {
      return '';
    }

    const key = Object.keys(errors)[0];
    const custom = field.errorMessages?.[key];

    if (custom) {
      return custom;
    }

    switch (key) {
      case 'required':
        return `${field.label} is required.`;
      case 'email':
        return 'Enter a valid email address.';
      case 'minlength':
        return `${field.label} must be at least ${errors['minlength'].requiredLength} characters.`;
      case 'maxlength':
        return `${field.label} cannot exceed ${errors['maxlength'].requiredLength} characters.`;
      case 'min':
        return `${field.label} must be at least ${errors['min'].min}.`;
      case 'max':
        return `${field.label} cannot be greater than ${errors['max'].max}.`;
      case 'pattern':
        return `${field.label} is not in a valid format.`;
      default:
        return `${field.label} is invalid.`;
    }
  }

  public onInput(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    const value =
      this.field().type === 'number'
        ? input.value === ''
          ? null
          : Number(input.value)
        : input.value;

    this.value = value;
    this.onChange(value);
  }

  public onBlur(): void {
    this.onTouched();
  }
}
