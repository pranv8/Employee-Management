import { Component, input } from '@angular/core';

import { Employee } from '../../interface/employee.interface';

@Component({
  selector: 'app-employee-card',
  standalone: true,
  templateUrl: './employee-card.component.html',
  styleUrl: './employee-card.component.css',
})
export class EmployeeCardComponent {
  public employee = input<Employee | null>(null);
}
