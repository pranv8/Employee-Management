import { TestBed } from '@angular/core/testing';

import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads default employees using the current interface fields', () => {
    const employees = service.getEmployees();

    expect(employees.length).toBeGreaterThan(0);
    expect(employees[0]).toEqual({
      employeeId: 1,
      employeeName: 'John Doe',
      employeeEmail: 'john.doe@example.com',
      employeeAge: 28,
      employeeDepartment: 'IT',
      employeePosition: 'Frontend Developer',
    });
  });

  it('normalizes previously stored employees with legacy field names', () => {
    localStorage.setItem(
      'employees',
      JSON.stringify([
        {
          id: 9,
          name: 'Taylor Morgan',
          email: 'taylor@example.com',
          age: 34,
          department: 'Finance',
          position: 'Analyst',
        },
      ]),
    );

    expect(service.getStoredEmployees()).toEqual([
      {
        employeeId: 9,
        employeeName: 'Taylor Morgan',
        employeeEmail: 'taylor@example.com',
        employeeAge: 34,
        employeeDepartment: 'Finance',
        employeePosition: 'Analyst',
      },
    ]);
  });

  it('creates, updates, and deletes employees while keeping storage in sync', () => {
    service.saveEmployees([]);

    const createdEmployee = service.createEmployee({
      employeeName: 'Jordan Smith',
      employeeEmail: 'jordan@example.com',
      employeeAge: 30,
      employeeDepartment: 'IT',
      employeePosition: 'Analyst',
    });

    expect(createdEmployee.employeeId).toBe(1);
    expect(service.getStoredEmployees()).toEqual([createdEmployee]);

    const updatedEmployee = service.updateEmployee(1, {
      employeeName: 'Jordan Lee',
      employeeEmail: 'jordan@example.com',
      employeeAge: 31,
      employeeDepartment: 'Finance',
      employeePosition: 'Senior Analyst',
    });

    expect(updatedEmployee?.employeeName).toBe('Jordan Lee');
    expect(service.getEmployeeById(1)).toEqual(updatedEmployee);
    expect(service.deleteEmployee(1)).toBe(true);
    expect(service.getAllEmployees()).toEqual([]);
    expect(service.deleteEmployee(1)).toBe(false);
  });

  it('filters employees by configured fields and sorts by age', () => {
    const employees = [
      {
        employeeId: 1,
        employeeName: 'Jordan Smith',
        employeeEmail: 'jordan@example.com',
        employeeAge: 30,
        employeeDepartment: 'IT',
        employeePosition: 'Analyst',
      },
      {
        employeeId: 2,
        employeeName: 'Taylor Morgan',
        employeeEmail: 'taylor@example.com',
        employeeAge: 35,
        employeeDepartment: 'HR',
        employeePosition: 'Manager',
      },
    ];

    expect(service.filterEmployees(employees, '2', ['employeeName', 'employeeId'])).toEqual([
      employees[1],
    ]);
    expect(service.sortEmployeesByAge(employees, false).map((employee) => employee.employeeAge)).toEqual([
      35,
      30,
    ]);
  });
});
