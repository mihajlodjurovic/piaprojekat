import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  activeTab = 'users';
  user: any = null;
  msg = ''; err = '';
  users: any[] = [];
  regRequests: any[] = [];
  facRequests: any[] = [];
  trainers: any[] = [];
  sports: any[] = [];
  newSport = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (!userData) { this.router.navigate(['/login']); return; }
    this.user = JSON.parse(userData);
    if (this.user.role !== 'admin') { this.router.navigate(['/']); return; }
    this.loadAll();
  }

  loadAll() {
    this.api.getAdminUsers().subscribe({ next: (res: any) => this.users = res.users || [] });
    this.api.getRegistrationRequests().subscribe({ next: (res: any) => this.regRequests = res.requests || [] });
    this.api.getFacilityRequests().subscribe({ next: (res: any) => this.facRequests = res.facilities || [] });
    this.api.getAdminTrainers().subscribe({ next: (res: any) => this.trainers = res.trainers || [] });
    this.api.getAdminSports().subscribe({ next: (res: any) => this.sports = res.sports || [] });
  }

  logout() { localStorage.clear(); this.router.navigate(['/']); }

  toggleUser(id: string, currentActive: boolean) {
    this.api.updateAdminUser(id, { isActive: !currentActive }).subscribe({
      next: () => { this.msg = 'Status korisnika promenjen'; this.loadAll(); }
    });
  }

  deleteUser(id: string) {
    if (!confirm('Sigurni ste da želite da obrišete ovog korisnika?')) return;
    this.api.deleteAdminUser(id).subscribe({
      next: () => { this.msg = 'Korisnik obrisan'; this.loadAll(); }
    });
  }

  approveReject(id: string, action: string) {
    this.api.handleRegistrationRequest(id, action).subscribe({
      next: () => { this.msg = action === 'approve' ? 'Zahtev odobren' : 'Zahtev odbijen'; this.loadAll(); }
    });
  }

  approveFacility(id: string, action: string) {
    this.api.handleFacilityRequest(id, action).subscribe({
      next: () => { this.msg = action === 'approve' ? 'Objekat odobren' : 'Objekat odbijen'; this.loadAll(); }
    });
  }

  toggleTrainer(id: string) {
    this.api.toggleTrainer(id).subscribe({
      next: () => { this.msg = 'Status trenera promenjen'; this.loadAll(); }
    });
  }

  addSport() {
    if (!this.newSport.trim()) { this.err = 'Unesite naziv sporta'; return; }
    this.api.addSport(this.newSport.trim()).subscribe({
      next: () => { this.msg = 'Sport dodat'; this.newSport = ''; this.loadAll(); },
      error: (err) => this.err = err.error?.message
    });
  }
}
