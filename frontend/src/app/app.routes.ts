import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { FacilityDetailsComponent } from './components/facility-details/facility-details.component';
import { AthletePanelComponent } from './components/athlete/athlete-panel.component';
import { EmployeePanelComponent } from './components/employee/employee-panel.component';
import { AdminPanelComponent } from './components/admin/admin-panel.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'facility/:id', component: FacilityDetailsComponent },
  { path: 'athlete', component: AthletePanelComponent },
  { path: 'employee', component: EmployeePanelComponent },
  { path: 'system-admin-2025', component: AdminPanelComponent }, // skrivena admin ruta
  { path: '**', redirectTo: '' }
];
