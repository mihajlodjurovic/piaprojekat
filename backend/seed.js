/**
 * ============================================
 *  SEED SKRIPTA - SportSphere Hub (BOGATA)
 * ============================================
 * 
 * Pokretanje:  npm run seed   (ili: node seed.js)
 * 
 * ⚠️  ADMIN:    admin / Admin123!
 * 📋  Svi useri: Admin123!
 * ============================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const MONGODB_URI = 'mongodb://localhost:27017/sportsphere_hub';
const DEMO_PASSWORD = 'Admin123!';

// Helper: vraca Date za N dana od danas (pozitivno = buducnost, negativno = proslost)
function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Povezano na MongoDB - baza: sportsphere_hub\n');
  const db = mongoose.connection.db;

  // Briši sve
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
  }
  console.log('🗑️  Sve kolekcije obrisane\n');

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  console.log('🔐 Lozinka hešovana bcrypt-om\n');

  // ==================== SPORTOVI ====================
  console.log('--- SPORTOVI ---');
  await db.collection('sports').insertMany([
    { name: 'Tenis', isActive: true },
    { name: 'Fudbal', isActive: true },
    { name: 'Košarka', isActive: true },
    { name: 'Odbojka', isActive: true },
    { name: 'Plivanje', isActive: true },
    { name: 'Stoni tenis', isActive: true },
    { name: 'Badminton', isActive: true },
    { name: 'Teretana', isActive: true },
    { name: 'Joga', isActive: true },
    { name: 'Rukomet', isActive: true }
  ]);
  console.log('  ✅ 10 sportova');

  // ==================== KORISNICI ====================
  console.log('\n--- KORISNICI ---');
  const users = await db.collection('users').insertMany([
    {
      username: 'admin', email: 'admin@sportsphere.com', password: hashedPassword,
      role: 'admin', firstName: 'Admin', lastName: 'Sistema', contactPhone: '0600000000',
      profileImage: 'default-avatar.png', approvalStatus: 'approved', isActive: true,
      favoriteSports: [], blockedFacilities: [], createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'zaposleni1', email: 'emp1@sportsphere.com', password: hashedPassword,
      role: 'employee', firstName: 'Marko', lastName: 'Marković', contactPhone: '0611111111',
      facilityName: 'Sportski Centar Beograd', facilityAddress: 'Bulevar oslobođenja 100, Beograd',
      registrationNumber: '12345678', pib: '123456789', profileImage: 'default-avatar.png',
      approvalStatus: 'approved', isActive: true, favoriteSports: [], blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'zaposleni2', email: 'emp2@sportsphere.com', password: hashedPassword,
      role: 'employee', firstName: 'Jelena', lastName: 'Jovanović', contactPhone: '0622222222',
      facilityName: 'Sportski Centar Novi Sad', facilityAddress: 'Bulevar Evrope 50, Novi Sad',
      registrationNumber: '87654321', pib: '987654321', profileImage: 'default-avatar.png',
      approvalStatus: 'approved', isActive: true, favoriteSports: [], blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'sportista1', email: 'ath1@sportsphere.com', password: hashedPassword,
      role: 'athlete', firstName: 'Petar', lastName: 'Petrović', contactPhone: '0633333333',
      favoriteSports: ['Tenis', 'Fudbal', 'Košarka'], profileImage: 'default-avatar.png',
      approvalStatus: 'approved', isActive: true, blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'sportista2', email: 'ath2@sportsphere.com', password: hashedPassword,
      role: 'athlete', firstName: 'Ana', lastName: 'Anić', contactPhone: '0644444444',
      favoriteSports: ['Odbojka', 'Plivanje', 'Joga'], profileImage: 'default-avatar.png',
      approvalStatus: 'approved', isActive: true, blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'sportista3', email: 'ath3@sportsphere.com', password: hashedPassword,
      role: 'athlete', firstName: 'Nikola', lastName: 'Nikolić', contactPhone: '0655555555',
      favoriteSports: ['Košarka', 'Teretana', 'Stoni tenis', 'Badminton'], profileImage: 'default-avatar.png',
      approvalStatus: 'approved', isActive: true, blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  const adminId = users.insertedIds[0], emp1Id = users.insertedIds[1], emp2Id = users.insertedIds[2];
  const ath1Id = users.insertedIds[3], ath2Id = users.insertedIds[4], ath3Id = users.insertedIds[5];
  console.log(`  ✅ 6 korisnika`);

  // ==================== OBJEKTI ====================
  console.log('\n--- OBJEKTI ---');
  const facilities = await db.collection('sport_facilities').insertMany([
    {
      name: 'Sportski Centar Beograd', city: 'Beograd', address: 'Bulevar oslobođenja 100',
      description: 'Najveći sportski centar u Beogradu sa terenima za razne sportove.',
      managers: [emp1Id], companyName: 'Sportski Centar Beograd',
      courts: [
        { name: 'Teniski teren 1', type: 'outdoor', sport: 'Tenis', capacity: 4, spotsCount: 4, pricePerHour: 1500, equipmentDescription: 'Otvoreni teren sa šljakom', isActive: true },
        { name: 'Teniski teren 2', type: 'outdoor', sport: 'Tenis', capacity: 4, spotsCount: 4, pricePerHour: 1500, equipmentDescription: 'Otvoreni teren sa šljakom', isActive: true },
        { name: 'Teniski teren 3', type: 'indoor', sport: 'Tenis', capacity: 4, spotsCount: 4, pricePerHour: 2500, equipmentDescription: 'Zatvoreni teren', isActive: true },
        { name: 'Fudbalski teren', type: 'outdoor', sport: 'Fudbal', capacity: 22, spotsCount: 22, pricePerHour: 5000, equipmentDescription: 'Veštačka trava', isActive: true },
        { name: 'Košarkaška hala', type: 'indoor', sport: 'Košarka', capacity: 30, spotsCount: 10, pricePerHour: 3000, equipmentDescription: 'Parket', isActive: true },
        { name: 'Sala za stoni tenis', type: 'indoor', sport: 'Stoni tenis', capacity: 4, spotsCount: 4, pricePerHour: 1000, equipmentDescription: '4 stola', isActive: true },
        { name: 'Bazen olimpijski', type: 'indoor', sport: 'Plivanje', capacity: 50, spotsCount: 8, pricePerHour: 800, equipmentDescription: 'Olimpijski bazen 50m', isActive: true },
        { name: 'Teretana', type: 'indoor', sport: 'Teretana', capacity: 50, spotsCount: 20, pricePerHour: 600, equipmentDescription: 'Profesionalna oprema', isActive: true },
        { name: 'Rukometna dvorana', type: 'indoor', sport: 'Rukomet', capacity: 24, spotsCount: 12, pricePerHour: 3500, equipmentDescription: 'Parket, profesionalni golovi', isActive: true }
      ],
      workingHours: { open: '08:00', close: '22:00' }, maxNoShows: 3, pricePerHour: 1500,
      location: { latitude: 44.7866, longitude: 20.4489 },
      mainImage: 'sportski-centar-radnicki-zvezdara-3d-01b.jpg', galleryImages: ['sportski-centar-radnicki-zvezdara-3d-01b.jpg'],
      likes: 78, dislikes: 5, likedBy: [], dislikedBy: [],
      approvalStatus: 'approved', isActive: true, createdAt: new Date(), updatedAt: new Date()
    },
    {
      name: 'Sportski Centar Novi Sad', city: 'Novi Sad', address: 'Bulevar Evrope 50',
      description: 'Moderni sportski centar u Novom Sadu.',
      managers: [emp2Id], companyName: 'Sportski Centar Novi Sad',
      courts: [
        { name: 'Teniski teren 1', type: 'outdoor', sport: 'Tenis', capacity: 4, spotsCount: 4, pricePerHour: 1200, equipmentDescription: 'Otvoreni teren', isActive: true },
        { name: 'Teniski teren 2', type: 'indoor', sport: 'Tenis', capacity: 4, spotsCount: 4, pricePerHour: 2000, equipmentDescription: 'Zatvoreni teren', isActive: true },
        { name: 'Fudbalski teren', type: 'outdoor', sport: 'Fudbal', capacity: 22, spotsCount: 14, pricePerHour: 4000, equipmentDescription: 'Prirodna trava', isActive: true },
        { name: 'Odbojkaška hala', type: 'indoor', sport: 'Odbojka', capacity: 12, spotsCount: 6, pricePerHour: 2000, equipmentDescription: 'Parket', isActive: true },
        { name: 'Badminton sala', type: 'indoor', sport: 'Badminton', capacity: 4, spotsCount: 4, pricePerHour: 800, equipmentDescription: '2 terena', isActive: true },
        { name: 'Bazen', type: 'indoor', sport: 'Plivanje', capacity: 30, spotsCount: 6, pricePerHour: 600, equipmentDescription: 'Bazen 25m', isActive: true }
      ],
      workingHours: { open: '08:00', close: '22:00' }, maxNoShows: 3, pricePerHour: 1200,
      location: { latitude: 45.2671, longitude: 19.8335 },
      mainImage: 'images.jpg', galleryImages: ['images.jpg'],
      likes: 56, dislikes: 4, likedBy: [], dislikedBy: [],
      approvalStatus: 'approved', isActive: true, createdAt: new Date(), updatedAt: new Date()
    },
    {
      name: 'Sportski Centar Niš', city: 'Niš', address: 'Bulevar Nemanjića 20',
      description: 'Najveći sportski kompleks na jugu Srbije.',
      managers: [emp1Id], companyName: 'Sportski Centar Beograd',
      courts: [
        { name: 'Teniski teren', type: 'outdoor', sport: 'Tenis', capacity: 4, spotsCount: 4, pricePerHour: 1000, equipmentDescription: 'Otvoreni teren', isActive: true },
        { name: 'Fudbalski teren', type: 'outdoor', sport: 'Fudbal', capacity: 22, spotsCount: 16, pricePerHour: 3500, equipmentDescription: 'Hibridna trava', isActive: true },
        { name: 'Sala za košarku', type: 'indoor', sport: 'Košarka', capacity: 24, spotsCount: 8, pricePerHour: 2500, equipmentDescription: 'Parket, semafor', isActive: true },
        { name: 'Teretana', type: 'indoor', sport: 'Teretana', capacity: 40, spotsCount: 15, pricePerHour: 500, equipmentDescription: 'Moderna oprema', isActive: true }
      ],
      workingHours: { open: '07:00', close: '23:00' }, maxNoShows: 3, pricePerHour: 1000,
      location: { latitude: 43.3209, longitude: 21.8958 },
      mainImage: 'DJI_0539-1.png', galleryImages: ['DJI_0539-1.png'],
      likes: 34, dislikes: 1, likedBy: [], dislikedBy: [],
      approvalStatus: 'approved', isActive: true, createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  const fac1Id = facilities.insertedIds[0], fac2Id = facilities.insertedIds[1], fac3Id = facilities.insertedIds[2];
  const fac1 = await db.collection('sport_facilities').findOne({ _id: fac1Id });
  const fac2 = await db.collection('sport_facilities').findOne({ _id: fac2Id });
  const fac3 = await db.collection('sport_facilities').findOne({ _id: fac3Id });
  const f1c = fac1.courts, f2c = fac2.courts, f3c = fac3.courts;
  console.log(`  ✅ 3 objekta (BG: 9 terena, NS: 6, NI: 4)`);

  // ==================== TRENERI ====================
  console.log('\n--- TRENERI ---');
  const trainers = await db.collection('trainers').insertMany([
    { firstName: 'Dejan', lastName: 'Dejanović', specialization: ['Tenis'], facility: fac1Id, pricePerHour: 2000, averageRating: 4.8, totalRatings: 25, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { firstName: 'Miloš', lastName: 'Milošević', specialization: ['Košarka', 'Fudbal'], facility: fac1Id, pricePerHour: 2500, averageRating: 4.5, totalRatings: 18, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { firstName: 'Ivana', lastName: 'Ivanović', specialization: ['Plivanje'], facility: fac1Id, pricePerHour: 1800, averageRating: 4.9, totalRatings: 30, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { firstName: 'Nataša', lastName: 'Natašić', specialization: ['Odbojka', 'Badminton'], facility: fac2Id, pricePerHour: 1500, averageRating: 4.3, totalRatings: 12, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { firstName: 'Stefan', lastName: 'Stefanović', specialization: ['Plivanje', 'Teretana'], facility: fac2Id, pricePerHour: 1600, averageRating: 4.6, totalRatings: 15, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { firstName: 'Tamara', lastName: 'Tamarović', specialization: ['Košarka'], facility: fac3Id, pricePerHour: 1800, averageRating: 4.7, totalRatings: 9, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { firstName: 'Vladimir', lastName: 'Vladimirović', specialization: ['Tenis', 'Badminton'], facility: fac3Id, pricePerHour: 1500, averageRating: 4.4, totalRatings: 7, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]);
  const trIds = Object.values(trainers.insertedIds);
  console.log(`  ✅ 7 trenera`);

  // ==================== OPREMA ====================
  console.log('\n--- OPREMA ---');
  const equipment = await db.collection('equipment').insertMany([
    { name: 'Teniski reket Pro', sport: 'Tenis', description: 'Profesionalni teniski reket', price: 8500, stock: 15, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Lopte za tenis (3 kom)', sport: 'Tenis', description: 'Set od 3 profesionalne loptice', price: 1200, stock: 50, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Fudbalska lopta', sport: 'Fudbal', description: 'Zvanična lopta veličine 5', price: 3500, stock: 20, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Košarkaška lopta', sport: 'Košarka', description: 'Profesionalna lopta vel. 7', price: 4000, stock: 15, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Teniski reket Amater', sport: 'Tenis', description: 'Reket za početnike', price: 4500, stock: 10, facility: fac2Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Odbojkaška lopta', sport: 'Odbojka', description: 'Profesionalna odbojkaška lopta', price: 3000, stock: 12, facility: fac2Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Badminton set', sport: 'Badminton', description: 'Set sa 2 reketa i 3 loptice', price: 2500, stock: 8, facility: fac2Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Proteini Whey 1kg', sport: 'Teretana', description: 'Whey protein koncentrat', price: 4500, stock: 30, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Kupaći kostim', sport: 'Plivanje', description: 'Profesionalni kupaći kostim', price: 3500, stock: 25, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Pojas za tegove', sport: 'Teretana', description: 'Kožni pojas za dizanje tegova', price: 2800, stock: 18, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Rukometna lopta', sport: 'Rukomet', description: 'Profesionalna lopta za rukomet', price: 3200, stock: 10, facility: fac3Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Štucne fudbalske', sport: 'Fudbal', description: 'Profesionalne štucne', price: 1500, stock: 40, facility: fac3Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Teniske patike', sport: 'Tenis', description: 'Patike za šljaku', price: 7500, stock: 12, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Joga prostirka', sport: 'Joga', description: 'Debela prostirka 6mm', price: 2200, stock: 35, facility: fac2Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]);
  const eqIds = Object.values(equipment.insertedIds);
  console.log(`  ✅ ${eqIds.length} artikala opreme`);

  // ==================== PROMOCIJE ====================
  console.log('\n--- PROMOCIJE ---');
  const today = new Date();
  await db.collection('promotions').insertMany([
    { name: 'Letnji teniski popust', description: '30% popusta na sve teniske terene', facility: fac1Id, sport: 'Tenis', discountType: 'percentage', discountValue: 30, startDate: dateOffset(-5), endDate: dateOffset(30), isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Vikend fudbal akcija', description: 'Treći sat besplatno', facility: fac2Id, sport: 'Fudbal', discountType: 'fixed', discountValue: 2000, startDate: dateOffset(-2), endDate: dateOffset(14), isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Članstvo u teretani', description: '20% popusta na mesečno članstvo', facility: fac1Id, sport: 'Teretana', discountType: 'percentage', discountValue: 20, startDate: dateOffset(-10), endDate: dateOffset(60), isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Novogodišnji popust', description: '40% na sve bazene u decembru', facility: fac1Id, sport: 'Plivanje', discountType: 'percentage', discountValue: 40, startDate: dateOffset(-30), endDate: dateOffset(-5), isActive: false, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Badminton specijal', description: '100 RSD popusta po satu', facility: fac2Id, sport: 'Badminton', discountType: 'fixed', discountValue: 100, startDate: dateOffset(-3), endDate: dateOffset(21), isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Košarkaški kamp', description: '25% popusta na sve košarkaške termine', facility: fac3Id, sport: 'Košarka', discountType: 'percentage', discountValue: 25, startDate: dateOffset(1), endDate: dateOffset(45), isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('  ✅ 6 promocija (4 aktivne, 1 istekla, 1 buduća)');

  // ╔══════════════════════════════════════════╗
  // ║           REZERVACIJE (30)              ║
  // ╚══════════════════════════════════════════╝
  console.log('\n--- REZERVACIJE ---');
  const reservations = [
    // === PROŠLE (confirmed + noshow) ===
    { user: ath1Id, facility: fac1Id, courtId: f1c[0]._id, courtName: f1c[0].name, sport: 'Tenis', date: dateOffset(-14), startTime: '10:00', endTime: '11:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac1Id, courtId: f1c[0]._id, courtName: f1c[0].name, sport: 'Tenis', date: dateOffset(-10), startTime: '10:00', endTime: '11:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac1Id, courtId: f1c[3]._id, courtName: f1c[3].name, sport: 'Fudbal', date: dateOffset(-7), startTime: '16:00', endTime: '18:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac1Id, courtId: f1c[0]._id, courtName: f1c[0].name, sport: 'Tenis', date: dateOffset(-5), startTime: '09:00', endTime: '10:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac1Id, courtId: f1c[4]._id, courtName: f1c[4].name, sport: 'Košarka', date: dateOffset(-3), startTime: '18:00', endTime: '20:00', status: 'active', attendanceStatus: 'noshow', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, courtId: f2c[3]._id, courtName: f2c[3].name, sport: 'Odbojka', date: dateOffset(-14), startTime: '18:00', endTime: '20:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, courtId: f2c[5]._id, courtName: f2c[5].name, sport: 'Plivanje', date: dateOffset(-10), startTime: '08:00', endTime: '09:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, courtId: f2c[4]._id, courtName: f2c[4].name, sport: 'Badminton', date: dateOffset(-5), startTime: '12:00', endTime: '14:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac1Id, courtId: f1c[6]._id, courtName: f1c[6].name, sport: 'Plivanje', date: dateOffset(-3), startTime: '10:00', endTime: '11:00', status: 'active', attendanceStatus: 'noshow', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, courtId: f1c[4]._id, courtName: f1c[4].name, sport: 'Košarka', date: dateOffset(-14), startTime: '09:00', endTime: '11:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, courtId: f1c[5]._id, courtName: f1c[5].name, sport: 'Stoni tenis', date: dateOffset(-7), startTime: '14:00', endTime: '16:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, courtId: f1c[7]._id, courtName: f1c[7].name, sport: 'Teretana', date: dateOffset(-3), startTime: '07:00', endTime: '08:00', status: 'active', attendanceStatus: 'noshow', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac3Id, courtId: f3c[3]._id, courtName: f3c[3].name, sport: 'Teretana', date: dateOffset(-8), startTime: '17:00', endTime: '19:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    // === Ova nedelja / bliska budućnost ===
    { user: ath1Id, facility: fac1Id, courtId: f1c[0]._id, courtName: f1c[0].name, sport: 'Tenis', date: dateOffset(0), startTime: '10:00', endTime: '11:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac1Id, courtId: f1c[1]._id, courtName: f1c[1].name, sport: 'Tenis', date: dateOffset(1), startTime: '15:00', endTime: '16:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac1Id, courtId: f1c[3]._id, courtName: f1c[3].name, sport: 'Fudbal', date: dateOffset(2), startTime: '16:00', endTime: '18:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, courtId: f2c[3]._id, courtName: f2c[3].name, sport: 'Odbojka', date: dateOffset(0), startTime: '18:00', endTime: '20:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, courtId: f2c[0]._id, courtName: f2c[0].name, sport: 'Tenis', date: dateOffset(1), startTime: '09:00', endTime: '10:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac1Id, courtId: f1c[6]._id, courtName: f1c[6].name, sport: 'Plivanje', date: dateOffset(3), startTime: '11:00', endTime: '12:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, courtId: f1c[4]._id, courtName: f1c[4].name, sport: 'Košarka', date: dateOffset(1), startTime: '09:00', endTime: '11:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, courtId: f1c[5]._id, courtName: f1c[5].name, sport: 'Stoni tenis', date: dateOffset(2), startTime: '14:00', endTime: '15:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac3Id, courtId: f3c[2]._id, courtName: f3c[2].name, sport: 'Košarka', date: dateOffset(3), startTime: '18:00', endTime: '20:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    // === Dalja budućnost ===
    { user: ath1Id, facility: fac1Id, courtId: f1c[0]._id, courtName: f1c[0].name, sport: 'Tenis', date: dateOffset(7), startTime: '10:00', endTime: '11:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac1Id, courtId: f1c[2]._id, courtName: f1c[2].name, sport: 'Tenis', date: dateOffset(8), startTime: '16:00', endTime: '18:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, courtId: f2c[2]._id, courtName: f2c[2].name, sport: 'Fudbal', date: dateOffset(7), startTime: '17:00', endTime: '19:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, courtId: f2c[4]._id, courtName: f2c[4].name, sport: 'Badminton', date: dateOffset(10), startTime: '12:00', endTime: '14:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, courtId: f1c[7]._id, courtName: f1c[7].name, sport: 'Teretana', date: dateOffset(7), startTime: '08:00', endTime: '10:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, courtId: f1c[8]._id, courtName: f1c[8].name, sport: 'Rukomet', date: dateOffset(14), startTime: '18:00', endTime: '20:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    // === Otkazane ===
    { user: ath1Id, facility: fac1Id, courtId: f1c[1]._id, courtName: f1c[1].name, sport: 'Tenis', date: dateOffset(2), startTime: '12:00', endTime: '13:00', status: 'cancelled', cancelledAt: new Date(), attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, courtId: f2c[1]._id, courtName: f2c[1].name, sport: 'Tenis', date: dateOffset(3), startTime: '20:00', endTime: '21:00', status: 'cancelled', cancelledAt: new Date(), attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() }
  ];
  await db.collection('reservations').insertMany(reservations);
  console.log(`  ✅ ${reservations.length} rezervacija (13 prošle, 10 buduće, 3 ova nedelja, 4 danas/sutra, 2 otkazane)`);

  // ╔══════════════════════════════════════════╗
  // ║           RECENZIJE (12)                ║
  // ╚══════════════════════════════════════════╝
  console.log('\n--- RECENZIJE ---');
  await db.collection('reviews').insertMany([
    { user: ath1Id, facility: fac1Id, isLike: true, comment: 'Odlični tereni, profesionalno osoblje!', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac1Id, isLike: true, comment: 'Najbolji teniski tereni u gradu.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac2Id, isLike: false, comment: 'Preskupi tereni u odnosu na kvalitet.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac3Id, isLike: true, comment: 'Solidna teretana, pristupačne cene.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, isLike: true, comment: 'Super odbojkaška hala, čista i uredna.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, isLike: true, comment: 'Bazen je odličan, voda topla.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac1Id, isLike: false, comment: 'Gužva u teretani u popodnevnim satima.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, isLike: true, comment: 'Badminton sala uvek slobodna vikendom.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, isLike: true, comment: 'Košarkaška hala je vrhunska!', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, isLike: true, comment: 'Stoni tenis - odlična sala, 4 profesionalna stola.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, isLike: false, comment: 'Rukometna dvorana nema grejanje.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac3Id, isLike: true, comment: 'Košarka u Nišu - super atmosfera!', createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('  ✅ 12 recenzija');

  // ╔══════════════════════════════════════════╗
  // ║           TRENINZI (10)                  ║
  // ╚══════════════════════════════════════════╝
  console.log('\n--- TRENINZI ---');
  await db.collection('trainings').insertMany([
    { athlete: ath1Id, trainer: trIds[0], facility: fac1Id, courtId: f1c[0]._id || null, courtName: f1c[0].name, sport: 'Tenis', date: dateOffset(-10), startTime: '10:00', endTime: '11:00', price: 2000, status: 'completed', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath1Id, trainer: trIds[0], facility: fac1Id, courtId: f1c[0]._id || null, courtName: f1c[0].name, sport: 'Tenis', date: dateOffset(5), startTime: '10:00', endTime: '11:00', price: 2000, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath1Id, trainer: trIds[1], facility: fac1Id, courtId: f1c[3]._id || null, courtName: f1c[3].name, sport: 'Fudbal', date: dateOffset(8), startTime: '17:00', endTime: '19:00', price: 5000, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath1Id, trainer: trIds[0], facility: fac1Id, courtId: f1c[0]._id || null, courtName: f1c[0].name, sport: 'Tenis', date: dateOffset(1), startTime: '14:00', endTime: '15:00', price: 2000, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath2Id, trainer: trIds[3], facility: fac2Id, courtId: f2c[3]._id || null, courtName: f2c[3].name, sport: 'Odbojka', date: dateOffset(-5), startTime: '18:00', endTime: '20:00', price: 3000, status: 'completed', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath2Id, trainer: trIds[3], facility: fac2Id, courtId: f2c[3]._id || null, courtName: f2c[3].name, sport: 'Odbojka', date: dateOffset(4), startTime: '18:00', endTime: '20:00', price: 3000, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath2Id, trainer: trIds[4], facility: fac2Id, courtId: f2c[5]._id || null, courtName: f2c[5].name, sport: 'Plivanje', date: dateOffset(6), startTime: '08:00', endTime: '09:00', price: 1600, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath2Id, trainer: trIds[4], facility: fac2Id, courtId: f2c[5]._id || null, courtName: f2c[5].name, sport: 'Plivanje', date: dateOffset(2), startTime: '10:00', endTime: '11:00', price: 1600, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath3Id, trainer: trIds[1], facility: fac1Id, courtId: f1c[4]._id || null, courtName: f1c[4].name, sport: 'Košarka', date: dateOffset(-7), startTime: '14:00', endTime: '16:00', price: 5000, status: 'completed', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath3Id, trainer: trIds[1], facility: fac1Id, courtId: f1c[4]._id || null, courtName: f1c[4].name, sport: 'Košarka', date: dateOffset(6), startTime: '14:00', endTime: '16:00', price: 5000, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath3Id, trainer: trIds[5], facility: fac3Id, courtId: f3c[2]._id || null, courtName: f3c[2].name, sport: 'Košarka', date: dateOffset(10), startTime: '10:00', endTime: '12:00', price: 3600, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath1Id, trainer: trIds[2], facility: fac1Id, courtId: f1c[6]._id || null, courtName: f1c[6].name, sport: 'Plivanje', date: dateOffset(12), startTime: '11:00', endTime: '12:00', price: 1800, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath3Id, trainer: trIds[1], facility: fac1Id, courtId: f1c[4]._id || null, courtName: f1c[4].name, sport: 'Košarka', date: dateOffset(0), startTime: '16:00', endTime: '18:00', price: 5000, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('  ✅ 13 treninga (3 održana, 10 zakazana, 3 u tekućoj nedelji)');

  // ╔══════════════════════════════════════════╗
  // ║           PORUDŽBINE (10)                ║
  // ╚══════════════════════════════════════════╝
  console.log('\n--- PORUDŽBINE ---');
  await db.collection('orders').insertMany([
    { user: ath1Id, items: [{ equipment: eqIds[0], name: 'Teniski reket Pro', price: 8500, quantity: 1 }], totalPrice: 8500, facility: fac1Id, status: 'picked_up', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, items: [{ equipment: eqIds[1], name: 'Lopte za tenis (3 kom)', price: 1200, quantity: 2 }, { equipment: eqIds[12], name: 'Teniske patike', price: 7500, quantity: 1 }], totalPrice: 9900, facility: fac1Id, status: 'ordered', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, items: [{ equipment: eqIds[3], name: 'Košarkaška lopta', price: 4000, quantity: 1 }], totalPrice: 4000, facility: fac1Id, status: 'cancelled', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, items: [{ equipment: eqIds[5], name: 'Odbojkaška lopta', price: 3000, quantity: 1 }, { equipment: eqIds[6], name: 'Badminton set', price: 2500, quantity: 1 }], totalPrice: 5500, facility: fac2Id, status: 'picked_up', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, items: [{ equipment: eqIds[4], name: 'Teniski reket Amater', price: 4500, quantity: 1 }], totalPrice: 4500, facility: fac2Id, status: 'ordered', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, items: [{ equipment: eqIds[13], name: 'Joga prostirka', price: 2200, quantity: 2 }], totalPrice: 4400, facility: fac2Id, status: 'ordered', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, items: [{ equipment: eqIds[7], name: 'Proteini Whey 1kg', price: 4500, quantity: 2 }, { equipment: eqIds[9], name: 'Pojas za tegove', price: 2800, quantity: 1 }], totalPrice: 11800, facility: fac1Id, status: 'picked_up', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, items: [{ equipment: eqIds[2], name: 'Fudbalska lopta', price: 3500, quantity: 1 }], totalPrice: 3500, facility: fac1Id, status: 'cancelled', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, items: [{ equipment: eqIds[10], name: 'Rukometna lopta', price: 3200, quantity: 1 }, { equipment: eqIds[11], name: 'Štucne fudbalske', price: 1500, quantity: 2 }], totalPrice: 6200, facility: fac3Id, status: 'ordered', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, items: [{ equipment: eqIds[8], name: 'Kupaći kostim', price: 3500, quantity: 1 }], totalPrice: 3500, facility: fac1Id, status: 'ordered', createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('  ✅ 10 porudžbina (3 preuzete, 5 naručenih, 2 otkazane)');

  // ╔══════════════════════════════════════════╗
  // ║           SAIGRAČI (6)                  ║
  // ╚══════════════════════════════════════════╝
  console.log('\n--- SAIGRAČI ---');
  await db.collection('teammate_posts').insertMany([
    { author: ath3Id, sport: 'Košarka', city: 'Beograd', date: dateOffset(4), startTime: '18:00', endTime: '20:00', facility: fac1Id, missingPlayers: 3, description: 'Tražim 3 igrača za basket. Svi nivoi dobrodošli!', joinRequests: [{ user: ath1Id, status: 'approved' }, { user: ath2Id, status: 'pending' }], approvedPlayers: [ath1Id], isActive: true, isComplete: false, createdAt: new Date(), updatedAt: new Date() },
    { author: ath1Id, sport: 'Fudbal', city: 'Beograd', date: dateOffset(6), startTime: '16:00', endTime: '19:00', facility: fac1Id, missingPlayers: 4, description: 'Fali nam 4 igrača za mali fudbal, teren već rezervisan.', joinRequests: [], approvedPlayers: [], isActive: true, isComplete: false, createdAt: new Date(), updatedAt: new Date() },
    { author: ath2Id, sport: 'Odbojka', city: 'Novi Sad', date: dateOffset(3), startTime: '20:00', endTime: '22:00', facility: fac2Id, missingPlayers: 1, description: 'Treba nam još 1 za odbojku, igramo rekreativno.', joinRequests: [{ user: ath3Id, status: 'pending' }], approvedPlayers: [], isActive: true, isComplete: false, createdAt: new Date(), updatedAt: new Date() },
    { author: ath3Id, sport: 'Košarka', city: 'Niš', date: dateOffset(8), startTime: '10:00', endTime: '12:00', facility: fac3Id, missingPlayers: 2, description: 'Košarka u Nišu, nedelja ujutru, teren plaćen.', joinRequests: [], approvedPlayers: [], isActive: true, isComplete: false, createdAt: new Date(), updatedAt: new Date() },
    { author: ath2Id, sport: 'Badminton', city: 'Novi Sad', date: dateOffset(2), startTime: '14:00', endTime: '15:00', facility: fac2Id, missingPlayers: 0, description: 'Badminton par - kompletno!', joinRequests: [{ user: ath1Id, status: 'approved' }], approvedPlayers: [ath1Id], isActive: false, isComplete: true, createdAt: new Date(), updatedAt: new Date() },
    { author: ath1Id, sport: 'Tenis', city: 'Beograd', date: dateOffset(1), startTime: '08:00', endTime: '09:00', facility: fac1Id, missingPlayers: 1, description: 'Tražim sparing partnera za tenis, sutra ujutru.', joinRequests: [], approvedPlayers: [], isActive: true, isComplete: false, createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('  ✅ 6 oglasa (5 aktivnih, 1 kompletan)');

  // ==================== KRAJ ====================
  console.log('\n══════════════════════════════════════════');
  console.log('  ✅ SEED USPJEŠNO ZAVRŠEN!');
  console.log('══════════════════════════════════════════\n');
  console.log('📊 STATISTIKA:');
  console.log('   • 10 sportova       • 3 objekta (19 terena ukupno)');
  console.log('   • 6 korisnika        • 7 trenera');
  console.log('   • 14 artikala opreme • 6 promocija');
  console.log(`   • ${reservations.length} rezervacija   • 12 recenzija`);
  console.log('   • 13 treninga        • 10 porudžbina');
  console.log('   • 6 saigrača\n');
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│                   📋 DEMO NALOZI                            │');
  console.log('├──────────────┬──────────────────────────┬────────────────────┤');
  console.log('│     Uloga    │   Korisničko ime         │   Lozinka          │');
  console.log('├──────────────┼──────────────────────────┼────────────────────┤');
  console.log('│  👑 ADMIN    │   admin                  │   Admin123!        │');
  console.log('│  🏃 Sportista│   sportista1             │   Admin123!        │');
  console.log('│  🏃 Sportista│   sportista2             │   Admin123!        │');
  console.log('│  🏃 Sportista│   sportista3             │   Admin123!        │');
  console.log('│  🏢 Zaposleni│   zaposleni1 (BG+NI)     │   Admin123!        │');
  console.log('│  🏢 Zaposleni│   zaposleni2 (NS)        │   Admin123!        │');
  console.log('└──────────────┴──────────────────────────┴────────────────────┘\n');

  await mongoose.disconnect();
  console.log('🔌 Diskonektovano sa MongoDB\n');
}

seed().catch(err => {
  console.error('❌ GREŠKA:', err);
  mongoose.disconnect();
  process.exit(1);
});
