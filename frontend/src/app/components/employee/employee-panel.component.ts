import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-employee-panel',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './employee-panel.component.html',
  styleUrl: './employee-panel.component.css'
})
export class EmployeePanelComponent implements OnInit {
  activeTab = 'profile';
  user: any = null;
  msg = ''; err = ''; saving = false;
  profileForm: any = { firstName: '', lastName: '', contactPhone: '' };
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  facilities: any[] = [];
  empReservations: any[] = [];
  empTrainings: any[] = [];
  promotions: any[] = [];
  empEquipment: any[] = [];
  empOrders: any[] = [];
  eqUpdate: any = {};

  newFac: any = { name: '', city: '', address: '', description: '', pricePerHour: 0, maxNoShows: 3, courts: [] };
  promoForm: any = { name: '', facilityId: '', sport: '', discountType: 'percentage', discountValue: 0, startDate: '', endDate: '', description: '' };
  eqForm: any = { name: '', sport: '', price: 0, stock: 0, facility: '' };

  calFacilityId = ''; calCourtId = '';
  calCourts: any[] = [];
  calWeekStart = new Date(); calWeekEnd = new Date();
  calWeekDays: any[] = [];
  calHours = Array.from({ length: 15 }, (_, i) => i + 8);
  calReservations: any[] = [];
  calTrainings: any[] = [];
  todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  selectedFacility: any = null;

  dragCard: any = null;
  dragOverDate: Date | null = null;
  dragOverHour: number | null = null;

  reportFacilityId = '';
  reportMonth = new Date().getMonth() + 1;
  reportYear = new Date().getFullYear();
  months = ['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (!userData) { this.router.navigate(['/login']); return; }
    this.user = JSON.parse(userData);
    if (this.user.role !== 'employee') { this.router.navigate(['/']); return; }
    this.loadAll();
  }

  loadAll() {
    this.api.getEmployeeProfile().subscribe({
      next: (res: any) => {
        this.user = res.user;
        this.facilities = res.facilities || [];
        this.profileForm = { firstName: res.user.firstName, lastName: res.user.lastName, contactPhone: res.user.contactPhone };
      }
    });
    this.loadReservations();
    this.loadTrainings();
    this.loadPromotions();
    this.loadEquipment();
    this.loadOrders();
  }

