import express from 'express';
import { Controller } from './controller';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const ctrl = new Controller();

// Multer konfiguracija za upload slika
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = imageTypes.test(file.mimetype);
    if (extname || mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Samo slike su dozvoljene'));
    }
  }
});

const jsonUpload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || path.extname(file.originalname) === '.json') {
      cb(null, true);
    } else {
      cb(new Error('Samo JSON fajlovi su dozvoljeni'));
    }
  }
});

// ==================== AUTH ====================
router.route('/login').post((req, res) => ctrl.login(req, res));
router.route('/register').post(upload.single('profileImage'), (req, res) => ctrl.register(req, res));
router.route('/request-password-reset').post((req, res) => ctrl.requestPasswordReset(req, res));
router.route('/reset-password').post((req, res) => ctrl.resetPassword(req, res));
router.route('/me').post((req, res) => ctrl.getUser(req, res));

// ==================== PUBLIC ====================
router.route('/home').get((req, res) => ctrl.home(req, res));
router.route('/facilities/search').get((req, res) => ctrl.facilitiesSearch(req, res));
router.route('/facilities/:id').get((req, res) => ctrl.facilityDetails(req, res));
router.route('/schedule/:facilityId').get((req, res) => ctrl.schedule(req, res));

// ==================== SPORTISTA ====================
router.route('/athlete/profile').post((req, res) => ctrl.athleteProfile(req, res));
router.route('/athlete/profile/update').post(upload.single('profileImage'), (req, res) => ctrl.updateAthleteProfile(req, res));
router.route('/athlete/reservations').post((req, res) => ctrl.athleteReservations(req, res));
router.route('/athlete/reservations/create').post((req, res) => ctrl.createReservation(req, res));
router.route('/athlete/reservations/:id/cancel').post((req, res) => ctrl.cancelReservation(req, res));
router.route('/athlete/teammates').post((req, res) => ctrl.teammates(req, res));
router.route('/athlete/teammates/create').post((req, res) => ctrl.createTeammatePost(req, res));
router.route('/athlete/teammates/:id/join').post((req, res) => ctrl.joinTeammate(req, res));
router.route('/athlete/teammates/:postId/requests/:userId').post((req, res) => ctrl.handleTeammateRequest(req, res));
router.route('/athlete/teammates/:id/close').post((req, res) => ctrl.closeTeammate(req, res));
router.route('/athlete/trainers').get((req, res) => ctrl.trainers(req, res));
router.route('/athlete/trainings').post((req, res) => ctrl.athleteTrainings(req, res));
router.route('/athlete/trainings/create').post((req, res) => ctrl.createTraining(req, res));
router.route('/athlete/equipment').get((req, res) => ctrl.equipmentList(req, res));
router.route('/athlete/orders').post((req, res) => ctrl.athleteOrders(req, res));
router.route('/athlete/orders/create').post((req, res) => ctrl.createOrder(req, res));
router.route('/athlete/orders/:id/cancel').post((req, res) => ctrl.cancelOrder(req, res));
router.route('/athlete/reviews/create').post((req, res) => ctrl.createReview(req, res));
router.route('/athlete/statistics').post((req, res) => ctrl.statistics(req, res));

// ==================== ZAPOSLENI ====================
router.route('/employee/profile').post((req, res) => ctrl.employeeProfile(req, res));
router.route('/employee/profile/update').post(upload.single('profileImage'), (req, res) => ctrl.updateEmployeeProfile(req, res));
router.route('/employee/facilities').post((req, res) => ctrl.employeeFacilities(req, res));
router.route('/employee/facilities/create').post((req, res) => ctrl.createFacility(req, res));
router.route('/employee/facilities/create-json').post(jsonUpload.single('jsonFile'), (req, res) => ctrl.createFacilityFromJson(req, res));
router.route('/employee/facilities/:id/update').post((req, res) => ctrl.updateFacility(req, res));
router.route('/employee/reservations').post((req, res) => ctrl.employeeReservations(req, res));
router.route('/employee/trainings').post((req, res) => ctrl.employeeTrainings(req, res));
router.route('/employee/reservations/:id/attendance').post((req, res) => ctrl.setAttendance(req, res));
router.route('/employee/reservations/:id/move').post((req, res) => ctrl.moveReservation(req, res));
router.route('/employee/promotions').post((req, res) => ctrl.employeePromotions(req, res));
router.route('/employee/promotions/create').post((req, res) => ctrl.createPromotion(req, res));
router.route('/employee/promotions/:id/update').post((req, res) => ctrl.updatePromotion(req, res));
router.route('/employee/equipment').post((req, res) => ctrl.employeeEquipment(req, res));
router.route('/employee/equipment/create').post((req, res) => ctrl.createEquipment(req, res));
router.route('/employee/equipment/:id/update').post((req, res) => ctrl.updateEquipment(req, res));
router.route('/employee/orders').post((req, res) => ctrl.employeeOrders(req, res));
router.route('/employee/orders/:id/status').post((req, res) => ctrl.setOrderStatus(req, res));
router.route('/employee/trainers-list').post((req, res) => ctrl.employeeTrainersList(req, res));
router.route('/employee/trainers/create').post((req, res) => ctrl.createTrainer(req, res));
router.route('/employee/reports/occupancy/:facilityId').get((req, res) => ctrl.occupancyReport(req, res));
router.route('/employee/reports/equipment/:facilityId').get((req, res) => ctrl.equipmentReport(req, res));

// ==================== ADMIN ====================
router.route('/admin/users').post((req, res) => ctrl.adminUsers(req, res));
router.route('/admin/users/:id').post((req, res) => ctrl.updateUser(req, res));
router.route('/admin/users/:id/delete').post((req, res) => ctrl.deleteUser(req, res));
router.route('/admin/registration-requests').post((req, res) => ctrl.registrationRequests(req, res));
router.route('/admin/registration-requests/:id').post((req, res) => ctrl.handleRegistrationRequest(req, res));
router.route('/admin/facility-requests').post((req, res) => ctrl.facilityRequests(req, res));
router.route('/admin/facility-requests/:id').post((req, res) => ctrl.handleFacilityRequest(req, res));
router.route('/admin/trainers').post((req, res) => ctrl.adminTrainers(req, res));
router.route('/admin/trainers/:id/toggle').post((req, res) => ctrl.toggleTrainer(req, res));
router.route('/admin/sports').post((req, res) => ctrl.adminSports(req, res));
router.route('/admin/sports/create').post((req, res) => ctrl.addSport(req, res));

export default router;
