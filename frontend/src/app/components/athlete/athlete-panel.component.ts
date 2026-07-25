import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-athlete-panel',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './athlete-panel.component.html',
  styleUrl: './athlete-panel.component.css'
})
export class AthletePanelComponent implements OnInit {
  activeTab = 'profile';
  user: any = null;
  msg = ''; err = ''; saving = false;
  profileForm: any = { firstName: '', lastName: '', contactPhone: '', favoriteSports: [], email: '' };
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  allSports = ['Tenis','Fudbal','Košarka','Odbojka','Plivanje','Stoni tenis','Badminton','Teretana','Joga'];

  reservations: any[] = [];
  sortResField = ''; sortResDir = 1;

  rName = ''; rCity = ''; rSport = ''; rType = '';
  searchResults: any[] | null = null;

  teammatePosts: any[] = [];
  tpSport = 'Tenis'; tpCity = ''; tpDate = ''; tpStart = ''; tpEnd = ''; tpMissing = '1'; tpDesc = '';
  tMsg = ''; tErr = '';

  trainers: any[] = [];
  trainings: any[] = [];
  selectedTrainer: any = null;
  showTrainingForm = false;
  trnSport = ''; trnDate = ''; trnStart = ''; trnEnd = '';
  trnMsg = ''; trnErr = '';

  equipment: any[] = [];
  orders: any[] = [];
  cart: any[] = [];
  cartQuantities: any = {};
  cartMsg = ''; cartErr = '';

  revFacilityId = ''; revIsLike = true; revComment = '';
  revMsg = ''; revErr = '';

