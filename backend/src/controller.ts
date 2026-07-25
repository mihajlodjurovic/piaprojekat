import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from './models/user';
import SportFacilityModel from './models/sportFacility';
import ReservationModel from './models/reservation';
import ReviewModel from './models/review';
import TeammatePostModel from './models/teammatePost';
import TrainingModel from './models/training';
import TrainerModel from './models/trainer';
import EquipmentModel from './models/equipment';
import OrderModel from './models/order';
import PromotionModel from './models/promotion';
import SportModel from './models/sport';

// Helper: dobavi ulogovanog korisnika iz localStorage ID-a (salje se u body/query)
function getUserId(req: Request): string | null {
  // Korisnicki ID se salje u body, query, ili header-u
  return req.body.userId || req.query.userId || req.headers['x-user-id'] as string || null;
}

export class Controller {

  // ==================== AUTH / REGISTRACIJA ====================

  login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password)
        return res.json({ message: 'Unesite korisničko ime i lozinku' });

      const user = await UserModel.findOne({ username });
      if (!user)
        return res.json({ message: 'Pogrešno korisničko ime ili lozinka' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.json({ message: 'Pogrešno korisničko ime ili lozinka' });

      if (user.approvalStatus !== 'approved')
        return res.json({ message: 'Nalog još nije odobren' });

      if (!user.isActive)
        return res.json({ message: 'Nalog je deaktiviran' });

      res.json(user);
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { username, email, password, firstName, lastName, contactPhone, role,
              favoriteSports, facilityName, facilityAddress, registrationNumber, pib } = req.body;

      const existing = await UserModel.findOne({ $or: [{ email }, { username }] });
      if (existing)
        return res.json({ message: 'Email ili korisničko ime već postoji' });

      if (!['athlete', 'employee'].includes(role))
        return res.json({ message: 'Nevalidna uloga' });

      if (role === 'employee') {
        if (!facilityName || !facilityAddress || !registrationNumber || !pib)
          return res.json({ message: 'Sva polja za zaposlenog su obavezna' });

        if (!/^\d{8}$/.test(registrationNumber))
          return res.json({ message: 'Matični broj mora imati tačno 8 cifara' });

        if (!/^[1-9]\d{8}$/.test(pib))
          return res.json({ message: 'PIB mora imati tačno 9 cifara i ne sme počinjati nulom' });

        const count = await UserModel.countDocuments({
          role: 'employee', facilityName, approvalStatus: 'approved'
        });
        if (count >= 2)
          return res.json({ message: 'Objekat već ima max 2 zaposlena' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userData: any = {
        username, email, password: hashedPassword, firstName, lastName, contactPhone, role,
        profileImage: req.file ? req.file.filename : 'default-avatar.png',
        approvalStatus: 'pending',
        favoriteSports: role === 'athlete' ? (Array.isArray(favoriteSports) ? favoriteSports.slice(0, 5) : []) : []
      };

      if (role === 'employee') {
        userData.facilityName = facilityName;
        userData.facilityAddress = facilityAddress;
        userData.registrationNumber = registrationNumber;
        userData.pib = pib;
      }

      await UserModel.create(userData);
      res.json({ message: 'OK' });
    } catch (err: any) {
      if (err.name === 'ValidationError')
        return res.json({ message: Object.values(err.errors).map((e: any) => e.message).join('. ') });
      if (err.code === 11000)
        return res.json({ message: 'Korisničko ime ili email već postoji' });
      res.json({ message: err.message });
    }
  };

  requestPasswordReset = async (req: Request, res: Response) => {
    try {
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) return res.json({ message: 'Ako email postoji, link je poslat' });

      // Generisi prost token
      const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      res.json({ message: 'OK', resetToken });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user)
        return res.json({ message: 'Token nevalidan ili istekao' });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'OK' });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  getUser = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.json(null);
      const user = await UserModel.findById(userId);
      res.json(user);
    } catch (err: any) {
      res.json(null);
    }
  };

  // ==================== PUBLIC ====================

  home = async (req: Request, res: Response) => {
    try {
      const total = await SportFacilityModel.countDocuments({ isActive: true, approvalStatus: 'approved' });
      const top = await SportFacilityModel.find({ isActive: true, approvalStatus: 'approved' })
        .sort({ likes: -1 }).limit(3).select('name city mainImage likes dislikes');
      const promos = await PromotionModel.find({ isActive: true, endDate: { $gte: new Date() } })
        .populate('facility', 'name city').sort({ startDate: -1 }).limit(3);
      const sports = await SportModel.find({ isActive: true }).select('name');
      const cities = await SportFacilityModel.distinct('city', { isActive: true, approvalStatus: 'approved' });

      res.json({ stats: { totalFacilities: total }, topFacilities: top, promotions: promos, sports, cities });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  facilitiesSearch = async (req: Request, res: Response) => {
    try {
      const { name, city, sport, courtType } = req.query;
      const filter: any = { isActive: true, approvalStatus: 'approved' };
      if (name) filter.name = { $regex: name, $options: 'i' };
      if (city) filter.city = { $in: (city as string).split(',').map(c => c.trim()) };
      if (sport) filter['courts.sport'] = { $regex: sport, $options: 'i' };
      if (courtType) filter['courts.type'] = courtType;

      const facilities = await SportFacilityModel.find(filter)
        .select('name city address mainImage likes dislikes courts').sort({ likes: -1 });
      res.json({ facilities, count: facilities.length });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  facilityDetails = async (req: Request, res: Response) => {
    try {
      const facility = await SportFacilityModel.findById(req.params.id);
      if (!facility || !facility.isActive)
        return res.json({ message: 'Objekat nije pronađen' });

      const reviews = await ReviewModel.find({ facility: req.params.id })
        .populate('user', 'username firstName lastName').sort({ createdAt: -1 }).limit(5);
      const courts = facility.courts.filter(c => c.isActive);

      res.json({ facility, courts, reviews });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  schedule = async (req: Request, res: Response) => {
    try {
      const { facilityId, courtId } = req.params;
      const startDate = new Date(req.query.weekStart as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      const facility = await SportFacilityModel.findById(facilityId);
      if (!facility) return res.json({ message: 'Objekat nije pronađen' });
      const court = facility.courts.id(courtId);
      if (!court) return res.json({ message: 'Teren nije pronađen' });

      const reservations = await ReservationModel.find({
        facility: facilityId, courtId, date: { $gte: startDate, $lt: endDate }, status: 'active'
      }).select('date startTime endTime');

      const trainings = await TrainingModel.find({
        facility: facilityId, courtId, date: { $gte: startDate, $lt: endDate }, status: { $ne: 'cancelled' }
      }).select('date startTime endTime');

      res.json({ court: { id: court._id, name: court.name, sport: court.sport, type: court.type },
                 reservations, trainings, weekStart: startDate, weekEnd: endDate });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== SPORTISTA ====================

  athleteProfile = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      res.json({ user });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  updateAthleteProfile = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const updateData: any = {};
      if (req.body.firstName) updateData.firstName = req.body.firstName;
      if (req.body.lastName) updateData.lastName = req.body.lastName;
      if (req.body.contactPhone) updateData.contactPhone = req.body.contactPhone;
      if (req.body.favoriteSports) {
        const sports = Array.isArray(req.body.favoriteSports) ? req.body.favoriteSports : [];
        if (sports.length > 5) return res.json({ message: 'Max 5 sportova' });
        updateData.favoriteSports = sports;
      }
      if (req.file) updateData.profileImage = req.file.filename;

      const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
      res.json({ user });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  athleteReservations = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const reservations = await ReservationModel.find({ user: userId })
        .populate('facility', 'name city').sort({ date: -1 });

      const result = reservations.map(r => {
        const obj: any = r.toObject();
        const now = new Date();
        const [h, m] = r.startTime.split(':').map(Number);
        const startDateTime = new Date(r.date);
        startDateTime.setHours(h, m, 0, 0);
        const hoursUntil = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        obj.canCancel = hoursUntil >= 12 && r.status === 'active';
        return obj;
      });

      res.json({ reservations: result });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  createReservation = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { facilityId, courtId, date, startTime, endTime } = req.body;

      // Provera blokade
      const user = await UserModel.findById(userId);
      const block = user?.blockedFacilities?.find(
        (b: any) => b.facility.toString() === facilityId
      );
      if (block) {
        const facility = await SportFacilityModel.findById(facilityId);
        if (facility && block.noShowCount >= facility.maxNoShows)
          return res.json({ message: 'Blokirani ste u ovom objektu' });
      }

      const facility = await SportFacilityModel.findById(facilityId);
      if (!facility) return res.json({ message: 'Objekat nije pronađen' });

      const court = facility.courts.id(courtId);
      if (!court || !court.isActive)
        return res.json({ message: 'Teren nije pronađen' });

      // Provera preklapanja
      const rDate = new Date(date);
      const dayStart = new Date(rDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(new Date(rDate).setHours(23, 59, 59, 999));
      const overlaps = await ReservationModel.find({
        facility: facilityId, courtId,
        date: { $gte: dayStart, $lt: dayEnd },
        status: 'active',
        startTime: { $lt: endTime }, endTime: { $gt: startTime }
      });
      if (overlaps.length > 0)
        return res.json({ message: 'Termin je već zauzet' });

      const reservation = await ReservationModel.create({
        user: userId, facility: facilityId, courtId, courtName: court.name,
        sport: court.sport, date: new Date(date), startTime, endTime, status: 'active'
      });

      res.json({ message: 'OK', reservation });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  cancelReservation = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const reservation = await ReservationModel.findOne({ _id: req.params.id, user: userId });
      if (!reservation) return res.json({ message: 'Rezervacija nije pronađena' });

      const now = new Date();
      const [h, m] = reservation.startTime.split(':').map(Number);
      const startDateTime = new Date(reservation.date);
      startDateTime.setHours(h, m, 0, 0);
      const hoursUntil = (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntil < 12 || reservation.status !== 'active')
        return res.json({ message: 'Otkazivanje nije dozvoljeno (<12h)' });

      reservation.status = 'cancelled';
      reservation.cancelledAt = new Date();
      await reservation.save();
      res.json({ message: 'OK' });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== SAIGRAČI ====================

  teammates = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const posts = await TeammatePostModel.find({ isActive: true, isComplete: false })
        .populate('author', 'username firstName lastName profileImage')
        .populate('facility', 'name city').sort({ createdAt: -1 });

      const result = posts.map(p => {
        const obj: any = p.toObject();
        const mr = p.joinRequests.find(
          (jr: any) => jr.user.toString() === userId
        );
        obj.myRequestStatus = mr ? mr.status : null;
        obj.amAuthor = p.author._id.toString() === userId;
        return obj;
      });

      res.json({ posts: result });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  createTeammatePost = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { sport, city, date, startTime, endTime, missingPlayers, description, facilityId } = req.body;
      const post = await TeammatePostModel.create({
        author: userId, sport, city, date: new Date(date),
        startTime, endTime, missingPlayers: parseInt(missingPlayers),
        description, facility: facilityId || null
      });
      res.json({ message: 'OK', post });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  joinTeammate = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const post = await TeammatePostModel.findById(req.params.id);
      if (!post || !post.isActive)
        return res.json({ message: 'Oglas nije pronađen' });
      if (post.author.toString() === userId)
        return res.json({ message: 'Ne možete se pridružiti svom oglasu' });
      if (post.joinRequests.find((jr: any) => jr.user.toString() === userId))
        return res.json({ message: 'Već ste poslali zahtev' });

      post.joinRequests.push({ user: userId, status: 'pending' });
      await post.save();
      res.json({ message: 'OK' });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  handleTeammateRequest = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const post = await TeammatePostModel.findById(req.params.postId);
      if (!post) return res.json({ message: 'Nije pronađeno' });
      if (post.author.toString() !== userId)
        return res.json({ message: 'Samo autor može' });

      const request = post.joinRequests.find(
        (jr: any) => jr.user.toString() === req.params.userId
      );
      if (!request) return res.json({ message: 'Zahtev nije pronađen' });

      if (req.body.action === 'approve') {
        request.status = 'approved';
        post.approvedPlayers.push(request.user);
        post.missingPlayers = Math.max(0, post.missingPlayers - 1);
        if (post.missingPlayers === 0) { post.isComplete = true; post.isActive = false; }
      } else {
        request.status = 'rejected';
      }
      await post.save();
      res.json({ message: 'OK', post });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  closeTeammate = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const post = await TeammatePostModel.findById(req.params.id);
      if (!post) return res.json({ message: 'Nije pronađeno' });
      if (post.author.toString() !== userId)
        return res.json({ message: 'Samo autor može' });

      post.isActive = false;
      await post.save();
      res.json({ message: 'OK' });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== TRENINZI ====================

  trainers = async (req: Request, res: Response) => {
    try {
      const filter: any = { isActive: true };
      if (req.query.facilityId) filter.facility = req.query.facilityId;
      if (req.query.sport) filter.specialization = { $regex: req.query.sport, $options: 'i' };
      const trainers = await TrainerModel.find(filter)
        .populate('facility', 'name city').sort({ averageRating: -1 });
      res.json({ trainers });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  athleteTrainings = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const trainings = await TrainingModel.find({ athlete: userId })
        .populate('trainer', 'firstName lastName specialization')
        .populate('facility', 'name city').sort({ date: -1 });
      res.json({ trainings });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  createTraining = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { trainerId, facilityId, courtId, sport, date, startTime, endTime } = req.body;
      const trainer = await TrainerModel.findById(trainerId);
      if (!trainer || !trainer.isActive)
        return res.json({ message: 'Trener nije pronađen' });

      const tDate = new Date(date);
      const overlaps = await TrainingModel.find({
        trainer: trainerId,
        date: { $gte: new Date(tDate.setHours(0, 0, 0, 0)), $lt: new Date(new Date(tDate).setHours(23, 59, 59, 999)) },
        status: { $ne: 'cancelled' },
        startTime: { $lt: endTime }, endTime: { $gt: startTime }
      });
      if (overlaps.length > 0)
        return res.json({ message: 'Trener je zauzet' });

      const training = await TrainingModel.create({
        athlete: userId, trainer: trainerId, facility: facilityId,
        courtId: courtId || null, sport, date: new Date(date),
        startTime, endTime, price: trainer.pricePerHour
      });
      res.json({ message: 'OK', training });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== PRODAVNICA ====================

  equipmentList = async (req: Request, res: Response) => {
    try {
      const filter: any = { isActive: true, stock: { $gt: 0 } };
      if (req.query.sport) filter.sport = { $regex: req.query.sport, $options: 'i' };
      if (req.query.facilityId) filter.facility = req.query.facilityId;
      const equipment = await EquipmentModel.find(filter)
        .populate('facility', 'name city').sort({ sport: 1, name: 1 });
      res.json({ equipment });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  athleteOrders = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const orders = await OrderModel.find({ user: userId })
        .populate('facility', 'name city').sort({ createdAt: -1 });
      res.json({ orders });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  createOrder = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { items } = req.body;
      if (!items || items.length === 0)
        return res.json({ message: 'Korpa prazna' });

      const orderItems = [];
      let totalPrice = 0;
      let facilityId = null;

      for (const item of items) {
        const eq = await EquipmentModel.findById(item.equipmentId);
        if (!eq || !eq.isActive)
          return res.json({ message: 'Oprema nije pronađena' });
        if (eq.stock < item.quantity)
          return res.json({ message: `Nedovoljno zaliha za ${eq.name}` });

        facilityId = eq.facility;
        orderItems.push({
          equipment: eq._id, name: eq.name,
          price: eq.price, quantity: item.quantity
        });
        totalPrice += eq.price * item.quantity;
        eq.stock -= item.quantity;
        await eq.save();
      }

      const order = await OrderModel.create({
        user: userId, items: orderItems,
        totalPrice, facility: facilityId, status: 'ordered'
      });
      res.json({ message: 'OK', order });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  cancelOrder = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const order = await OrderModel.findOne({ _id: req.params.id, user: userId });
      if (!order) return res.json({ message: 'Nije pronađeno' });
      if (order.status === 'cancelled' || order.status === 'picked_up')
        return res.json({ message: 'Ne može se otkazati' });

      for (const item of order.items) {
        await EquipmentModel.findByIdAndUpdate(item.equipment, { $inc: { stock: item.quantity } });
      }
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();
      res.json({ message: 'OK' });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== OCENE ====================

  createReview = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { facilityId, isLike, comment } = req.body;

      const confirmed = await ReservationModel.countDocuments({
        user: userId, facility: facilityId, attendanceStatus: 'confirmed'
      });
      if (confirmed === 0)
        return res.json({ message: 'Morate imati bar jednu potvrđenu rezervaciju' });

      const existing = await ReviewModel.countDocuments({ user: userId, facility: facilityId });
      if (existing >= confirmed)
        return res.json({ message: 'Max ocena = broj potvrđenih rezervacija' });

      await ReviewModel.create({ user: userId, facility: facilityId, isLike, comment: comment || '' });

      if (isLike)
        await SportFacilityModel.findByIdAndUpdate(facilityId, { $inc: { likes: 1 } });
      else
        await SportFacilityModel.findByIdAndUpdate(facilityId, { $inc: { dislikes: 1 } });

      res.json({ message: 'OK' });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== STATISTIKA ====================

  statistics = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const mongoose = require('mongoose');
      const objId = new mongoose.Types.ObjectId(userId);

      const bySport = await ReservationModel.aggregate([
        { $match: { user: objId, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$sport', count: { $sum: 1 } } }
      ]);

      const monthly = await ReservationModel.aggregate([
        { $match: { user: objId } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      const spending = await OrderModel.aggregate([
        { $match: { user: objId, status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
      ]);

      const totalSpending = spending.reduce((s: number, i: any) => s + i.total, 0);

      res.json({ statistics: { reservationsBySport: bySport, monthlyActivity: monthly, equipmentSpending: spending, totalSpending } });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== ZAPOSLENI ====================

  employeeProfile = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      const facilities = await SportFacilityModel.find({ companyName: user?.facilityName });
      res.json({ user, facilities });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  updateEmployeeProfile = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const updateData: any = {};
      if (req.body.firstName) updateData.firstName = req.body.firstName;
      if (req.body.lastName) updateData.lastName = req.body.lastName;
      if (req.body.contactPhone) updateData.contactPhone = req.body.contactPhone;
      if (req.file) updateData.profileImage = req.file.filename;
      const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
      res.json({ user });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  employeeFacilities = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      const facilities = await SportFacilityModel.find({ companyName: user?.facilityName });
      res.json({ facilities });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  createFacility = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      const { name, city, address, description, courts, pricePerHour, maxNoShows, workingHours, location } = req.body;

      const facility = await SportFacilityModel.create({
        name, city, address, description: description || '',
        managers: [userId], companyName: user?.facilityName,
        courts: courts || [], pricePerHour: pricePerHour || 0,
        maxNoShows: maxNoShows || 3,
        workingHours: workingHours || { open: '08:00', close: '22:00' },
        location: location || { latitude: 44.7866, longitude: 20.4489 },
        approvalStatus: 'pending'
      });

      res.json({ message: 'OK', facility });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  createFacilityFromJson = async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.json({ message: 'JSON fajl je obavezan' });
      const userId = getUserId(req);
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
      const user = await UserModel.findById(userId);

      const facility = await SportFacilityModel.create({
        ...data, managers: [userId],
        companyName: user?.facilityName, approvalStatus: 'pending'
      });

      fs.unlinkSync(req.file.path);
      res.json({ message: 'OK', facility });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  updateFacility = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const facility = await SportFacilityModel.findOneAndUpdate(
        { _id: req.params.id, managers: userId }, req.body, { new: true }
      );
      if (!facility) return res.json({ message: 'Objekat nije pronađen' });
      res.json({ facility });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  employeeReservations = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      const facilities = await SportFacilityModel.find({ companyName: user?.facilityName }).select('_id');
      const facilityIds = facilities.map(f => f._id);

      const reservations = await ReservationModel.find({ facility: { $in: facilityIds } })
        .populate('user', 'username firstName lastName')
        .populate('facility', 'name').sort({ date: -1 });
      res.json({ reservations });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  employeeTrainings = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      const facilities = await SportFacilityModel.find({ companyName: user?.facilityName }).select('_id');
      const facilityIds = facilities.map(f => f._id);

      const trainings = await TrainingModel.find({ facility: { $in: facilityIds } })
        .populate('athlete', 'username firstName lastName')
        .populate('trainer', 'firstName lastName')
        .populate('facility', 'name').sort({ date: -1 });
      res.json({ trainings });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  setAttendance = async (req: Request, res: Response) => {
    try {
      const { attendance } = req.body;
      const reservation = await ReservationModel.findById(req.params.id);
      if (!reservation) return res.json({ message: 'Nije pronađeno' });

      const [h, m] = reservation.startTime.split(':').map(Number);
      const startDateTime = new Date(reservation.date);
      startDateTime.setHours(h, m, 0, 0);
      const now = new Date();
      const diffMin = (now.getTime() - startDateTime.getTime()) / 60000;

      if (diffMin < 0 || diffMin > 10)
        return res.json({ message: 'Potvrda moguća samo 0-10 min nakon početka' });

      reservation.attendanceStatus = attendance;
      await reservation.save();

      if (attendance === 'noshow') {
        const user = await UserModel.findById(reservation.user);
        const exists = user?.blockedFacilities?.find(
          (b: any) => b.facility.toString() === reservation.facility.toString()
        );
        if (!exists) {
          await UserModel.findByIdAndUpdate(reservation.user, {
            $push: { blockedFacilities: { facility: reservation.facility, noShowCount: 1 } }
          });
        } else {
          await UserModel.findByIdAndUpdate(reservation.user, {
            $inc: { 'blockedFacilities.$[elem].noShowCount': 1 }
          }, { arrayFilters: [{ 'elem.facility': reservation.facility }] });
        }
      }

      res.json({ message: 'OK' });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  moveReservation = async (req: Request, res: Response) => {
    try {
      const { date, startTime, endTime } = req.body;
      const reservation = await ReservationModel.findByIdAndUpdate(
        req.params.id, { date: new Date(date), startTime, endTime }, { new: true }
      );
      if (!reservation) return res.json({ message: 'Nije pronađeno' });
      res.json({ message: 'OK', reservation });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== PROMOCIJE ====================

  employeePromotions = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      const facilities = await SportFacilityModel.find({ companyName: user?.facilityName }).select('_id');
      const facilityIds = facilities.map(f => f._id);

      const promotions = await PromotionModel.find({ facility: { $in: facilityIds } })
        .populate('facility', 'name').sort({ createdAt: -1 });
      res.json({ promotions });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  createPromotion = async (req: Request, res: Response) => {
    try {
      const { name, description, facilityId, sport, discountType, discountValue, startDate, endDate } = req.body;
      const promotion = await PromotionModel.create({
        name, description, facility: facilityId, sport,
        discountType, discountValue, startDate: new Date(startDate), endDate: new Date(endDate)
      });
      res.json({ message: 'OK', promotion });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  updatePromotion = async (req: Request, res: Response) => {
    try {
      const promotion = await PromotionModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!promotion) return res.json({ message: 'Nije pronađeno' });
      res.json({ promotion });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== OPREMA (ZAPOSLENI) ====================

  employeeEquipment = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      const facilities = await SportFacilityModel.find({ companyName: user?.facilityName }).select('_id');
      const facilityIds = facilities.map(f => f._id);

      const equipment = await EquipmentModel.find({ facility: { $in: facilityIds } })
        .populate('facility', 'name').sort({ createdAt: -1 });
      res.json({ equipment });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  createEquipment = async (req: Request, res: Response) => {
    try {
      const equipment = await EquipmentModel.create(req.body);
      res.json({ message: 'OK', equipment });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  updateEquipment = async (req: Request, res: Response) => {
    try {
      const equipment = await EquipmentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!equipment) return res.json({ message: 'Nije pronađeno' });
      res.json({ equipment });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== NARUDŽBINE (ZAPOSLENI) ====================

  employeeOrders = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      const facilities = await SportFacilityModel.find({ companyName: user?.facilityName }).select('_id');
      const facilityIds = facilities.map(f => f._id);

      const orders = await OrderModel.find({ facility: { $in: facilityIds } })
        .populate('user', 'username firstName lastName')
        .populate('facility', 'name').sort({ createdAt: -1 });
      res.json({ orders });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  setOrderStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const order = await OrderModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!order) return res.json({ message: 'Nije pronađeno' });
      res.json({ order });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== TRENERI (ZAPOSLENI) ====================

  employeeTrainersList = async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await UserModel.findById(userId);
      const facilities = await SportFacilityModel.find({ companyName: user?.facilityName }).select('_id');
      const facilityIds = facilities.map(f => f._id);

      const trainers = await TrainerModel.find({ facility: { $in: facilityIds } })
        .populate('facility', 'name');
      res.json({ trainers });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  createTrainer = async (req: Request, res: Response) => {
    try {
      const trainer = await TrainerModel.create(req.body);
      res.json({ message: 'OK', trainer });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== IZVEŠTAJI (HTML) ====================

  occupancyReport = async (req: Request, res: Response) => {
    try {
      const { month, year } = req.query;
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      const facility = await SportFacilityModel.findById(req.params.facilityId);
      if (!facility) return res.json({ message: 'Objekat nije pronađen' });

      const reservations = await ReservationModel.find({
        facility: req.params.facilityId,
        date: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      });

      let html = `<h1>Izveštaj o popunjenosti - ${facility.name}</h1>`;
      html += `<p>Period: ${month}/${year}</p><ul>`;

      for (const court of facility.courts) {
        const courtRes = reservations.filter(
          (r: any) => r.courtId.toString() === court._id.toString()
        );
        const totalHours = courtRes.length;
        const totalWorkingDays = 30;
        const totalWorkingHours = totalWorkingDays * 14;
        const occupancy = totalWorkingHours > 0
          ? ((totalHours / totalWorkingHours) * 100).toFixed(1) : '0';
        html += `<li>${court.name} (${court.sport}): ${totalHours} rezervacija - ${occupancy}% popunjenosti</li>`;
      }
      html += '</ul>';

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  equipmentReport = async (req: Request, res: Response) => {
    try {
      const { month, year } = req.query;
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      const facility = await SportFacilityModel.findById(req.params.facilityId);
      if (!facility) return res.json({ message: 'Objekat nije pronađen' });

      const orders = await OrderModel.find({
        facility: req.params.facilityId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      });

      let html = `<h1>Izveštaj o prometu opreme - ${facility.name}</h1>`;
      html += `<p>Period: ${month}/${year}</p><ul>`;
      let totalRevenue = 0;

      for (const order of orders) {
        html += `<li>Porudžbina - ${order.totalPrice} RSD</li>`;
        totalRevenue += order.totalPrice;
      }
      html += `</ul><p><b>Ukupan promet: ${totalRevenue} RSD</b></p>`;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  // ==================== ADMIN ====================

  adminUsers = async (req: Request, res: Response) => {
    try {
      const users = await UserModel.find().sort({ createdAt: -1 });
      res.json({ users });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!user) return res.json({ message: 'Nije pronađeno' });
      res.json({ user });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const user = await UserModel.findByIdAndDelete(req.params.id);
      if (!user) return res.json({ message: 'Nije pronađeno' });
      res.json({ message: 'OK' });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  registrationRequests = async (req: Request, res: Response) => {
    try {
      const requests = await UserModel.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 });
      res.json({ requests });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  handleRegistrationRequest = async (req: Request, res: Response) => {
    try {
      const { action, reason } = req.body;
      const update = action === 'approve'
        ? { approvalStatus: 'approved' }
        : { approvalStatus: 'rejected', rejectionReason: reason || '' };

      const user = await UserModel.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!user) return res.json({ message: 'Nije pronađeno' });
      res.json({ user });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  facilityRequests = async (req: Request, res: Response) => {
    try {
      const facilities = await SportFacilityModel.find({ approvalStatus: 'pending' })
        .populate('managers', 'username firstName lastName').sort({ createdAt: -1 });
      res.json({ facilities });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  handleFacilityRequest = async (req: Request, res: Response) => {
    try {
      const { action, reason } = req.body;
      const update = action === 'approve'
        ? { approvalStatus: 'approved' }
        : { approvalStatus: 'rejected', rejectionReason: reason || '' };

      const facility = await SportFacilityModel.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!facility) return res.json({ message: 'Nije pronađeno' });
      res.json({ facility });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  adminTrainers = async (req: Request, res: Response) => {
    try {
      const trainers = await TrainerModel.find()
        .populate('facility', 'name city').sort({ createdAt: -1 });
      res.json({ trainers });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  toggleTrainer = async (req: Request, res: Response) => {
    try {
      const trainer = await TrainerModel.findById(req.params.id);
      if (!trainer) return res.json({ message: 'Nije pronađeno' });
      trainer.isActive = !trainer.isActive;
      await trainer.save();
      res.json({ trainer });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  adminSports = async (req: Request, res: Response) => {
    try {
      const sports = await SportModel.find().sort({ name: 1 });
      res.json({ sports });
    } catch (err: any) {
      res.json({ message: err.message });
    }
  };

  addSport = async (req: Request, res: Response) => {
    try {
      const sport = await SportModel.create({ name: req.body.name });
      res.json({ message: 'OK', sport });
    } catch (err: any) {
      if (err.code === 11000)
        return res.json({ message: 'Sport već postoji' });
      res.json({ message: err.message });
    }
  };
}
