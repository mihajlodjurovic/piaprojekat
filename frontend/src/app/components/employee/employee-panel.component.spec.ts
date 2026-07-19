import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeePanelComponent } from './employee-panel.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('EmployeePanelComponent', () => {
  let component: EmployeePanelComponent;
  let fixture: ComponentFixture<EmployeePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePanelComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(EmployeePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
});