  logout() { localStorage.clear(); this.router.navigate(['/']); }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) { this.selectedFile = file; const r = new FileReader(); r.onload = () => this.avatarPreview = r.result as string; r.readAsDataURL(file); }
  }

  updateProfile() {
    this.saving = true;
    const fd = new FormData();
    fd.append('firstName', this.profileForm.firstName);
    fd.append('lastName', this.profileForm.lastName);
    fd.append('contactPhone', this.profileForm.contactPhone);
    if (this.selectedFile) fd.append('profileImage', this.selectedFile);
    this.api.updateEmployeeProfile(fd).subscribe({
      next: () => { this.saving = false; this.msg = 'Profil ažuriran'; },
      error: (err) => { this.saving = false; this.err = err.error?.message; }
    });
  }

  createFacility() {
    this.api.createFacility(this.newFac).subscribe({
      next: () => { this.msg = 'Objekat kreiran (čeka odobrenje)'; this.newFac = { name: '', city: '', address: '', description: '', pricePerHour: 0, maxNoShows: 3, courts: [] }; this.loadAll(); },
      error: (err) => this.err = err.error?.message
    });
  }

  onJsonFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('jsonFile', file);
    this.api.createFacilityFromJson(fd).subscribe({
      next: () => { this.msg = 'Objekat uvezen iz JSON-a'; this.loadAll(); },
      error: (err) => this.err = err.error?.message
    });
  }

  loadReservations() {
    this.api.getEmployeeReservations().subscribe({
      next: (res: any) => this.empReservations = res.reservations || []
    });
  }

  loadTrainings() {
    this.api.getEmployeeTrainings().subscribe({
      next: (res: any) => this.empTrainings = res.trainings || []
    });
  }

  canConfirmAttendance(r: any): boolean {
    if (r.attendanceStatus !== 'pending') return false;
    const [h, m] = r.startTime.split(':').map(Number);
    const start = new Date(r.date); start.setHours(h, m, 0, 0);
    const diffMin = (new Date().getTime() - start.getTime()) / 60000;
    return diffMin >= 0 && diffMin <= 10;
  }

  setAttendance(id: string, status: string) {
    this.api.setAttendance(id, status).subscribe({
      next: () => { this.msg = status === 'confirmed' ? 'Dolazak potvrđen' : 'Nedolazak zabeležen'; this.loadReservations(); },
      error: (err) => this.err = err.error?.message
    });
  }

  loadPromotions() {
    this.api.getEmployeePromotions().subscribe({
      next: (res: any) => this.promotions = res.promotions || []
    });
  }

  createPromotion() {
    this.api.createPromotion(this.promoForm).subscribe({
      next: () => { this.msg = 'Promocija kreirana'; this.loadPromotions(); },
      error: (err) => this.err = err.error?.message
    });
  }

  loadEquipment() {
    this.api.getEmployeeEquipment().subscribe({
      next: (res: any) => this.empEquipment = res.equipment || []
    });
  }

  createEquipment() {
    this.api.createEquipment(this.eqForm).subscribe({
      next: () => { this.msg = 'Oprema dodata'; this.loadEquipment(); },
      error: (err) => this.err = err.error?.message
    });
  }

  updateEquipment(id: string, price: number, stock: number) {
    const update: any = {};
    if (price != null) update.price = price;
    if (stock != null) update.stock = stock;
    this.api.updateEquipmentItem(id, update).subscribe({
      next: () => { this.msg = 'Oprema ažurirana'; this.loadEquipment(); }
    });
  }

  loadOrders() {
    this.api.getEmployeeOrders().subscribe({
      next: (res: any) => this.empOrders = res.orders || []
    });
  }

  setOrderStatus(id: string, status: string) {
    this.api.setOrderStatus(id, status).subscribe({
      next: () => { this.msg = 'Status ažuriran'; this.loadOrders(); }
    });
  }

  onFacilitySelect() {
    this.selectedFacility = this.facilities.find(f => f._id === this.calFacilityId);
    this.calCourts = this.selectedFacility?.courts?.filter((c: any) => c.isActive) || [];
    this.calCourtId = '';
    this.setCalWeek(new Date());
  }

  loadCalendarData() {
    if (!this.calFacilityId || !this.calCourtId) return;
    this.api.getSchedule(this.calFacilityId, this.calCourtId, this.calWeekStart.toISOString()).subscribe({
      next: (res: any) => { this.calReservations = res.reservations || []; this.calTrainings = res.trainings || []; }
    });
  }

  setCalWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    this.calWeekStart = new Date(d.setDate(diff)); this.calWeekStart.setHours(0,0,0,0);
    this.calWeekEnd = new Date(this.calWeekStart); this.calWeekEnd.setDate(this.calWeekEnd.getDate() + 6);
    const dani = ['Pon','Uto','Sre','Čet','Pet','Sub','Ned'];
    this.calWeekDays = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(this.calWeekStart); dayDate.setDate(dayDate.getDate() + i);
      this.calWeekDays.push({ label: dani[i], dateStr: `${dayDate.getDate()}.${dayDate.getMonth()+1}.`, date: dayDate });
    }
    this.loadCalendarData();
  }

  calToday() { this.setCalWeek(new Date()); }
  calPrevWeek() { const d = new Date(this.calWeekStart); d.setDate(d.getDate() - 7); this.setCalWeek(d); }
  calNextWeek() { const d = new Date(this.calWeekStart); d.setDate(d.getDate() + 7); this.setCalWeek(d); }

  getSlotCard(date: Date, hour: number): any {
    const slotStart = `${String(hour).padStart(2,'0')}:00`;
    const r = this.calReservations.find((r: any) => new Date(r.date).toDateString() === date.toDateString() && r.startTime === slotStart);
    if (r) return { type: 'reservation', startTime: r.startTime, endTime: r.endTime, id: r._id };
    const t = this.calTrainings.find((t: any) => new Date(t.date).toDateString() === date.toDateString() && t.startTime === slotStart);
    if (t) return { type: 'training', startTime: t.startTime, endTime: t.endTime, id: t._id };
    return null;
  }

  onDragStart(event: DragEvent, card: any) { this.dragCard = card; event.dataTransfer!.effectAllowed = 'move'; }
  onDragOver(event: DragEvent, date: Date, hour: number) { event.preventDefault(); this.dragOverDate = date; this.dragOverHour = hour; }
  onDragLeave() { this.dragOverDate = null; this.dragOverHour = null; }

  onDrop(event: DragEvent, date: Date, hour: number) {
    event.preventDefault();
    this.dragOverDate = null; this.dragOverHour = null;
    if (!this.dragCard) return;
    const slotStart = `${String(hour).padStart(2,'0')}:00`;
    const slotEnd = `${String(hour+1).padStart(2,'0')}:00`;
    const taken = this.calReservations.some((r: any) => new Date(r.date).toDateString() === date.toDateString() && r.startTime < slotEnd && r.endTime > slotStart)
      || this.calTrainings.some((t: any) => new Date(t.date).toDateString() === date.toDateString() && t.startTime < slotEnd && t.endTime > slotStart);
    if (taken) { this.err = 'Ciljni termin je zauzet!'; return; }
    const newDate = date;
    const newStart = slotStart;
    const duration = this.getDuration(this.dragCard.startTime, this.dragCard.endTime);
    const newEnd = `${String(hour + duration).padStart(2,'0')}:00`;
    if (this.dragCard.type === 'reservation') {
      this.api.moveReservation(this.dragCard.id, { date: newDate, startTime: newStart, endTime: newEnd }).subscribe({
        next: () => { this.msg = 'Rezervacija pomerena'; this.loadCalendarData(); },
        error: () => this.loadCalendarData()
      });
    }
    this.dragCard = null;
  }

  getDuration(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em - sh * 60 - sm) / 60;
  }

  downloadOccupancyReport() {
    this.api.getOccupancyReport(this.reportFacilityId, this.reportMonth, this.reportYear).subscribe({
      next: (html: string) => {
        const w = window.open('', '_blank')!;
        w.document.write(html); w.document.close();
      }
    });
  }

  downloadEquipmentReport() {
    this.api.getEquipmentReport(this.reportFacilityId, this.reportMonth, this.reportYear).subscribe({
      next: (html: string) => {
        const w = window.open('', '_blank')!;
        w.document.write(html); w.document.close();
      }
    });
  }

  formatDate(d: Date) { return d.toLocaleDateString('sr', { day: 'numeric', month: 'long', year: 'numeric' }); }
}
