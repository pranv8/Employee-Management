
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Employee } from '../interface/employee.interface';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly storageKey = 'employees';
  private readonly http = inject(HttpClient);

  private employeeList: Employee[] | null = null;

  // Load employees from localStorage or HTTP.
  public loadEmployees(): Observable<Employee[]> {
    // Return cached data if already loaded.
    if (this.employeeList !== null) {
      return of(this.getAllEmployees());
    }

    // Check previously saved employee data.
    const storedEmployees = this.getStoredEmployees();

    if (storedEmployees !== null) {
      this.employeeList = storedEmployees;
      return of(this.getAllEmployees());
    }

    // Load the initial employee data through HTTP.
    return this.http
      .get<unknown>('assets/Employee.json')
      .pipe(
        map((data) => {
          if (!Array.isArray(data)) {
            throw new Error('Employee JSON must contain an array.');
          }

          this.employeeList = this.normalizeEmployees(data);
          this.persistEmployees(this.employeeList);

          return this.getAllEmployees();
        }),
      );
  }

  public getEmployees(): Employee[] {
    return this.getAllEmployees();
  }

  public getAllEmployees(): Employee[] {
    if (this.employeeList !== null) {
      return this.employeeList.map((employee) => ({ ...employee }));
    }

    // Do not initialize an empty list before HTTP loading finishes.
    return this.getStoredEmployees() ?? [];
  }

  public getEmployeeById(employeeId: number): Employee | null {
    const employee = this.getAllEmployees().find(
      (item) => item.employeeId === employeeId,
    );

    return employee ? { ...employee } : null;
  }

  public createEmployee(
    employeeData: Omit<Employee, 'employeeId'>,
  ): Employee {
    const employees = this.getAllEmployees();

    const employee: Employee = {
      ...employeeData,
      employeeId:
        employees.length === 0
          ? 1
          : Math.max(...employees.map((item) => item.employeeId)) + 1,
    };

    this.saveEmployees([...employees, employee]);

    return { ...employee };
  }

  public updateEmployee(
    employeeId: number,
    employeeData: Omit<Employee, 'employeeId'>,
  ): Employee | null {
    const employees = this.getAllEmployees();

    const index = employees.findIndex(
      (employee) => employee.employeeId === employeeId,
    );

    if (index === -1) {
      return null;
    }

    const updatedEmployee = {
      ...employees[index],
      ...employeeData,
    };

    employees[index] = updatedEmployee;
    this.saveEmployees(employees);

    return { ...updatedEmployee };
  }

  public deleteEmployee(employeeId: number): boolean {
    const employees = this.getAllEmployees();

    const remainingEmployees = employees.filter(
      (employee) => employee.employeeId !== employeeId,
    );

    if (remainingEmployees.length === employees.length) {
      return false;
    }

    this.saveEmployees(remainingEmployees);

    return true;
  }

  public filterEmployees(
    employees: Employee[],
    searchText: string,
    searchableFields: readonly (keyof Employee)[],
  ): Employee[] {
    const query = searchText.toLowerCase().trim();

    if (!query) {
      return [...employees];
    }

    return employees.filter((employee) =>
      searchableFields.some((field) =>
        String(employee[field]).toLowerCase().includes(query),
      ),
    );
  }

  public sortEmployeesByAge(
    employees: Employee[],
    ascending: boolean,
  ): Employee[] {
    return [...employees].sort((a, b) =>
      ascending
        ? a.employeeAge - b.employeeAge
        : b.employeeAge - a.employeeAge,
    );
  }

  public saveEmployees(employees: Employee[]): void {
    this.employeeList = employees.map((employee) => ({ ...employee }));
    this.persistEmployees(this.employeeList);
  }

  private persistEmployees(employees: Employee[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(employees));
  }

  public getStoredEmployees(): Employee[] | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const data = localStorage.getItem(this.storageKey);

    if (!data) {
      return null;
    }

    try {
      const parsedData: unknown = JSON.parse(data);

      return Array.isArray(parsedData)
        ? this.normalizeEmployees(parsedData)
        : null;
    } catch (error) {
      console.error('Invalid employee data in localStorage', error);
      return null;
    }
  }

  public clearEmployees(): void {
    this.employeeList = null;

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  private normalizeEmployees(data: unknown[]): Employee[] {
    return data
      .map((item) => {
        if (typeof item !== 'object' || item === null) {
          return null;
        }

        const record = item as Record<string, unknown>;

        const employeeId = Number(
          record['employeeId'] ?? record['id'],
        );

        const employeeAge = Number(
          record['employeeAge'] ?? record['age'],
        );

        const employeeName =
          record['employeeName'] ?? record['name'];

        const employeeEmail =
          record['employeeEmail'] ?? record['email'];

        const employeeDepartment =
          record['employeeDepartment'] ?? record['department'];

        const employeePosition =
          record['employeePosition'] ?? record['position'];

        if (
          !Number.isFinite(employeeId) ||
          !Number.isFinite(employeeAge) ||
          typeof employeeName !== 'string' ||
          typeof employeeEmail !== 'string' ||
          typeof employeeDepartment !== 'string' ||
          typeof employeePosition !== 'string'
        ) {
          return null;
        }

        return {
          employeeId,
          employeeName,
          employeeEmail,
          employeeAge,
          employeeDepartment,
          employeePosition,
        };
      })
      .filter((employee): employee is Employee => employee !== null);
  }
}
