import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('button', {
      label: 'Test button',
      type: 'button',
      disabled: false,
      className: 'test-button',
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label for a cancel button', () => {
    fixture.componentRef.setInput('button', {
      label: 'Cancel',
      type: 'button',
      disabled: false,
      className: 'cancel-btn',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button').textContent.trim()).toBe('Cancel');
  });
});
