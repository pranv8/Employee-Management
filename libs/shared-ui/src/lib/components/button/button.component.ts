import { Component, input, output } from '@angular/core';

import { Button } from '../../interface/button.interface';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  public button = input.required<Button>();

  public clicked = output<void>();

  public onClick(): void {
    this.clicked.emit();
  }
}
