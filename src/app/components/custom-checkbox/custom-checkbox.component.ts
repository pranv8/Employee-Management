import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-custom-checkbox',
  standalone: true,
  templateUrl: './custom-checkbox.component.html',
  styleUrl: './custom-checkbox.component.css',
})
export class CustomCheckboxComponent {
  public checked = input(false);
  public ariaLabel = input.required<string>();

  public checkedChange = output<boolean>();

  public onChange(event: Event): void {
    this.checkedChange.emit((event.target as HTMLInputElement).checked);
  }
}
