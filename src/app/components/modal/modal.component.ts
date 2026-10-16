import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  public title = input.required<string>();

  public description = input<string>('');

  public close = output<void>();

  public onClose(): void {
    this.close.emit();
  }
}
