import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  stats = { totalFacilities: 0 };
  topFacilities: any[] = [];
  promotions: any[] = [];
  sports: any[] = [];
  cities: string[] = [];

  searchName = '';
  searchCities: string[] = [];
  searchSport = '';
  searchCourtType = '';
  searching = false;
  searchResults: any[] | null = null;

  sortField = ''; sortDir = 1;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getHome().subscribe({
      next: (res: any) => {
        this.stats = res.stats;
        this.topFacilities = res.topFacilities;
        this.promotions = res.promotions;
        this.sports = res.sports;
        this.cities = res.cities;
      }
    });
  }

  search() {
    const params: any = {};
    if (this.searchName) params.name = this.searchName;
    if (this.searchCities.length > 0) params.city = this.searchCities.join(',');
    if (this.searchSport) params.sport = this.searchSport;
    if (this.searchCourtType) params.courtType = this.searchCourtType;

    this.searching = true;
    this.api.searchFacilities(params).subscribe({
      next: (res: any) => { this.searchResults = res.facilities; this.searching = false; },
      error: () => { this.searching = false; }
    });
  }

  sortBy(field: string) {
    if (this.sortField === field) { this.sortDir *= -1; }
    else { this.sortField = field; this.sortDir = 1; }
    if (this.searchResults) {
      this.searchResults.sort((a: any, b: any) => {
        const valA = field === 'sport' ? this.getSportsList(a) : (a[field] || '').toString().toLowerCase();
        const valB = field === 'sport' ? this.getSportsList(b) : (b[field] || '').toString().toLowerCase();
        return valA.localeCompare(valB) * this.sortDir;
      });
    }
  }

  sortIcon(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 1 ? '↑' : '↓';
  }

  getSportsList(f: any): string {
    const sports = f.courts?.map((c: any) => c.sport) || [];
    return [...new Set(sports)].join(', ');
  }
}
