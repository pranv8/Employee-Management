
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../../interface/employee.interface';
import { TableColumn } from '../../interface/table-column.inteface';
import { ButtonComponent } from '../button/button.component';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { CustomTableComponent } from '../custom-table/custom-table.component';
import { ModalComponent } from '../modal/modal.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-employee-table-page',
  standalone: true,
  imports: [
    ButtonComponent,
    EmployeeFormComponent,
    CustomTableComponent,
    ModalComponent,
    SearchBarComponent,
  ],
  templateUrl: './employee-table-page.component.html',
  styleUrl: './employee-table-page.component.css',
})
export class EmployeeTablePageComponent {
  public readonly employeeColumns: TableColumn[] = [
    { key: 'employeeId', label: 'ID' },
    { key: 'employeeName', label: 'Name' },
    { key: 'employeeEmail', label: 'Email' },
    {
      key: 'employeeDepartment',
      label: 'Department',
      displayType: 'badge',
    },
    { key: 'employeeAge', label: 'Age', sortable: true },
    { key: 'employeePosition', label: 'Position' },
  ];

  public employeeList: Employee[] = [];
  public filteredEmployeeList: Employee[] = [];
  public employeeBeingEdited: Employee | null = null;
  public employeePendingDeletion: Employee | null = null;
  public searchQuery = '';
  public isEmployeeFormModalOpen = false;
  public isDeleteConfirmationModalOpen = false;
  public isEditingEmployee = false;
  public isAgeAscending = true;

  public isLoading = true;
  public loadError = '';

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.loadEmployeeList();
  }

  // Permissions are read live so admin changes apply immediately.
  public get canAdd(): boolean {
    return this.authService.hasPermission('add');
  }

  public get canEdit(): boolean {
    return this.authService.hasPermission('edit');
  }

  public get canDelete(): boolean {
    return this.authService.hasPermission('delete');
  }

  public loadEmployeeList(): void {
    this.isLoading = true;
    this.loadError = '';

    this.employeeService.loadEmployees().subscribe({
      next: (employees) => {
        this.employeeList = employees;
        this.filteredEmployeeList = [...employees];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load employees:', error);
        this.loadError = 'Unable to load employees. Please try again.';
        this.isLoading = false;
      },
    });
  }

  public openAddEmployeeForm(): void {
    if (!this.canAdd) {
      return;
    }
    this.employeeBeingEdited = null;
    this.isEditingEmployee = false;
    this.isEmployeeFormModalOpen = true;
  }

  public openEditEmployeeForm(employee: Employee): void {
    if (!this.canEdit) {
      return;
    }
    this.employeeBeingEdited = { ...employee };
    this.isEditingEmployee = true;
    this.isEmployeeFormModalOpen = true;
  }

  public closeEmployeeFormModal(): void {
    this.isEmployeeFormModalOpen = false;
    this.employeeBeingEdited = null;
  }

  public saveEmployee(
    employeeData: Omit<Employee, 'employeeId'>,
  ): void {
    if (this.isEditingEmployee ? !this.canEdit : !this.canAdd) {
      return;
    }

    if (this.isEditingEmployee && this.employeeBeingEdited) {
      this.employeeService.updateEmployee(
        this.employeeBeingEdited.employeeId,
        employeeData,
      );
    } else {
      this.employeeService.createEmployee(employeeData);
    }

    this.employeeList = this.employeeService.getAllEmployees();
    this.filteredEmployeeList = [...this.employeeList];
    this.searchQuery = '';
    this.closeEmployeeFormModal();
  }

  public openDeleteConfirmation(employee: Employee): void {
    if (!this.canDelete) {
      return;
    }
    this.employeePendingDeletion = employee;
    this.isDeleteConfirmationModalOpen = true;
  }

  public closeDeleteConfirmationModal(): void {
    this.isDeleteConfirmationModalOpen = false;
    this.employeePendingDeletion = null;
  }

  public confirmEmployeeDelete(): void {
    if (!this.employeePendingDeletion || !this.canDelete) {
      return;
    }

    this.employeeService.deleteEmployee(
      this.employeePendingDeletion.employeeId,
    );

    this.employeeList = this.employeeService.getAllEmployees();
    this.filteredEmployeeList = [...this.employeeList];
    this.searchQuery = '';
    this.closeDeleteConfirmationModal();
  }

  public searchEmployees(searchText: string): void {
    this.searchQuery = searchText.toLowerCase().trim();

    this.filteredEmployeeList =
      this.employeeService.filterEmployees(
        this.employeeList,
        this.searchQuery,
        ['employeeName', 'employeeDepartment'],
      );
  }

  public clearEmployeeSearch(): void {
    this.searchQuery = '';
    this.filteredEmployeeList = [...this.employeeList];
  }

  public sortEmployeesByAge(): void {
    this.filteredEmployeeList =
      this.employeeService.sortEmployeesByAge(
        this.filteredEmployeeList,
        this.isAgeAscending,
      );

    this.isAgeAscending = !this.isAgeAscending;
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
