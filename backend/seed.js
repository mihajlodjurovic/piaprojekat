const mongoose = require('mongoose');
const path = require('path');

// Models (JS require from dist after build... for seed we compile with ts-node or use JS versions)
// Since seed runs directly, use the Mongoose models directly
const MONGODB_URI = 'mongodb://localhost:27017/sportsphere_hub';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // Clear all collections
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
  }
  console.log('Cleared all collections');

  // Plain text password
  const password = 'Lozinka1!';

  // ==================== SPORTOVI ====================
  const sports = await db.collection('sports').insertMany([
    { name: 'Tenis', isActive: true },
    { name: 'Fudbal', isActive: true },
    { name: 'Košarka', isActive: true },
    { name: 'Odbojka', isActive: true },
    { name: 'Plivanje', isActive: true },
    { name: 'Stoni tenis', isActive: true },
    { name: 'Badminton', isActive: true },
    { name: 'Teretana', isActive: true },
    { name: 'Joga', isActive: true }
  ]);
  console.log('Created sports');

  // ==================== USERS ====================
  const users = await db.collection('users').insertMany([
    {
      username: 'admin', email: 'admin@sportsphere.com', password,
      role: 'admin', firstName: 'Admin', lastName: 'Sistema', contactPhone: '0600000000',
      profileImage: 'default-avatar.png', approvalStatus: 'approved', isActive: true,
      favoriteSports: [], blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'zaposleni1', email: 'emp1@sportsphere.com', password,
      role: 'employee', firstName: 'Marko', lastName: 'Marković', contactPhone: '0611111111',
      facilityName: 'Sportski Centar Beograd', facilityAddress: 'Bulevar oslobođenja 100, Beograd',
      registrationNumber: '12345678', pib: '123456789',
      profileImage: 'default-avatar.png', approvalStatus: 'approved', isActive: true,
      favoriteSports: [], blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'zaposleni2', email: 'emp2@sportsphere.com', password,
      role: 'employee', firstName: 'Jelena', lastName: 'Jovanović', contactPhone: '0622222222',
      facilityName: 'Sportski Centar Novi Sad', facilityAddress: 'Bulevar Evrope 50, Novi Sad',
      registrationNumber: '87654321', pib: '987654321',
      profileImage: 'default-avatar.png', approvalStatus: 'approved', isActive: true,
      favoriteSports: [], blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'sportista1', email: 'ath1@sportsphere.com', password,
      role: 'athlete', firstName: 'Petar', lastName: 'Petrović', contactPhone: '0633333333',
      favoriteSports: ['Tenis', 'Fudbal', 'Košarka'],
      profileImage: 'default-avatar.png', approvalStatus: 'approved', isActive: true,
      blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'sportista2', email: 'ath2@sportsphere.com', password,
      role: 'athlete', firstName: 'Ana', lastName: 'Anić', contactPhone: '0644444444',
      favoriteSports: ['Odbojka', 'Plivanje', 'Joga'],
      profileImage: 'default-avatar.png', approvalStatus: 'approved', isActive: true,
      blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      username: 'sportista3', email: 'ath3@sportsphere.com', password,
      role: 'athlete', firstName: 'Nikola', lastName: 'Nikolić', contactPhone: '0655555555',
      favoriteSports: ['Košarka', 'Teretana', 'Stoni tenis', 'Badminton'],
      profileImage: 'default-avatar.png', approvalStatus: 'approved', isActive: true,
      blockedFacilities: [],
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  const adminId = users.insertedIds[0];
  const emp1Id = users.insertedIds[1];
  const emp2Id = users.insertedIds[2];
  const ath1Id = users.insertedIds[3];
  const ath2Id = users.insertedIds[4];
  const ath3Id = users.insertedIds[5];
  console.log('Created users');

  // ==================== FACILITIES ====================
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
        { name: 'Teretana', type: 'indoor', sport: 'Teretana', capacity: 50, spotsCount: 20, pricePerHour: 600, equipmentDescription: 'Profesionalna oprema', isActive: true }
      ],
      workingHours: { open: '08:00', close: '22:00' }, maxNoShows: 3, pricePerHour: 1500,
      location: { latitude: 44.7866, longitude: 20.4489 },
      mainImage: 'default-facility.jpg', galleryImages: [],
      likes: 45, dislikes: 3, likedBy: [], dislikedBy: [],
      approvalStatus: 'approved', isActive: true,
      createdAt: new Date(), updatedAt: new Date()
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
        { name: 'Badminton sala', type: 'indoor', sport: 'Badminton', capacity: 4, spotsCount: 4, pricePerHour: 800, equipmentDescription: '2 terena', isActive: true }
      ],
      workingHours: { open: '08:00', close: '22:00' }, maxNoShows: 3, pricePerHour: 1200,
      location: { latitude: 45.2671, longitude: 19.8335 },
      mainImage: 'default-facility.jpg', galleryImages: [],
      likes: 32, dislikes: 2, likedBy: [], dislikedBy: [],
      approvalStatus: 'approved', isActive: true,
      createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  const fac1Id = facilities.insertedIds[0];
  const fac2Id = facilities.insertedIds[1];

  // Get court IDs from facility 1
  const fac1 = await db.collection('sport_facilities').findOne({ _id: fac1Id });
  const fac2 = await db.collection('sport_facilities').findOne({ _id: fac2Id });
  const fac1Courts = fac1.courts;
  const fac2Courts = fac2.courts;
  console.log('Created facilities');

  // ==================== TRAINERS ====================
  const trainers = await db.collection('trainers').insertMany([
    { firstName: 'Dejan', lastName: 'Dejanović', specialization: ['Tenis'], facility: fac1Id, pricePerHour: 2000, averageRating: 4.8, totalRatings: 25, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { firstName: 'Miloš', lastName: 'Milošević', specialization: ['Košarka', 'Fudbal'], facility: fac1Id, pricePerHour: 2500, averageRating: 4.5, totalRatings: 18, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { firstName: 'Ivana', lastName: 'Ivanović', specialization: ['Plivanje'], facility: fac1Id, pricePerHour: 1800, averageRating: 4.9, totalRatings: 30, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { firstName: 'Nataša', lastName: 'Natašić', specialization: ['Odbojka', 'Badminton'], facility: fac2Id, pricePerHour: 1500, averageRating: 4.3, totalRatings: 12, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]);
  const tr1Id = trainers.insertedIds[0];
  const tr2Id = trainers.insertedIds[1];
  console.log('Created trainers');

  // ==================== EQUIPMENT ====================
  const equipment = await db.collection('equipment').insertMany([
    { name: 'Teniski reket Pro', sport: 'Tenis', description: 'Profesionalni teniski reket', price: 8500, stock: 15, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Lopte za tenis (3 kom)', sport: 'Tenis', description: 'Set od 3 profesionalne loptice', price: 1200, stock: 50, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Fudbalska lopta', sport: 'Fudbal', description: 'Zvanična lopta veličine 5', price: 3500, stock: 20, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Košarkaška lopta', sport: 'Košarka', description: 'Profesionalna lopta veličine 7', price: 4000, stock: 15, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Teniski reket Amater', sport: 'Tenis', description: 'Reket za početnike', price: 4500, stock: 10, facility: fac2Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Odbojkaška lopta', sport: 'Odbojka', description: 'Profesionalna odbojkaška lopta', price: 3000, stock: 12, facility: fac2Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Badminton set', sport: 'Badminton', description: 'Set sa 2 reketa i 3 loptice', price: 2500, stock: 8, facility: fac2Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Proteini Whey 1kg', sport: 'Teretana', description: 'Whey protein koncentrat', price: 4500, stock: 30, facility: fac1Id, image: 'default-equipment.jpg', isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]);
  const eqIds = Object.values(equipment.insertedIds);
  console.log('Created equipment');

  // ==================== PROMOTIONS ====================
  const today = new Date();
  await db.collection('promotions').insertMany([
    { name: 'Letnji teniski popust', description: '30% popusta na sve teniske terene', facility: fac1Id, sport: 'Tenis', discountType: 'percentage', discountValue: 30, startDate: today, endDate: new Date(today.getTime() + 30*24*60*60*1000), isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Vikend fudbal akcija', description: 'Treći sat besplatno', facility: fac2Id, sport: 'Fudbal', discountType: 'fixed', discountValue: 2000, startDate: today, endDate: new Date(today.getTime() + 14*24*60*60*1000), isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Članstvo u teretani', description: '20% popusta na mesečno članstvo', facility: fac1Id, sport: 'Teretana', discountType: 'percentage', discountValue: 20, startDate: today, endDate: new Date(today.getTime() + 60*24*60*60*1000), isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('Created promotions');

  // ==================== RESERVATIONS ====================
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  await db.collection('reservations').insertMany([
    { user: ath1Id, facility: fac1Id, courtId: fac1Courts[0]._id, courtName: 'Teniski teren 1', sport: 'Tenis', date: tomorrow, startTime: '10:00', endTime: '11:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac1Id, courtId: fac1Courts[3]._id, courtName: 'Fudbalski teren', sport: 'Fudbal', date: new Date(today.getTime() + 2*24*60*60*1000), startTime: '16:00', endTime: '18:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, courtId: fac2Courts[3]._id, courtName: 'Odbojkaška hala', sport: 'Odbojka', date: tomorrow, startTime: '18:00', endTime: '20:00', status: 'active', attendanceStatus: 'confirmed', createdAt: new Date(), updatedAt: new Date() },
    { user: ath3Id, facility: fac1Id, courtId: fac1Courts[4]._id, courtName: 'Košarkaška hala', sport: 'Košarka', date: new Date(today.getTime() + 3*24*60*60*1000), startTime: '09:00', endTime: '11:00', status: 'active', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('Created reservations');

  // ==================== REVIEWS ====================
  await db.collection('reviews').insertMany([
    { user: ath1Id, facility: fac1Id, isLike: true, comment: 'Odlični tereni, profesionalno osoblje!', createdAt: new Date(), updatedAt: new Date() },
    { user: ath2Id, facility: fac2Id, isLike: true, comment: 'Super odbojkaška hala, čista i uredna.', createdAt: new Date(), updatedAt: new Date() },
    { user: ath1Id, facility: fac2Id, isLike: false, comment: 'Preskupi tereni u odnosu na kvalitet.', createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('Created reviews');

  // ==================== TRAININGS ====================
  await db.collection('trainings').insertMany([
    { athlete: ath1Id, trainer: tr1Id, facility: fac1Id, courtId: fac1Courts[0]._id, sport: 'Tenis', date: new Date(today.getTime() + 5*24*60*60*1000), startTime: '10:00', endTime: '11:00', price: 2000, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() },
    { athlete: ath3Id, trainer: tr2Id, facility: fac1Id, courtId: fac1Courts[4]._id, sport: 'Košarka', date: new Date(today.getTime() + 6*24*60*60*1000), startTime: '14:00', endTime: '16:00', price: 5000, status: 'scheduled', attendanceStatus: 'pending', createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('Created trainings');

  // ==================== ORDERS ====================
  await db.collection('orders').insertOne({
    user: ath1Id, items: [{ equipment: eqIds[0], name: 'Teniski reket Pro', price: 8500, quantity: 1 }],
    totalPrice: 8500, facility: fac1Id, status: 'ordered',
    createdAt: new Date(), updatedAt: new Date()
  });
  console.log('Created orders');

  // ==================== TEAMMATE POSTS ====================
  await db.collection('teammate_posts').insertOne({
    author: ath3Id, sport: 'Košarka', city: 'Beograd',
    date: new Date(today.getTime() + 4*24*60*60*1000),
    startTime: '18:00', endTime: '20:00', facility: fac1Id,
    missingPlayers: 3, description: 'Tražim 3 igrača za basket. Svi nivoi dobrodošli!',
    joinRequests: [], approvedPlayers: [],
    isActive: true, isComplete: false,
    createdAt: new Date(), updatedAt: new Date()
  });
  console.log('Created teammate post');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Demo nalozi:');
  console.log('  Admin:     admin / Lozinka1!');
  console.log('  Sportista: sportista1 / Lozinka1!');
  console.log('  Sportista: sportista2 / Lozinka1!');
  console.log('  Sportista: sportista3 / Lozinka1!');
  console.log('  Zaposleni: zaposleni1 / Lozinka1! (SC Beograd)');
  console.log('  Zaposleni: zaposleni2 / Lozinka1! (SC Novi Sad)');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); mongoose.disconnect(); });
