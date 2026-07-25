import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);
  uri = 'http://localhost:4000/api';

  // Helper: add userId to body (for "auth")
  private withUser(body: any): any {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return { ...body, userId: user._id || null };
  }

  // Helper: add userId to params
  private paramsWithUser(params: any = {}): any {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return { ...params, userId: user._id || null };
  }

  // ==================== AUTH ====================

  login(username: string, password: string) {
    return this.http.post<any>(`${this.uri}/login`, { username, password });
  }

  register(formData: FormData) {
    return this.http.post<any>(`${this.uri}/register`, formData);
  }

  requestPasswordReset(email: string) {
    return this.http.post<any>(`${this.uri}/request-password-reset`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<any>(`${this.uri}/reset-password`, { token, password });
  }

  // ==================== PUBLIC ====================

  getHome() {
    return this.http.get<any>(`${this.uri}/home`);
  }

  searchFacilities(params: any) {
    return this.http.get<any>(`${this.uri}/facilities/search`, { params });
  }

  getFacilityDetails(id: string) {
    return this.http.get<any>(`${this.uri}/facilities/${id}`);
  }

  getSchedule(facilityId: string, courtName: string, weekStart: string) {
    return this.http.get<any>(`${this.uri}/schedule/${facilityId}`, { params: { weekStart, courtName } });
  }

  // ==================== ATHLETE ====================

  getAthleteProfile() {
    return this.http.post<any>(`${this.uri}/athlete/profile`, this.withUser({}));
  }

  updateAthleteProfile(formData: FormData) {
    formData.append('userId', JSON.parse(localStorage.getItem('user') || '{}')._id || '');
    return this.http.post<any>(`${this.uri}/athlete/profile/update`, formData);
  }

  getAthleteReservations() {
    return this.http.post<any>(`${this.uri}/athlete/reservations`, this.withUser({}));
  }

  createReservation(data: any) {
    return this.http.post<any>(`${this.uri}/athlete/reservations/create`, this.withUser(data));
  }

  cancelReservation(id: string) {
    return this.http.post<any>(`${this.uri}/athlete/reservations/${id}/cancel`, this.withUser({}));
  }

  getTeammates() {
    return this.http.post<any>(`${this.uri}/athlete/teammates`, this.withUser({}));
  }

  createTeammatePost(data: any) {
    return this.http.post<any>(`${this.uri}/athlete/teammates/create`, this.withUser(data));
  }

  joinTeammate(postId: string) {
    return this.http.post<any>(`${this.uri}/athlete/teammates/${postId}/join`, this.withUser({}));
  }

  handleTeammateRequest(postId: string, userId: string, action: string) {
    return this.http.post<any>(`${this.uri}/athlete/teammates/${postId}/requests/${userId}`,
      this.withUser({ action }));
  }

  closeTeammate(postId: string) {
    return this.http.post<any>(`${this.uri}/athlete/teammates/${postId}/close`, this.withUser({}));
  }

  getTrainers(params?: any) {
    return this.http.get<any>(`${this.uri}/athlete/trainers`, { params });
  }

  getAthleteTrainings() {
    return this.http.post<any>(`${this.uri}/athlete/trainings`, this.withUser({}));
  }

  createTraining(data: any) {
    return this.http.post<any>(`${this.uri}/athlete/trainings/create`, this.withUser(data));
  }

  getEquipment(params?: any) {
    return this.http.get<any>(`${this.uri}/athlete/equipment`, { params });
  }

  getAthleteOrders() {
    return this.http.post<any>(`${this.uri}/athlete/orders`, this.withUser({}));
  }

  createOrder(items: any[]) {
    return this.http.post<any>(`${this.uri}/athlete/orders/create`, this.withUser({ items }));
  }

  cancelOrder(id: string) {
    return this.http.post<any>(`${this.uri}/athlete/orders/${id}/cancel`, this.withUser({}));
  }

  createReview(data: any) {
    return this.http.post<any>(`${this.uri}/athlete/reviews/create`, this.withUser(data));
  }

  getStatistics() {
    return this.http.post<any>(`${this.uri}/athlete/statistics`, this.withUser({}));
  }

  // ==================== EMPLOYEE ====================

  getEmployeeProfile() {
    return this.http.post<any>(`${this.uri}/employee/profile`, this.withUser({}));
  }

  updateEmployeeProfile(formData: FormData) {
    formData.append('userId', JSON.parse(localStorage.getItem('user') || '{}')._id || '');
    return this.http.post<any>(`${this.uri}/employee/profile/update`, formData);
  }

  getEmployeeFacilities() {
    return this.http.post<any>(`${this.uri}/employee/facilities`, this.withUser({}));
  }

  createFacility(data: any) {
    return this.http.post<any>(`${this.uri}/employee/facilities/create`, this.withUser(data));
  }

  createFacilityFromJson(formData: FormData) {
    formData.append('userId', JSON.parse(localStorage.getItem('user') || '{}')._id || '');
    return this.http.post<any>(`${this.uri}/employee/facilities/create-json`, formData);
  }

  updateFacility(id: string, data: any) {
    return this.http.post<any>(`${this.uri}/employee/facilities/${id}/update`, this.withUser(data));
  }

  getEmployeeReservations() {
    return this.http.post<any>(`${this.uri}/employee/reservations`, this.withUser({}));
  }

  getEmployeeTrainings() {
    return this.http.post<any>(`${this.uri}/employee/trainings`, this.withUser({}));
  }

  setAttendance(reservationId: string, attendance: string) {
    return this.http.post<any>(`${this.uri}/employee/reservations/${reservationId}/attendance`,
      this.withUser({ attendance }));
  }

  moveReservation(reservationId: string, data: any) {
    return this.http.post<any>(`${this.uri}/employee/reservations/${reservationId}/move`,
      this.withUser(data));
  }

  getEmployeePromotions() {
    return this.http.post<any>(`${this.uri}/employee/promotions`, this.withUser({}));
  }

  createPromotion(data: any) {
    return this.http.post<any>(`${this.uri}/employee/promotions/create`, this.withUser(data));
  }

  updatePromotion(id: string, data: any) {
    return this.http.post<any>(`${this.uri}/employee/promotions/${id}/update`, this.withUser(data));
  }

  getEmployeeEquipment() {
    return this.http.post<any>(`${this.uri}/employee/equipment`, this.withUser({}));
  }

  createEquipment(data: any) {
    return this.http.post<any>(`${this.uri}/employee/equipment/create`, this.withUser(data));
  }

  updateEquipmentItem(id: string, data: any) {
    return this.http.post<any>(`${this.uri}/employee/equipment/${id}/update`, this.withUser(data));
  }

  getEmployeeOrders() {
    return this.http.post<any>(`${this.uri}/employee/orders`, this.withUser({}));
  }

  setOrderStatus(orderId: string, status: string) {
    return this.http.post<any>(`${this.uri}/employee/orders/${orderId}/status`,
      this.withUser({ status }));
  }

  getEmployeeTrainersList() {
    return this.http.post<any>(`${this.uri}/employee/trainers-list`, this.withUser({}));
  }

  createTrainer(data: any) {
    return this.http.post<any>(`${this.uri}/employee/trainers/create`, this.withUser(data));
  }

  getOccupancyReport(facilityId: string, month: number, year: number) {
    return this.http.get(`${this.uri}/employee/reports/occupancy/${facilityId}`,
      { params: { month, year }, responseType: 'text' });
  }

  getEquipmentReport(facilityId: string, month: number, year: number) {
    return this.http.get(`${this.uri}/employee/reports/equipment/${facilityId}`,
      { params: { month, year }, responseType: 'text' });
  }

  // ==================== ADMIN ====================

  getAdminUsers() {
    return this.http.post<any>(`${this.uri}/admin/users`, this.withUser({}));
  }

  updateAdminUser(id: string, data: any) {
    return this.http.post<any>(`${this.uri}/admin/users/${id}`, this.withUser(data));
  }

  deleteAdminUser(id: string) {
    return this.http.post<any>(`${this.uri}/admin/users/${id}/delete`, this.withUser({}));
  }

  getRegistrationRequests() {
    return this.http.post<any>(`${this.uri}/admin/registration-requests`, this.withUser({}));
  }

  handleRegistrationRequest(id: string, action: string, reason?: string) {
    return this.http.post<any>(`${this.uri}/admin/registration-requests/${id}`,
      this.withUser({ action, reason }));
  }

  getFacilityRequests() {
    return this.http.post<any>(`${this.uri}/admin/facility-requests`, this.withUser({}));
  }

  handleFacilityRequest(id: string, action: string, reason?: string) {
    return this.http.post<any>(`${this.uri}/admin/facility-requests/${id}`,
      this.withUser({ action, reason }));
  }

  getAdminTrainers() {
    return this.http.post<any>(`${this.uri}/admin/trainers`, this.withUser({}));
  }

  toggleTrainer(id: string) {
    return this.http.post<any>(`${this.uri}/admin/trainers/${id}/toggle`, this.withUser({}));
  }

  getAdminSports() {
    return this.http.post<any>(`${this.uri}/admin/sports`, this.withUser({}));
  }

  addSport(name: string) {
    return this.http.post<any>(`${this.uri}/admin/sports/create`, this.withUser({ name }));
  }
}