  athleteStats: any = {};
  statBySport: any[] = [];
  statMonthly: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (!userData) { this.router.navigate(['/login']); return; }
    this.user = JSON.parse(userData);
    if (this.user.role !== 'athlete') { this.router.navigate(['/']); return; }
    this.loadProfile();
    this.loadReservations();
    this.loadTeammatePosts();
    this.loadTrainers();
    this.loadTrainings();
    this.loadEquipment();
    this.loadOrders();
    this.loadStats();
  }

  logout() { localStorage.clear(); this.router.navigate(['/']); }

  setTab(tab: string) { this.activeTab = tab; this.msg = ''; this.err = ''; this.tMsg = ''; this.tErr = ''; this.trnMsg = ''; this.trnErr = ''; this.cartMsg = ''; this.cartErr = ''; this.revMsg = ''; this.revErr = ''; }

  loadProfile() {
    this.api.getAthleteProfile().subscribe({
      next: (res: any) => {
        this.user = res.user;
        this.profileForm = { firstName: res.user.firstName, lastName: res.user.lastName, contactPhone: res.user.contactPhone, favoriteSports: res.user.favoriteSports || [], email: res.user.email };
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) { this.selectedFile = file; const r = new FileReader(); r.onload = () => this.avatarPreview = r.result as string; r.readAsDataURL(file); }
  }

  generateAvatar() {
    const seed = Math.random().toString(36).substring(7);
    this.avatarPreview = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
    fetch(this.avatarPreview).then(r => r.blob()).then(b => { this.selectedFile = new File([b], `avatar-${seed}.svg`, { type: 'image/svg+xml' }); });
  }

  updateProfile() {
    this.msg = ''; this.err = '';
    if (!this.profileForm.firstName?.trim() || !this.profileForm.lastName?.trim() || !this.profileForm.contactPhone?.trim()) {
      this.err = 'Ime, prezime i telefon su obavezni.'; return;
    }
    this.saving = true;
    const fd = new FormData();
    fd.append('firstName', this.profileForm.firstName);
    fd.append('lastName', this.profileForm.lastName);
    fd.append('contactPhone', this.profileForm.contactPhone);
    this.profileForm.favoriteSports.forEach((s: string) => fd.append('favoriteSports', s));
    if (this.selectedFile) fd.append('profileImage', this.selectedFile);

    this.api.updateAthleteProfile(fd).subscribe({
      next: (res: any) => { this.saving = false; this.msg = 'Profil ažuriran!'; this.user = res.user; },
      error: (err) => { this.saving = false; this.err = err.error?.message; }
    });
  }

  loadReservations() {
    this.api.getAthleteReservations().subscribe({
      next: (res: any) => this.reservations = res.reservations || []
    });
  }

  cancelReservation(id: string) {
    this.api.cancelReservation(id).subscribe({
      next: () => { this.msg = 'Rezervacija otkazana'; this.loadReservations(); },
      error: (err) => this.err = err.error?.message
    });
  }

  get sortedReservations() { return [...this.reservations].sort((a: any, b: any) => {
    if (!this.sortResField) return 0;
    let va = '', vb = '';
    if (this.sortResField === 'facilityName') { va = a.facility?.name || ''; vb = b.facility?.name || ''; }
    else if (this.sortResField === 'city') { va = a.facility?.city || ''; vb = b.facility?.city || ''; }
    else if (this.sortResField === 'time') { va = a.startTime; vb = b.startTime; }
    else { va = (a[this.sortResField] || '').toString(); vb = (b[this.sortResField] || '').toString(); }
    return va.localeCompare(vb) * this.sortResDir;
  }); }

  sortResBy(f: string) { if (this.sortResField === f) this.sortResDir *= -1; else { this.sortResField = f; this.sortResDir = 1; } }
  sortResIcon(f: string) { return this.sortResField === f ? (this.sortResDir === 1 ? '↑' : '↓') : '↕'; }

  searchFacilities() {
    const params: any = {};
    if (this.rName) params.name = this.rName;
    if (this.rCity) params.city = this.rCity;
    if (this.rSport) params.sport = this.rSport;
    if (this.rType) params.courtType = this.rType;
    this.api.searchFacilities(params).subscribe({
      next: (res: any) => this.searchResults = res.facilities
    });
  }

  viewFacility(id: string) { this.router.navigate(['/facility', id]); }

  loadTeammatePosts() { this.api.getTeammates().subscribe({ next: (res: any) => this.teammatePosts = res.posts || [] }); }

  createTeammatePost() {
    this.tMsg = ''; this.tErr = '';
    if (!this.tpSport || !this.tpCity?.trim() || !this.tpDate || !this.tpStart || !this.tpEnd) {
      this.tErr = 'Sport, grad, datum i termin su obavezni.'; return;
    }
    this.api.createTeammatePost({
      sport: this.tpSport, city: this.tpCity, date: this.tpDate,
      startTime: this.tpStart, endTime: this.tpEnd,
      missingPlayers: parseInt(this.tpMissing), description: this.tpDesc
    }).subscribe({
      next: () => { this.tMsg = 'Oglas objavljen!'; this.loadTeammatePosts(); },
      error: (err) => this.tErr = err.error?.message
    });
  }

  joinTeammate(id: string) {
    this.api.joinTeammate(id).subscribe({
      next: () => { this.tMsg = 'Zahtev poslat!'; this.loadTeammatePosts(); },
      error: (err) => this.tErr = err.error?.message
    });
  }

  closeTeammate(id: string) {
    this.api.closeTeammate(id).subscribe({
      next: () => { this.tMsg = 'Oglas zatvoren'; this.loadTeammatePosts(); }
    });
  }

  getUserLabel(user: any): string {
    if (!user) return 'Nepoznat';
    if (typeof user === 'string') return user.substring(0, 6);
    return (user.firstName || '') + ' ' + (user.lastName || '') || user.username || user._id?.substring(0, 6) || 'Nepoznat';
  }

  handleJoin(postId: string, userId: string, action: string) {
    this.api.handleTeammateRequest(postId, userId, action).subscribe({
      next: () => this.loadTeammatePosts()
    });
  }

  loadTrainers() { this.api.getTrainers().subscribe({ next: (res: any) => this.trainers = res.trainers || [] }); }
  loadTrainings() { this.api.getAthleteTrainings().subscribe({ next: (res: any) => this.trainings = res.trainings || [] }); }

  openTrainingForm(t: any) {
    this.selectedTrainer = t;
    this.showTrainingForm = true;
    this.trnMsg = ''; this.trnErr = '';
  }

  scheduleTraining() {
    this.trnMsg = ''; this.trnErr = '';
    if (!this.trnSport?.trim() || !this.trnDate || !this.trnStart || !this.trnEnd) {
      this.trnErr = 'Sport, datum i termin su obavezni.'; return;
    }
    this.api.createTraining({
      trainerId: this.selectedTrainer._id,
      facilityId: this.selectedTrainer.facility?._id || this.selectedTrainer.facility,
      sport: this.trnSport, date: this.trnDate, startTime: this.trnStart, endTime: this.trnEnd
    }).subscribe({
      next: () => { this.trnMsg = 'Trening zakazan!'; this.showTrainingForm = false; this.loadTrainings(); },
      error: (err) => this.trnErr = err.error?.message
    });
  }

  loadEquipment() { this.api.getEquipment().subscribe({ next: (res: any) => this.equipment = res.equipment || [] }); }
  loadOrders() { this.api.getAthleteOrders().subscribe({ next: (res: any) => this.orders = res.orders || [] }); }

  addToCart(eq: any) {
    const qty = parseInt(this.cartQuantities[eq._id]);
    if (!qty || qty < 1) return;
    const existing = this.cart.find(i => i.equipmentId === eq._id);
    if (existing) { existing.quantity += qty; }
    else { this.cart.push({ equipmentId: eq._id, name: eq.name, price: eq.price, quantity: qty }); }
    this.cartQuantities[eq._id] = null;
    this.cartMsg = 'Dodato u korpu!';
  }

  get cartTotal() { return this.cart.reduce((s, i) => s + i.price * i.quantity, 0); }

  checkout() {
    this.cartMsg = ''; this.cartErr = '';
    this.api.createOrder(this.cart.map(i => ({ equipmentId: i.equipmentId, quantity: i.quantity }))).subscribe({
      next: () => { this.cartMsg = 'Porudžbina kreirana!'; this.cart = []; this.loadOrders(); this.loadEquipment(); },
      error: (err) => this.cartErr = err.error?.message
    });
  }

  cancelOrder(id: string) {
    this.api.cancelOrder(id).subscribe({
      next: () => { this.cartMsg = 'Porudžbina otkazana'; this.loadOrders(); this.loadEquipment(); }
    });
  }

  addReview() {
    this.revMsg = ''; this.revErr = '';
    if (!this.revFacilityId?.trim()) {
      this.revErr = 'ID objekta je obavezan.'; return;
    }
    this.api.createReview({
      facilityId: this.revFacilityId, isLike: this.revIsLike, comment: this.revComment
    }).subscribe({
      next: () => { this.revMsg = 'Ocena poslata!'; this.revComment = ''; },
      error: (err) => this.revErr = err.error?.message
    });
  }

  loadStats() {
    this.api.getStatistics().subscribe({
      next: (res: any) => {
        this.athleteStats.totalReservations = res.statistics.reservationsBySport?.reduce((s: number, i: any) => s + i.count, 0);
        this.athleteStats.totalSpending = res.statistics.totalSpending;
        this.statBySport = res.statistics.reservationsBySport || [];
        this.statMonthly = res.statistics.monthlyActivity || [];
      }
    });
  }
}
