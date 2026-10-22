
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { EmployeeService } from '../../services/employee.service';
import { MockApiService } from '../../services/mockapi.service';
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
export class EmployeeTablePageComponent implements OnDestroy {
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

  public filteredEmployeeList: Employee[] = [];
  public employeeBeingEdited: Employee | null = null;
  public employeePendingDeletion: Employee | null = null;
  public searchQuery = '';
  public readonly pageSize = 8;
  public currentPage = 1;
  public totalEmployees = 0;
  public isEmployeeFormModalOpen = false;
  public isDeleteConfirmationModalOpen = false;
  public isEditingEmployee = false;
  public isAgeAscending = true;
  public hasAgeSort = false;

  public isLoading = true;
  public loadError = '';

  private pageRequest?: Subscription;

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly mockApiService: MockApiService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.loadEmployeeList();
  }

  public ngOnDestroy(): void {
    this.pageRequest?.unsubscribe();
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

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalEmployees / this.pageSize));
  }

  public get firstEmployeeNumber(): number {
    return this.totalEmployees === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  public get lastEmployeeNumber(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalEmployees);
  }

  public loadEmployeeList(): void {
    this.pageRequest?.unsubscribe();
    this.isLoading = true;
    this.loadError = '';

    this.pageRequest = this.mockApiService
      .loadEmployeePage(
        this.currentPage,
        this.pageSize,
        this.searchQuery,
        this.hasAgeSort ? this.isAgeAscending : null,
      )
      .subscribe({
        next: ({ employees, total }) => {
          this.totalEmployees = total;
          const lastPage = Math.max(
            1,
            Math.ceil(total / this.pageSize),
          );

          if (this.currentPage > lastPage) {
            this.currentPage = lastPage;
            this.loadEmployeeList();
            return;
          }

          this.filteredEmployeeList = employees;
          this.isLoading = false;
          this.changeDetector.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load employees:', error);
          this.loadError = 'Unable to load employees. Please try again.';
          this.isLoading = false;
          this.changeDetector.markForCheck();
        },
      });
  }

  public goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadEmployeeList();
  }

  public previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  public nextPage(): void {
    this.goToPage(this.currentPage + 1);
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

    this.searchQuery = '';
    this.currentPage = 1;
    this.closeEmployeeFormModal();
    this.loadEmployeeList();
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

    this.searchQuery = '';
    this.closeDeleteConfirmationModal();
    this.loadEmployeeList();
  }

  public searchEmployees(searchText: string): void {
    this.searchQuery = searchText.toLowerCase().trim();
    this.currentPage = 1;
    this.loadEmployeeList();
  }

  public clearEmployeeSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadEmployeeList();
  }

  public sortEmployeesByAge(): void {
    if (this.hasAgeSort) {
      this.isAgeAscending = !this.isAgeAscending;
    }
    this.hasAgeSort = true;
    this.loadEmployeeList();
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
