import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import * as L from 'leaflet';

// Fix Leaflet default marker icons (Angular ne resolve-uje relativne putanje iz CSS-a)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-facility-details',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './facility-details.component.html',
  styleUrl: './facility-details.component.css'
})
export class FacilityDetailsComponent implements OnInit {
  facilityId = '';
  facility: any = null;
  courts: any[] = [];
  reviews: any[] = [];
  currentUserId = '';
  map: any = null;

  selectedCourt: any = null;
  courtGroup: any[] = [];
  courtGroupIdx = 0;
  weekStart = new Date();
  weekEnd = new Date();
  weekDays: { label: string; dateStr: string; date: Date }[] = [];
  hours: number[] = Array.from({ length: 15 }, (_, i) => i + 8);
  reservations: any[] = [];
  trainings: any[] = [];
  selectedSlot: { date: Date; hour: number } | null = null;
  reserving = false;
  reservationMsg = '';
  reservationOk = false;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.facilityId = this.route.snapshot.paramMap.get('id')!;
    this.setWeek(new Date());
    this.loadFacility();
    const u = localStorage.getItem('user');
    if (u) this.currentUserId = JSON.parse(u)._id || '';
  }

  // leaflet mapa — inicijalizuje se sa malim delay-em zbog DOM-a
  initMap() {
    if (!this.facility?.location || this.map) return;
    const { latitude, longitude } = this.facility.location;
    setTimeout(() => {
      this.map = L.map('facility-map').setView([latitude, longitude], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map);
      L.marker([latitude, longitude]).addTo(this.map)
        .bindPopup(this.facility.name).openPopup();
    }, 300);
  }

  loadFacility() {
    this.api.getFacilityDetails(this.facilityId).subscribe({
      next: (res: any) => {
        this.facility = res.facility;
        this.courts = res.courts;
        this.reviews = res.reviews;
        this.initMap();
      }
    });
  }

  isOwnReview(r: any): boolean {
    return r.user?._id === this.currentUserId || r.user === this.currentUserId;
  }

  // grupise terene po sportu+tipu — koristi se za rotaciju strelicama
  getCourtGroups(): { sport: string; courts: any[] }[] {
    const map = new Map<string, any[]>();
    for (const c of this.courts) {
      const key = c.sport + '|' + c.type;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries()).map(([key, courts]) => {
      const [sport, type] = key.split('|');
      return { sport, type, courts };
    });
  }

  selectCourt(court: any) {
    this.selectedCourt = court;
    this.courtGroup = [court];
    this.courtGroupIdx = 0;
    // Pronađi grupu istog tipa za rotaciju
    for (const g of this.getCourtGroups()) {
      const idx = g.courts.findIndex((c: any) => c._id === court._id);
      if (idx !== -1) { this.courtGroup = g.courts; this.courtGroupIdx = idx; break; }
    }
    this.selectedSlot = null;
    this.reservationMsg = '';
    this.loadSchedule(court.name);
  }

  prevCourt() {
    if (this.courtGroup.length <= 1) return;
    this.courtGroupIdx = (this.courtGroupIdx - 1 + this.courtGroup.length) % this.courtGroup.length;
    this.selectedCourt = this.courtGroup[this.courtGroupIdx];
    this.selectedSlot = null;
    this.reservationMsg = '';
    this.loadSchedule(this.selectedCourt.name);
  }

  nextCourt() {
    if (this.courtGroup.length <= 1) return;
    this.courtGroupIdx = (this.courtGroupIdx + 1) % this.courtGroup.length;
    this.selectedCourt = this.courtGroup[this.courtGroupIdx];
    this.selectedSlot = null;
    this.reservationMsg = '';
    this.loadSchedule(this.selectedCourt.name);
  }

  loadSchedule(courtName: string) {
    this.api.getSchedule(this.facilityId, courtName, this.weekStart.toISOString()).subscribe({
      next: (res: any) => {
        this.reservations = res.reservations || [];
        this.trainings = res.trainings || [];
      }
    });
  }

  setWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    this.weekStart = new Date(d.setDate(diff));
    this.weekStart.setHours(0, 0, 0, 0);
    this.weekEnd = new Date(this.weekStart);
    this.weekEnd.setDate(this.weekEnd.getDate() + 6);

    const dani = ['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED'];
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(this.weekStart);
      dayDate.setDate(dayDate.getDate() + i);
      this.weekDays.push({
        label: dani[i],
        dateStr: `${dayDate.getDate()}. ${dayDate.toLocaleDateString('sr', { month: 'short' })}`,
        date: dayDate
      });
    }
  }

  prevWeek() {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() - 7);
    this.setWeek(d);
    if (this.selectedCourt) this.loadSchedule(this.selectedCourt.name);
  }

  nextWeek() {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() + 7);
    this.setWeek(d);
    if (this.selectedCourt) this.loadSchedule(this.selectedCourt.name);
  }

  isSlotTaken(date: Date, hour: number): boolean {
    const slotStart = `${String(hour).padStart(2, '0')}:00`;
    const slotEnd = `${String(hour + 1).padStart(2, '0')}:00`;

    return this.reservations.some((r: any) => {
      const rDate = new Date(r.date);
      return rDate.toDateString() === date.toDateString() &&
        r.startTime < slotEnd && r.endTime > slotStart;
    }) || this.trainings.some((t: any) => {
      const tDate = new Date(t.date);
      return tDate.toDateString() === date.toDateString() &&
        t.startTime < slotEnd && t.endTime > slotStart;
    });
  }

  getCellClass(date: Date, hour: number): string {
    if (this.selectedSlot && this.selectedSlot.date.toDateString() === date.toDateString() && this.selectedSlot.hour === hour) {
      return 'cell-selected';
    }
    if (this.isSlotTaken(date, hour)) return 'cell-taken';
    return 'cell-free';
  }

  selectSlot(date: Date, hour: number) {
    if (this.isSlotTaken(date, hour)) return;
    this.selectedSlot = { date, hour };
    this.reservationMsg = '';
  }

  makeReservation() {
    if (!this.selectedSlot) return;
    const user = localStorage.getItem('user');
    if (!user) {
      this.reservationMsg = 'Morate biti prijavljeni da rezervišete termin.';
      this.reservationOk = false;
      return;
    }

    this.reserving = true;
    const hour = String(this.selectedSlot.hour).padStart(2, '0');
    this.api.createReservation({
      facilityId: this.facilityId,
      courtId: this.selectedCourt._id,
      courtName: this.selectedCourt.name,
      sport: this.selectedCourt.sport,
      date: this.selectedSlot.date,
      startTime: `${hour}:00`,
      endTime: `${String(this.selectedSlot.hour + 1).padStart(2, '0')}:00`
    }).subscribe({
      next: (res: any) => {
        this.reserving = false;
        if (res.message === 'OK') {
          this.reservationOk = true;
          this.reservationMsg = '✅ Termin uspešno rezervisan!';
          this.selectedSlot = null;
          this.loadSchedule(this.selectedCourt.name);
        } else {
          this.reservationOk = false;
          this.reservationMsg = res.message || 'Greška pri rezervaciji';
        }
      },
      error: (err) => {
        this.reserving = false; this.reservationOk = false;
        this.reservationMsg = err.error?.message || 'Greška pri rezervaciji';
      }
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('sr', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
