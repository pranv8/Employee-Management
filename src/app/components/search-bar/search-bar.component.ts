import { Component, computed, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CustomInput } from '../../interface/custom-input.interface';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CustomInputComponent, ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
  private readonly formBuilder = inject(FormBuilder);

  public placeholder = input('Search employees...');

  public search = output<string>();

  public clear = output<void>();

  public searchForm = this.formBuilder.nonNullable.group({
    search: '',
  });

  public searchField = computed<CustomInput>(() => ({
    type: 'search',
    label: 'Search',
    name: 'search',
    required: false,
    placeholder: this.placeholder(),
    autocomplete: 'off',
    hideLabel: true,
    compact: true,
  }));

  constructor() {
    this.searchForm.controls.search.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.search.emit(value));
  }

  public onClear(): void {
    this.searchForm.controls.search.setValue('', { emitEvent: false });

    this.clear.emit();
  }
}
