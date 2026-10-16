
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Employee } from '../../interface/employee.interface';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeCardComponent } from '../employee-card/employee-card.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-employee-list-page',
  standalone: true,
  imports: [EmployeeCardComponent, SearchBarComponent],
  templateUrl: './employee-list-page.component.html',
  styleUrl: './employee-list-page.component.css',
})
export class EmployeeListPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);

  public employees: Employee[] = [];
  public searchQuery = '';
  public selectedEmployee: Employee | null = null;
  public employeeNotFound = false;

  public isLoading = true;
  public loadError = '';

  constructor() {
    // Load employee data asynchronously.
    this.employeeService
      .loadEmployees()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          this.isLoading = false;

          // Resolve the selected employee after loading.
          this.updateSelectedEmployee(
            this.route.snapshot.paramMap.get('employeeId'),
          );
        },
        error: (error) => {
          console.error('Failed to load employees:', error);
          this.loadError = 'Unable to load employees. Please try again.';
          this.isLoading = false;
        },
      });

    // React to changes in the employee ID in the URL.
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.updateSelectedEmployee(params.get('employeeId'));
      });
  }

  private updateSelectedEmployee(
    employeeId: string | null,
  ): void {
    this.selectedEmployee = employeeId
      ? this.employeeService.getEmployeeById(Number(employeeId))
      : null;

    this.employeeNotFound =
      employeeId !== null && this.selectedEmployee === null;
  }

  public get visibleEmployees(): Employee[] {
    return this.employeeService.filterEmployees(
      this.employees,
      this.searchQuery,
      ['employeeName', 'employeeId'],
    );
  }

  public searchEmployees(searchText: string): void {
    this.searchQuery = searchText;
  }

  public clearSearch(): void {
    this.searchQuery = '';
  }

  public selectEmployee(employee: Employee): void {
    this.router.navigate([
      '/employees/list',
      employee.employeeId,
    ]);
  }
}
