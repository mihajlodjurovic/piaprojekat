import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

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

  selectedCourt: any = null;
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
  }

  loadFacility() {
    this.api.getFacilityDetails(this.facilityId).subscribe({
      next: (res: any) => {
        this.facility = res.facility;
        this.courts = res.courts;
        this.reviews = res.reviews;
      }
    });
  }

  selectCourt(court: any) {
    this.selectedCourt = court;
    this.selectedSlot = null;
    this.reservationMsg = '';
    this.loadSchedule(court._id);
  }

  loadSchedule(courtId: string) {
    this.api.getSchedule(this.facilityId, courtId, this.weekStart.toISOString()).subscribe({
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
    if (this.selectedCourt) this.loadSchedule(this.selectedCourt._id);
  }

  nextWeek() {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() + 7);
    this.setWeek(d);
    if (this.selectedCourt) this.loadSchedule(this.selectedCourt._id);
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
      next: () => {
        this.reserving = false; this.reservationOk = true;
        this.reservationMsg = '✅ Termin uspešno rezervisan!';
        this.selectedSlot = null;
        this.loadSchedule(this.selectedCourt._id);
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
