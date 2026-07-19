import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  email = '';
  resetToken = '';
  newPassword = '';
  msg = ''; errorMsg = ''; loading = false;

  constructor(private api: ApiService) {}

  requestReset() {
    if (!this.email) { this.errorMsg = 'Unesite email'; return; }
    this.loading = true;
    this.api.requestPasswordReset(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.msg = res.message || 'Link je poslat';
        if (res.resetToken) {
          this.resetToken = res.resetToken;
          this.msg += ' (Dev mod: token = ' + res.resetToken + ')';
        }
      },
      error: () => { this.loading = false; this.errorMsg = 'Greška pri slanju'; }
    });
  }

  resetPassword() {
    if (!this.resetToken || !this.newPassword) {
      this.errorMsg = 'Unesite token i novu lozinku'; return;
    }
    this.loading = true;
    this.api.resetPassword(this.resetToken, this.newPassword).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.msg = res.message;
        this.resetToken = ''; this.newPassword = '';
      },
      error: () => { this.loading = false; this.errorMsg = 'Greška pri resetovanju'; }
    });
  }
}
