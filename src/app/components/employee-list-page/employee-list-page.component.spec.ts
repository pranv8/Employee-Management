import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Employee } from '../../interface/employee.interface';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeListPageComponent } from './employee-list-page.component';

describe('EmployeeListPageComponent', () => {
  let fixture: ComponentFixture<EmployeeListPageComponent>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  const employees: Employee[] = [
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

  beforeEach(async () => {
    router = { navigate: vi.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [EmployeeListPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ employeeId: '2' })),
          },
        },
        { provide: Router, useValue: router },
        {
          provide: EmployeeService,
          useValue: {
            getAllEmployees: () => employees,
            getEmployeeById: (id: number) =>
              employees.find((employee) => employee.employeeId === id) ?? null,
            filterEmployees: (
              items: Employee[],
              searchText: string,
              fields: readonly (keyof Employee)[],
            ) => {
              const query = searchText.toLowerCase().trim();
              return query
                ? items.filter((employee) =>
                    fields.some((field) =>
                      String(employee[field]).toLowerCase().includes(query),
                    ),
                  )
                : [...items];
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeListPageComponent);
    fixture.detectChanges();
  });

  it('shows employee names and IDs and displays the employee selected by the route', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.employee-list-item')).toHaveLength(2);
    expect(element.querySelector('.employee-list')?.textContent).toContain('Jordan Smith');
    expect(element.querySelector('.employee-list')?.textContent).toContain('ID: 2');
    expect(element.querySelector('.employee-card')?.textContent).toContain('Taylor Morgan');
    expect(element.querySelector('.employee-list-item.selected')?.textContent).toContain(
      'Taylor Morgan',
    );
  });

  it('filters the list by employee name or ID', () => {
    fixture.componentInstance.searchEmployees('1');
    fixture.detectChanges();

    expect(fixture.componentInstance.visibleEmployees.map((employee) => employee.employeeId)).toEqual([
      1,
    ]);
  });

  it('navigates to the selected employee route', () => {
    fixture.componentInstance.selectEmployee(employees[0]);

    expect(router.navigate).toHaveBeenCalledWith(['/employees/list', 1]);
  });
});
