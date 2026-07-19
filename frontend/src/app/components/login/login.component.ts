import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMsg = '';
  successMsg = '';
  loading = false;

  constructor(private api: ApiService, private router: Router) {}

  login() {
    if (!this.username || !this.password) {
      this.errorMsg = 'Unesite korisničko ime i lozinku';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.api.login(this.username, this.password).subscribe({
      next: (res: any) => {
        if (res.message) {
          this.errorMsg = res.message;
          this.loading = false;
          return;
        }
        // No JWT - store user directly
        localStorage.setItem('user', JSON.stringify(res));
        this.loading = false;
        if (res.role === 'athlete') this.router.navigate(['/athlete']);
        else if (res.role === 'employee') this.router.navigate(['/employee']);
        else if (res.role === 'admin') this.router.navigate(['/system-admin-2025']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Greška pri prijavi';
      }
    });
  }
}
