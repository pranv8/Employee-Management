import { Component, Input, input, output } from '@angular/core';

import { Employee } from '../../interface/employee.interface';

import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-employee-table',
  standalone: true,

  imports: [ButtonComponent],

  templateUrl: './employee-table.component.html',
  styleUrl: './employee-table.component.css',
})
export class EmployeeTableComponent {
  public employees = input.required<Employee[]>();

  public ageAscending = input.required<boolean>();

  public edit = output<Employee>();

  public delete = output<Employee>();

  public sortAge = output<void>();

  // Hide the edit / delete buttons for users without permission.
  public canEdit = input<boolean>(true);

  public canDelete = input<boolean>(true);

  public onEdit(employee: Employee): void {
    this.edit.emit(employee);
  }

  public onDelete(employee: Employee): void {
    this.delete.emit(employee);
  }

  public onSortAge(): void {
    this.sortAge.emit();
  }
}
