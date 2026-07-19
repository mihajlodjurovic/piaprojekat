import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  role = 'athlete';
  username = ''; email = ''; password = '';
  firstName = ''; lastName = ''; contactPhone = '';
  favoriteSports: string[] = [];
  facilityName = ''; facilityAddress = ''; registrationNumber = ''; pib = '';
  selectedFile: File | null = null;
  avatarPreview: string | null = null;
  errorMsg = ''; successMsg = ''; loading = false;

  constructor(private api: ApiService, private router: Router) {}

  onRoleChange() { this.errorMsg = ''; }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.avatarPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  generateAvatar() {
    const seed = Math.random().toString(36).substring(7);
    this.avatarPreview = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
    fetch(this.avatarPreview)
      .then(res => res.blob())
      .then(blob => {
        this.selectedFile = new File([blob], `avatar-${seed}.svg`, { type: 'image/svg+xml' });
      });
  }

  removeImage() {
    this.selectedFile = null;
    this.avatarPreview = null;
  }

  register() {
    this.errorMsg = '';
    if (!this.username || !this.email || !this.password || !this.firstName || !this.lastName) {
      this.errorMsg = 'Popunite sva obavezna polja'; return;
    }
    if (this.role === 'employee') {
      if (!this.facilityName || !this.facilityAddress || !this.registrationNumber || !this.pib) {
        this.errorMsg = 'Popunite sva polja za zaposlenog'; return;
      }
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('firstName', this.firstName);
    formData.append('lastName', this.lastName);
    formData.append('contactPhone', this.contactPhone);
    formData.append('role', this.role);

    if (this.role === 'athlete') {
      this.favoriteSports.forEach(s => formData.append('favoriteSports', s));
    }
    if (this.role === 'employee') {
      formData.append('facilityName', this.facilityName);
      formData.append('facilityAddress', this.facilityAddress);
      formData.append('registrationNumber', this.registrationNumber);
      formData.append('pib', this.pib);
    }
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.api.register(formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.message === 'OK') {
          this.successMsg = 'Uspešno ste se registrovali! Sačekajte odobrenje admina.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.errorMsg = res.message || 'Greška pri registraciji';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = 'Greška pri registraciji';
      }
    });
  }
}
