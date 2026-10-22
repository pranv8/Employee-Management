import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Employee } from '../interface/employee.interface';
import { EmployeeService } from './employee.service';

export interface EmployeePage {
  employees: Employee[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class MockApiService {
  constructor(private readonly employeeService: EmployeeService) {}

  public loadEmployeePage(
    page: number,
    pageSize: number,
    searchText = '',
    sortByAgeAscending: boolean | null = null,
  ): Observable<EmployeePage> {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1
    ) {
      throw new Error('Page and page size must be positive integers.');
    }

    return new Observable<EmployeePage>((subscriber) => {
      let employeesSubscription: Subscription | undefined;
      let responseTimer: ReturnType<typeof setTimeout> | undefined;

      const emitPage = (employees: Employee[]): void => {
        const query = searchText.toLowerCase().trim();
        const matchingEmployees = query
          ? employees.filter(
              (employee) =>
                employee.employeeName.toLowerCase().includes(query) ||
                employee.employeeDepartment.toLowerCase().includes(query),
            )
          : employees;
        const sortedEmployees =
          sortByAgeAscending === null
            ? matchingEmployees
            : this.employeeService.sortEmployeesByAge(
                matchingEmployees,
                sortByAgeAscending,
              );
        const startIndex = (page - 1) * pageSize;

        responseTimer = setTimeout(() => {
          subscriber.next({
            employees: sortedEmployees
              .slice(startIndex, startIndex + pageSize)
              .map((employee) => ({ ...employee })),
            total: matchingEmployees.length,
          });
          subscriber.complete();
        }, 300);
      };

      const storedEmployees = this.employeeService.getStoredEmployees();

      if (storedEmployees !== null) {
        emitPage(storedEmployees);
      } else {
        employeesSubscription = this.employeeService.loadEmployees().subscribe({
          next: emitPage,
          error: (error: unknown) => subscriber.error(error),
        });
      }

      return () => {
        employeesSubscription?.unsubscribe();

        if (responseTimer !== undefined) {
          clearTimeout(responseTimer);
        }
      };
    });
  }
}
