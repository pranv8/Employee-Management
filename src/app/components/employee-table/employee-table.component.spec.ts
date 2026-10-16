import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeTableComponent } from './employee-table.component';

describe('EmployeeTableComponent', () => {
  let component: EmployeeTableComponent;
  let fixture: ComponentFixture<EmployeeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeTableComponent);
    fixture.componentRef.setInput('employees', []);
    fixture.componentRef.setInput('ageAscending', true);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
