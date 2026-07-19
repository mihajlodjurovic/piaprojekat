import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AthletePanelComponent } from './athlete-panel.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('AthletePanelComponent', () => {
  let component: AthletePanelComponent;
  let fixture: ComponentFixture<AthletePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthletePanelComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(AthletePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
});
