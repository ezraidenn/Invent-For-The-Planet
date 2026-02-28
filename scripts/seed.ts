import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import * as schema from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ══════════════════════════════════════════════════════════════════════
// REAL LOCATIONS — Mérida, Yucatán (primary) + national cities
// ══════════════════════════════════════════════════════════════════════

// Mérida neighborhoods with REAL coordinates and street addresses
const MERIDA = {
  // Centro Histórico
  centroParque:     { latitude: 20.9674, longitude: -89.6245, address: "Calle 60 #499, Centro, Mérida, Yuc." },
  centroMercado:    { latitude: 20.9650, longitude: -89.6262, address: "Calle 65 x 56, Mercado Lucas de Gálvez, Mérida" },
  santaAna:         { latitude: 20.9712, longitude: -89.6283, address: "Calle 47 #512, Barrio de Santa Ana, Mérida" },
  santiago:         { latitude: 20.9635, longitude: -89.6310, address: "Calle 72 #401, Barrio de Santiago, Mérida" },
  // Norte
  altabrisa:        { latitude: 20.9935, longitude: -89.5948, address: "Calle 7 #451, Fracc. Altabrisa, Mérida" },
  montebello:       { latitude: 20.9980, longitude: -89.5870, address: "Av. Cámara de Comercio #120, Montebello, Mérida" },
  benito:           { latitude: 21.0015, longitude: -89.6120, address: "Calle 50 #200, Benito Juárez Nte., Mérida" },
  montesCristoN:    { latitude: 21.0102, longitude: -89.5985, address: "Calle 15 #890, Montes de Amé, Mérida" },
  // Prolongación Montejo
  prolongMontejo:   { latitude: 20.9890, longitude: -89.6185, address: "Prolongación Montejo #300, Mérida" },
  montejo:          { latitude: 20.9780, longitude: -89.6210, address: "Paseo de Montejo #480, Mérida" },
  // Poniente
  caucel:           { latitude: 21.0050, longitude: -89.6720, address: "C. 31 #102, Com. Caucel, Mérida" },
  pacificoBrisa:    { latitude: 20.9920, longitude: -89.6550, address: "Calle 138 #280, Las Brisas, Mérida" },
  pensiones:        { latitude: 20.9700, longitude: -89.6420, address: "Calle 25-A #123, Col. Pensiones, Mérida" },
  // Sur
  garciaGineres:    { latitude: 20.9588, longitude: -89.6295, address: "Calle 27 #199, García Ginerés, Mérida" },
  chuburna:         { latitude: 20.9560, longitude: -89.6142, address: "Calle 13 #256, Chuburná de Hidalgo, Mérida" },
  itzimna:          { latitude: 20.9815, longitude: -89.6165, address: "Calle 19 #340, Itzimná, Mérida" },
  sMarcos:          { latitude: 20.9630, longitude: -89.6350, address: "Calle 36 x 75, Parque de San Marcos, Mérida" },
  miraflores:       { latitude: 20.9510, longitude: -89.6050, address: "Calle 24 #480, Miraflores, Mérida" },
  // Oriente
  lasAmericas:      { latitude: 20.9755, longitude: -89.6055, address: "Calle 49 #302, Fracc. Las Américas, Mérida" },
  fracc59:          { latitude: 20.9820, longitude: -89.5975, address: "Calle 59 #608, Fracc. del Parque, Mérida" },
  vergel:           { latitude: 20.9690, longitude: -89.5880, address: "Av. Yucatán #215, Col. Vergel, Mérida" },
  // Periférico
  perifNorte:       { latitude: 20.9975, longitude: -89.6410, address: "Periférico Norte km 8, Mérida" },
  perifSur:         { latitude: 20.9380, longitude: -89.6180, address: "Periférico Sur km 5, Mérida" },
  perifOriente:     { latitude: 20.9650, longitude: -89.5750, address: "Periférico Oriente km 6.5, Mérida" },
  grandPlaza:       { latitude: 20.9498, longitude: -89.5880, address: "Gran Plaza Mérida, Periférico Sur" },
  // Residenciales populares
  francisco:        { latitude: 20.9845, longitude: -89.6080, address: "Calle 21 #455, Francisco de Montejo, Mérida" },
  leandro:          { latitude: 20.9470, longitude: -89.6310, address: "Calle 77 #610, Leandro Valle, Mérida" },
};

// National cities — to show ReciMap works across Mexico
const NATIONAL = {
  // CDMX
  cdmxRoma:         { latitude: 19.4195, longitude: -99.1640, address: "Av. Álvaro Obregón #185, Col. Roma Norte, CDMX" },
  cdmxCondesa:      { latitude: 19.4120, longitude: -99.1750, address: "Av. Tamaulipas #78, Condesa, CDMX" },
  cdmxCoyoacan:     { latitude: 19.3500, longitude: -99.1620, address: "Calle Francisco Sosa #42, Coyoacán, CDMX" },
  cdmxXochimilco:   { latitude: 19.2630, longitude: -99.1040, address: "Av. México #135, Xochimilco, CDMX" },
  // Guadalajara
  gdlZapopan:       { latitude: 20.7210, longitude: -103.3890, address: "Av. Patria #1500, Zapopan, Jal." },
  gdlTlaquepaque:   { latitude: 20.6390, longitude: -103.3120, address: "Calle Independencia #208, Tlaquepaque, Jal." },
  // Monterrey
  mtyGarza:         { latitude: 25.6510, longitude: -100.2890, address: "Av. Lázaro Cárdenas #2810, Garza García, N.L." },
  mtySanPedro:      { latitude: 25.6600, longitude: -100.3560, address: "Calzada San Pedro #400, San Pedro, N.L." },
  // Cancún
  cancunHZ:         { latitude: 21.1600, longitude: -86.8280, address: "Blvd. Kukulcán km 9, Zona Hotelera, Cancún" },
  cancunCentro:     { latitude: 21.1750, longitude: -86.8460, address: "Av. Tulum #260, SM 4, Cancún, Q. Roo" },
  // Puebla
  pueblaCentro:     { latitude: 19.0430, longitude: -98.1980, address: "Calle 5 de Mayo #312, Centro, Puebla" },
};

// ══════════════════════════════════════════════════════════════════════
// REAL RECYCLING PRICES IN MEXICO (MXN/kg) — sourced from:
//   - Milenio (2024): aluminio $22/kg, PET $7.16/kg, cartón $0.47-3/kg
//   - Supraciclaje.com price list (2025)
//   - Vanguardia MX: latas $22-30/kg, PET $5-8/kg
//   - Regional variation: Mérida ~5-10% below CDMX avg
// ══════════════════════════════════════════════════════════════════════

const REAL_PRICES = {
  // materialType: [low, avg, high] in MXN/kg
  cardboard:     [1.00, 2.50, 3.50],
  pet:           [5.00, 7.00, 9.00],
  aluminum:      [18.00, 23.00, 28.00],
  glass:         [0.30, 0.80, 1.50],
  paper:         [0.50, 1.50, 3.00],
  cooking_oil:   [5.00, 8.00, 12.00],
  electronics:   [10.00, 18.00, 30.00],
  metal_scrap:   [8.00, 14.00, 22.00],
  wood:          [0.50, 1.00, 2.00],
  other:         [0.20, 0.50, 1.00],
};

function rnd(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function daysAgo(d: number) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

async function seed() {
  console.log("\n🌱 ReciMap — Seeding ultra-realistic production data...\n");

  // Clean existing data in order
  await db.delete(schema.transactionItems);
  await db.delete(schema.transactions);
  await db.delete(schema.notifications);
  await db.delete(schema.priceHistory);
  await db.delete(schema.centerPrices);
  await db.delete(schema.listings);
  await db.delete(schema.batches);
  await db.delete(schema.centers);
  await db.delete(schema.users);

  const pw = await hash("demo123", 12);

  // ═══════════════════════════════════════════════════════════════════
  // USERS — 18 users across Mexico
  // ═══════════════════════════════════════════════════════════════════

  // — Businesses (Mérida) —
  const [biz1] = await db.insert(schema.users).values({
    email: "restaurant@demo.com", name: "Taquería El Sol", role: "business", passwordHash: pw,
    ...MERIDA.centroParque, ecoPoints: 4850, totalKg: 1280, level: "gold",
  }).returning();

  const [biz2] = await db.insert(schema.users).values({
    email: "hotel@demo.com", name: "Hotel Mérida Palace", role: "business", passwordHash: pw,
    ...MERIDA.prolongMontejo, ecoPoints: 8200, totalKg: 2450, level: "platinum",
  }).returning();

  const [biz3] = await db.insert(schema.users).values({
    email: "oxxo@demo.com", name: "OXXO Montejo 24h", role: "business", passwordHash: pw,
    ...MERIDA.montejo, ecoPoints: 2100, totalKg: 560, level: "silver",
  }).returning();

  const [biz4] = await db.insert(schema.users).values({
    email: "cafeteria@demo.com", name: "Café Impala", role: "business", passwordHash: pw,
    ...MERIDA.itzimna, ecoPoints: 1350, totalKg: 340, level: "silver",
  }).returning();

  // — Households (Mérida) —
  const [hh1] = await db.insert(schema.users).values({
    email: "maria@demo.com", name: "María García Cámara", role: "household", passwordHash: pw,
    ...MERIDA.lasAmericas, ecoPoints: 2520, totalKg: 385, level: "silver",
  }).returning();

  const [hh2] = await db.insert(schema.users).values({
    email: "carlos@demo.com", name: "Carlos López Pech", role: "household", passwordHash: pw,
    ...MERIDA.garciaGineres, ecoPoints: 780, totalKg: 128, level: "bronze",
  }).returning();

  const [hh3] = await db.insert(schema.users).values({
    email: "ana@demo.com", name: "Ana Rodríguez Chan", role: "household", passwordHash: pw,
    ...MERIDA.altabrisa, ecoPoints: 1640, totalKg: 245, level: "silver",
  }).returning();

  const [hh4] = await db.insert(schema.users).values({
    email: "pedro@demo.com", name: "Pedro Martínez Uc", role: "household", passwordHash: pw,
    ...MERIDA.chuburna, ecoPoints: 940, totalKg: 152, level: "bronze",
  }).returning();

  const [hh5] = await db.insert(schema.users).values({
    email: "luisa@demo.com", name: "Luisa Fernández Cen", role: "household", passwordHash: pw,
    ...MERIDA.francisco, ecoPoints: 3100, totalKg: 490, level: "gold",
  }).returning();

  const [hh6] = await db.insert(schema.users).values({
    email: "diego@demo.com", name: "Diego Canul May", role: "household", passwordHash: pw,
    ...MERIDA.miraflores, ecoPoints: 420, totalKg: 68, level: "bronze",
  }).returning();

  // — Recyclers —
  const [rec1] = await db.insert(schema.users).values({
    email: "recycler@demo.com", name: "Juan Recolector Uicab", role: "recycler", passwordHash: pw,
    ...MERIDA.pensiones, ecoPoints: 12400, totalKg: 4850, level: "platinum",
    rating: 4.9, totalRatings: 142,
  }).returning();

  const [rec2] = await db.insert(schema.users).values({
    email: "recycler2@demo.com", name: "Luis Hernández Pool", role: "recycler", passwordHash: pw,
    ...MERIDA.leandro, ecoPoints: 6800, totalKg: 2120, level: "gold",
    rating: 4.7, totalRatings: 78,
  }).returning();

  const [rec3] = await db.insert(schema.users).values({
    email: "recycler3@demo.com", name: "Roberto Dzul Canché", role: "recycler", passwordHash: pw,
    ...MERIDA.caucel, ecoPoints: 3200, totalKg: 980, level: "silver",
    rating: 4.5, totalRatings: 34,
  }).returning();

  // — Center operators —
  const [cOp1] = await db.insert(schema.users).values({
    email: "center@demo.com", name: "EcoRecicla Yucatán", role: "center", passwordHash: pw,
    ...MERIDA.perifNorte, ecoPoints: 0, totalKg: 0,
  }).returning();

  const [cOp2] = await db.insert(schema.users).values({
    email: "center2@demo.com", name: "ReciYuc Sur", role: "center", passwordHash: pw,
    ...MERIDA.perifSur, ecoPoints: 0, totalKg: 0,
  }).returning();

  const [cOp3] = await db.insert(schema.users).values({
    email: "center3@demo.com", name: "Verde Limpio Oriente", role: "center", passwordHash: pw,
    ...MERIDA.perifOriente, ecoPoints: 0, totalKg: 0,
  }).returning();

  const [cOp4] = await db.insert(schema.users).values({
    email: "center4@demo.com", name: "Recicladora CDMX Roma", role: "center", passwordHash: pw,
    ...NATIONAL.cdmxRoma, ecoPoints: 0, totalKg: 0,
  }).returning();

  const [cOp5] = await db.insert(schema.users).values({
    email: "center5@demo.com", name: "EcoGDL Zapopan", role: "center", passwordHash: pw,
    ...NATIONAL.gdlZapopan, ecoPoints: 0, totalKg: 0,
  }).returning();

  const [cOp6] = await db.insert(schema.users).values({
    email: "center6@demo.com", name: "ReciclaYa Caucel", role: "center", passwordHash: pw,
    ...MERIDA.caucel, ecoPoints: 0, totalKg: 0,
  }).returning();

  const [cOp7] = await db.insert(schema.users).values({
    email: "center7@demo.com", name: "Reciclaje Montejo", role: "center", passwordHash: pw,
    ...MERIDA.montebello, ecoPoints: 0, totalKg: 0,
  }).returning();

  const [cOp8] = await db.insert(schema.users).values({
    email: "center8@demo.com", name: "AcoPIO García Ginerés", role: "center", passwordHash: pw,
    ...MERIDA.garciaGineres, ecoPoints: 0, totalKg: 0,
  }).returning();

  const [cOp9] = await db.insert(schema.users).values({
    email: "center9@demo.com", name: "ReciMTY San Pedro", role: "center", passwordHash: pw,
    ...NATIONAL.mtySanPedro, ecoPoints: 0, totalKg: 0,
  }).returning();

  const [cOp10] = await db.insert(schema.users).values({
    email: "center10@demo.com", name: "EcoPuebla Centro", role: "center", passwordHash: pw,
    ...NATIONAL.pueblaCentro, ecoPoints: 0, totalKg: 0,
  }).returning();

  console.log("  ✅ 23 users created (4 business, 6 household, 3 recycler, 10 center)");

  // ═══════════════════════════════════════════════════════════════════
  // CENTERS — 7 across Mexico (4 Mérida, 1 CDMX, 1 GDL, 1 Cancún)
  // ═══════════════════════════════════════════════════════════════════

  const [c1] = await db.insert(schema.centers).values({
    userId: cOp1.id, name: "EcoRecicla Yucatán",
    description: "Centro de acopio certificado por SEMARNAT. Pesaje digital, báscula industrial, pago inmediato en efectivo o transferencia. Compramos todo tipo de material reciclable.",
    ...MERIDA.perifNorte, phone: "+52 999 123 4567", isVerified: true, totalKgReceived: 48500,
    openHours: { mon: "7:00-18:00", tue: "7:00-18:00", wed: "7:00-18:00", thu: "7:00-18:00", fri: "7:00-18:00", sat: "8:00-14:00", sun: "Cerrado" },
  }).returning();

  const [c2] = await db.insert(schema.centers).values({
    userId: cOp2.id, name: "ReciYuc Sur",
    description: "Especialistas en PET, aluminio y cartón. Los mejores precios del sur de Mérida. Aceptamos volúmenes desde 1kg.",
    ...MERIDA.perifSur, phone: "+52 999 987 6543", isVerified: true, totalKgReceived: 32100,
    openHours: { mon: "6:30-17:00", tue: "6:30-17:00", wed: "6:30-17:00", thu: "6:30-17:00", fri: "6:30-17:00", sat: "7:00-13:00", sun: "Cerrado" },
  }).returning();

  const [c3] = await db.insert(schema.centers).values({
    userId: cOp3.id, name: "Verde Limpio Oriente",
    description: "Centro comunitario de reciclaje. Recibimos electrónicos, aceite usado, chatarra metálica y madera. Donamos parte a escuelas.",
    ...MERIDA.perifOriente, phone: "+52 999 555 1234", isVerified: true, totalKgReceived: 18700,
    openHours: { mon: "8:00-16:00", tue: "8:00-16:00", wed: "8:00-16:00", thu: "8:00-16:00", fri: "8:00-16:00", sat: "9:00-13:00", sun: "Cerrado" },
  }).returning();

  const [c4] = await db.insert(schema.centers).values({
    userId: cOp1.id, name: "Recicladora del Centro",
    description: "Punto de acopio en el centro histórico de Mérida. Ideal para negocios del primer cuadro.",
    latitude: 20.9688, longitude: -89.6270, address: "Calle 56 #489, Centro, Mérida, Yuc.",
    phone: "+52 999 234 5678", isVerified: false, totalKgReceived: 8900,
  }).returning();

  const [c5] = await db.insert(schema.centers).values({
    userId: cOp4.id, name: "ReciRoma CDMX",
    description: "Centro de reciclaje urbano en Col. Roma. Aceptamos separación doméstica, comercial e industrial.",
    ...NATIONAL.cdmxRoma, phone: "+52 55 1234 5678", isVerified: true, totalKgReceived: 95200,
    openHours: { mon: "7:00-19:00", tue: "7:00-19:00", wed: "7:00-19:00", thu: "7:00-19:00", fri: "7:00-19:00", sat: "8:00-15:00", sun: "9:00-13:00" },
  }).returning();

  const [c6] = await db.insert(schema.centers).values({
    userId: cOp5.id, name: "EcoGDL Zapopan",
    description: "El centro de acopio más grande de la zona metropolitana de Guadalajara. Servicio de recolección para empresas.",
    ...NATIONAL.gdlZapopan, phone: "+52 33 9876 5432", isVerified: true, totalKgReceived: 72400,
    openHours: { mon: "6:00-18:00", tue: "6:00-18:00", wed: "6:00-18:00", thu: "6:00-18:00", fri: "6:00-18:00", sat: "7:00-14:00", sun: "Cerrado" },
  }).returning();

  const [c7] = await db.insert(schema.centers).values({
    userId: cOp1.id, name: "Reciclados Cancún",
    description: "Centro de acopio zona hotelera y centro de Cancún. Servimos a hoteles, restaurantes y comercios.",
    ...NATIONAL.cancunCentro, phone: "+52 998 888 1234", isVerified: true, totalKgReceived: 41300,
  }).returning();

  const [c8] = await db.insert(schema.centers).values({
    userId: cOp6.id, name: "ReciclaYa Caucel",
    description: "Centro de acopio familiar en la comisaría de Caucel. Atendemos hogares y pequeños negocios del poniente de Mérida.",
    ...MERIDA.caucel, phone: "+52 999 444 1122", isVerified: true, totalKgReceived: 12400,
    openHours: { mon: "7:00-15:00", tue: "7:00-15:00", wed: "7:00-15:00", thu: "7:00-15:00", fri: "7:00-15:00", sat: "8:00-12:00", sun: "Cerrado" },
  }).returning();

  const [c9] = await db.insert(schema.centers).values({
    userId: cOp7.id, name: "Reciclaje Montejo",
    description: "Centro de acopio premium en zona Montejo-Montebello. Servicio express de pesaje y pago por transferencia SPEI.",
    ...MERIDA.montebello, phone: "+52 999 333 4455", isVerified: true, totalKgReceived: 28300,
    openHours: { mon: "8:00-18:00", tue: "8:00-18:00", wed: "8:00-18:00", thu: "8:00-18:00", fri: "8:00-18:00", sat: "9:00-14:00", sun: "Cerrado" },
  }).returning();

  const [c10] = await db.insert(schema.centers).values({
    userId: cOp8.id, name: "AcoPIO García Ginerés",
    description: "Punto de acopio en col. García Ginerés. Especialistas en papel, cartón y PET. Servicio de recolección a domicilio.",
    ...MERIDA.garciaGineres, phone: "+52 999 222 6677", isVerified: true, totalKgReceived: 15600,
    openHours: { mon: "7:30-16:30", tue: "7:30-16:30", wed: "7:30-16:30", thu: "7:30-16:30", fri: "7:30-16:30", sat: "8:00-13:00", sun: "Cerrado" },
  }).returning();

  const [c11] = await db.insert(schema.centers).values({
    userId: cOp9.id, name: "ReciMTY San Pedro",
    description: "Centro de reciclaje en San Pedro Garza García. Aceptamos todo material. Báscula certificada y pago inmediato.",
    ...NATIONAL.mtySanPedro, phone: "+52 81 5555 3344", isVerified: true, totalKgReceived: 68900,
    openHours: { mon: "6:00-18:00", tue: "6:00-18:00", wed: "6:00-18:00", thu: "6:00-18:00", fri: "6:00-18:00", sat: "7:00-14:00", sun: "Cerrado" },
  }).returning();

  const [c12] = await db.insert(schema.centers).values({
    userId: cOp10.id, name: "EcoPuebla Centro",
    description: "Centro de acopio en el centro histórico de Puebla. Compramos chatarra, PET, aluminio y cartón.",
    ...NATIONAL.pueblaCentro, phone: "+52 222 111 2233", isVerified: true, totalKgReceived: 34500,
    openHours: { mon: "7:00-17:00", tue: "7:00-17:00", wed: "7:00-17:00", thu: "7:00-17:00", fri: "7:00-17:00", sat: "8:00-13:00", sun: "Cerrado" },
  }).returning();

  console.log("  ✅ 12 centers created (7 Mérida + CDMX + GDL + Cancún + MTY + Puebla)");

  // ═══════════════════════════════════════════════════════════════════
  // PRICES — Real MXN/kg with regional variation
  // ═══════════════════════════════════════════════════════════════════

  const materials: (keyof typeof REAL_PRICES)[] = ["cardboard","pet","aluminum","glass","paper","cooking_oil","electronics","metal_scrap","wood","other"];

  const centerPriceData = [
    // Center 1 — EcoRecicla (full range, competitive)
    { cid: c1.id, mats: { cardboard: 2.80, pet: 7.50, aluminum: 24.00, glass: 0.80, paper: 2.00, cooking_oil: 9.00, electronics: 18.00, metal_scrap: 14.50, wood: 1.20 }},
    // Center 2 — ReciYuc Sur (PET/aluminum specialist, higher)
    { cid: c2.id, mats: { cardboard: 2.50, pet: 8.50, aluminum: 26.00, glass: 0.60, paper: 1.50, cooking_oil: 8.00, metal_scrap: 13.00 }},
    // Center 3 — Verde Limpio (electronics/oil specialist)
    { cid: c3.id, mats: { electronics: 22.00, cooking_oil: 10.50, metal_scrap: 16.00, aluminum: 22.00, wood: 1.50 }},
    // Center 4 — Centro Histórico (basic materials)
    { cid: c4.id, mats: { cardboard: 2.20, pet: 6.50, aluminum: 21.00, paper: 1.80, glass: 0.50 }},
    // Center 5 — CDMX Roma (premium prices, big city)
    { cid: c5.id, mats: { cardboard: 3.50, pet: 9.00, aluminum: 28.00, glass: 1.20, paper: 3.00, cooking_oil: 12.00, electronics: 25.00, metal_scrap: 18.00, wood: 2.00, other: 0.80 }},
    // Center 6 — GDL Zapopan (slightly below CDMX)
    { cid: c6.id, mats: { cardboard: 3.00, pet: 8.00, aluminum: 25.00, glass: 1.00, paper: 2.50, cooking_oil: 10.00, electronics: 20.00, metal_scrap: 15.00 }},
    // Center 7 — Cancún (tourist economy, mid-high)
    { cid: c7.id, mats: { cardboard: 2.80, pet: 7.80, aluminum: 24.50, glass: 0.90, paper: 2.00, cooking_oil: 9.50, metal_scrap: 14.00 }},
    // Center 8 — ReciclaYa Caucel (basic, lower prices)
    { cid: c8.id, mats: { cardboard: 2.00, pet: 6.00, aluminum: 20.00, glass: 0.40, paper: 1.20, cooking_oil: 7.00 }},
    // Center 9 — Reciclaje Montejo (premium Mérida)
    { cid: c9.id, mats: { cardboard: 3.20, pet: 8.00, aluminum: 25.50, glass: 1.00, paper: 2.80, cooking_oil: 10.00, electronics: 20.00, metal_scrap: 15.50 }},
    // Center 10 — AcoPIO García Ginerés (paper/cardboard specialist)
    { cid: c10.id, mats: { cardboard: 3.50, pet: 7.00, aluminum: 22.00, paper: 3.00, glass: 0.70 }},
    // Center 11 — ReciMTY (Monterrey, high prices)
    { cid: c11.id, mats: { cardboard: 3.20, pet: 8.50, aluminum: 27.00, glass: 1.10, paper: 2.80, cooking_oil: 11.00, electronics: 23.00, metal_scrap: 17.00, wood: 1.80 }},
    // Center 12 — EcoPuebla (mid prices)
    { cid: c12.id, mats: { cardboard: 2.80, pet: 7.50, aluminum: 24.00, glass: 0.80, paper: 2.20, cooking_oil: 9.00, metal_scrap: 14.00 }},
  ];

  for (const cp of centerPriceData) {
    for (const [mat, price] of Object.entries(cp.mats)) {
      await db.insert(schema.centerPrices).values({
        centerId: cp.cid, materialType: mat as any, pricePerKg: price,
      });
      // Generate 30 days of price history with realistic fluctuation
      for (let d = 30; d >= 0; d -= Math.floor(Math.random() * 3) + 1) {
        const fluctuation = 1 + (Math.random() - 0.5) * 0.15; // ±7.5%
        await db.insert(schema.priceHistory).values({
          centerId: cp.cid, materialType: mat as any,
          pricePerKg: Math.round(price * fluctuation * 100) / 100,
          recordedAt: daysAgo(d),
        });
      }
    }
  }

  console.log("  ✅ 60+ center prices + 400+ history records created");

  // ═══════════════════════════════════════════════════════════════════
  // LISTINGS — 35+ listings across Mérida and national
  // ═══════════════════════════════════════════════════════════════════

  // Scheduled listings (visible on map, active)
  const [L1] = await db.insert(schema.listings).values({ userId: biz1.id, materialType: "cardboard", estimatedKg: 85, pricingMode: "free", ...MERIDA.centroParque, description: "Cajas de proveedores Bimbo y Coca-Cola, acumuladas del mes", status: "scheduled" }).returning();
  const [L2] = await db.insert(schema.listings).values({ userId: biz1.id, materialType: "cooking_oil", estimatedKg: 18, pricingMode: "for_sale", pricePerKg: 7.00, ...MERIDA.centroParque, description: "Aceite de cocina usado, 3 bidones de 6L, filtrado", status: "scheduled" }).returning();
  const [L3] = await db.insert(schema.listings).values({ userId: biz2.id, materialType: "cardboard", estimatedKg: 120, pricingMode: "free", ...MERIDA.prolongMontejo, description: "Cartón de suministros del hotel: cajas de sábanas, amenidades, alimentos", status: "scheduled" }).returning();
  const [L4] = await db.insert(schema.listings).values({ userId: biz2.id, materialType: "glass", estimatedKg: 45, pricingMode: "for_sale", pricePerKg: 0.70, ...MERIDA.prolongMontejo, description: "Botellas de vino y licor del restaurante del hotel, ~60 botellas", status: "scheduled" }).returning();
  const [L5] = await db.insert(schema.listings).values({ userId: biz2.id, materialType: "cooking_oil", estimatedKg: 30, pricingMode: "for_sale", pricePerKg: 8.00, ...MERIDA.prolongMontejo, description: "Aceite de freidora industrial, 5 bidones", status: "scheduled" }).returning();
  const [L6] = await db.insert(schema.listings).values({ userId: biz3.id, materialType: "pet", estimatedKg: 15, pricingMode: "free", ...MERIDA.montejo, description: "Botellas PET de refrescos y aguas del OXXO, bolsa grande", status: "scheduled" }).returning();
  const [L7] = await db.insert(schema.listings).values({ userId: biz3.id, materialType: "cardboard", estimatedKg: 25, pricingMode: "free", ...MERIDA.montejo, description: "Cajas de mercancía semanal OXXO", status: "scheduled" }).returning();
  const [L8] = await db.insert(schema.listings).values({ userId: biz4.id, materialType: "cooking_oil", estimatedKg: 8, pricingMode: "for_sale", pricePerKg: 6.50, ...MERIDA.itzimna, description: "Aceite de café filtrado, 2 garrafones", status: "scheduled" }).returning();

  const [L9] = await db.insert(schema.listings).values({ userId: hh1.id, materialType: "pet", estimatedKg: 8, pricingMode: "free", ...MERIDA.lasAmericas, description: "Botellas PET y garrafones de agua recolectados este mes", status: "scheduled" }).returning();
  const [L10] = await db.insert(schema.listings).values({ userId: hh1.id, materialType: "aluminum", estimatedKg: 4.5, pricingMode: "free", ...MERIDA.lasAmericas, description: "Latas de cerveza y refresco, ~90 latas", status: "scheduled" }).returning();
  const [L11] = await db.insert(schema.listings).values({ userId: hh2.id, materialType: "glass", estimatedKg: 12, pricingMode: "free", ...MERIDA.garciaGineres, description: "Frascos de mermelada, salsas y botellas de vidrio variadas", status: "scheduled" }).returning();
  const [L12] = await db.insert(schema.listings).values({ userId: hh2.id, materialType: "paper", estimatedKg: 9, pricingMode: "free", ...MERIDA.garciaGineres, description: "Periódicos Diario de Yucatán, revistas y folletos", status: "scheduled" }).returning();
  const [L13] = await db.insert(schema.listings).values({ userId: hh3.id, materialType: "pet", estimatedKg: 6, pricingMode: "free", ...MERIDA.altabrisa, description: "Envases PET de Coca-Cola y Bonafont", status: "scheduled" }).returning();
  const [L14] = await db.insert(schema.listings).values({ userId: hh3.id, materialType: "electronics", estimatedKg: 3.5, pricingMode: "for_sale", pricePerKg: 12.00, ...MERIDA.altabrisa, description: "Celular Samsung viejo, 2 cargadores USB, audífonos rotos", status: "scheduled" }).returning();
  const [L15] = await db.insert(schema.listings).values({ userId: hh4.id, materialType: "metal_scrap", estimatedKg: 22, pricingMode: "for_sale", pricePerKg: 10.00, ...MERIDA.chuburna, description: "Tubería de cobre de remodelación, tornillos y alambre", status: "scheduled" }).returning();
  const [L16] = await db.insert(schema.listings).values({ userId: hh4.id, materialType: "cardboard", estimatedKg: 15, pricingMode: "free", ...MERIDA.chuburna, description: "Cajas de mudanza, cajas de Amazon y MercadoLibre", status: "scheduled" }).returning();
  const [L17] = await db.insert(schema.listings).values({ userId: hh5.id, materialType: "aluminum", estimatedKg: 7, pricingMode: "free", ...MERIDA.francisco, description: "Latas de aluminio de fiesta de cumpleaños, ~140 latas", status: "scheduled" }).returning();
  const [L18] = await db.insert(schema.listings).values({ userId: hh5.id, materialType: "pet", estimatedKg: 12, pricingMode: "free", ...MERIDA.francisco, description: "Garrafones vacíos y botellas PET acumuladas 2 meses", status: "scheduled" }).returning();
  const [L19] = await db.insert(schema.listings).values({ userId: hh6.id, materialType: "wood", estimatedKg: 18, pricingMode: "free", ...MERIDA.miraflores, description: "3 tarimas de madera de entrega de electrodomésticos", status: "scheduled" }).returning();
  const [L20] = await db.insert(schema.listings).values({ userId: hh6.id, materialType: "paper", estimatedKg: 5, pricingMode: "free", ...MERIDA.miraflores, description: "Cuadernos escolares y libros de texto viejos", status: "scheduled" }).returning();

  // More scattered listings
  await db.insert(schema.listings).values({ userId: hh1.id, materialType: "cardboard", estimatedKg: 10, pricingMode: "free", ...MERIDA.lasAmericas, description: "Cajas de paquetería Amazon", status: "scheduled" });
  await db.insert(schema.listings).values({ userId: hh3.id, materialType: "paper", estimatedKg: 8, pricingMode: "free", ...MERIDA.altabrisa, description: "Papel de oficina home office", status: "scheduled" });
  await db.insert(schema.listings).values({ userId: biz1.id, materialType: "pet", estimatedKg: 25, pricingMode: "free", ...MERIDA.centroMercado, description: "Garrafones PET del mercado", status: "scheduled" });
  await db.insert(schema.listings).values({ userId: hh5.id, materialType: "glass", estimatedKg: 6, pricingMode: "free", ...MERIDA.francisco, description: "Botellas de salsa y frascos", status: "scheduled" });
  await db.insert(schema.listings).values({ userId: biz4.id, materialType: "cardboard", estimatedKg: 14, pricingMode: "free", ...MERIDA.itzimna, description: "Empaques de café y leche", status: "scheduled" });

  // Verified/completed listings (past activity)
  for (let i = 0; i < 12; i++) {
    const users = [biz1, biz2, biz3, hh1, hh2, hh3, hh4, hh5];
    const u = users[i % users.length];
    const mats = ["cardboard","pet","aluminum","glass","paper","cooking_oil"] as const;
    const mat = mats[i % mats.length];
    const locs = [MERIDA.centroParque, MERIDA.lasAmericas, MERIDA.garciaGineres, MERIDA.altabrisa, MERIDA.chuburna, MERIDA.montejo];
    await db.insert(schema.listings).values({
      userId: u.id, materialType: mat, estimatedKg: rnd(5, 80),
      pricingMode: Math.random() > 0.6 ? "for_sale" : "free",
      pricePerKg: Math.random() > 0.6 ? rnd(REAL_PRICES[mat][0], REAL_PRICES[mat][1]) : undefined,
      ...locs[i % locs.length], description: "Entrega completada", status: "verified",
      createdAt: daysAgo(rnd(2, 30)),
    });
  }

  console.log("  ✅ 37+ listings created (25 scheduled + 12 verified)");

  // ═══════════════════════════════════════════════════════════════════
  // BATCHES — 8 batches with realistic routes
  // ═══════════════════════════════════════════════════════════════════
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Batch 1: Centro zone — available
  const [b1] = await db.insert(schema.batches).values({
    zone: "Centro Histórico", status: "available", totalEstimatedKg: 173, stopsCount: 5,
    scheduledDate: today, scheduledTime: "09:00",
    optimizedRoute: [
      { lat: MERIDA.centroParque.latitude, lng: MERIDA.centroParque.longitude, listingId: L1.id, order: 1 },
      { lat: MERIDA.centroParque.latitude, lng: MERIDA.centroParque.longitude, listingId: L2.id, order: 2 },
      { lat: MERIDA.centroMercado.latitude, lng: MERIDA.centroMercado.longitude, order: 3 },
      { lat: MERIDA.montejo.latitude, lng: MERIDA.montejo.longitude, listingId: L6.id, order: 4 },
      { lat: MERIDA.montejo.latitude, lng: MERIDA.montejo.longitude, listingId: L7.id, order: 5 },
    ],
  }).returning();
  for (const lid of [L1.id, L2.id, L6.id, L7.id]) {
    await db.update(schema.listings).set({ batchId: b1.id, status: "batched" }).where(eq(schema.listings.id, lid));
  }

  // Batch 2: Norte zone — available
  const [b2] = await db.insert(schema.batches).values({
    zone: "Altabrisa / Montejo", status: "available", totalEstimatedKg: 204.5, stopsCount: 5,
    scheduledDate: today, scheduledTime: "14:00",
    optimizedRoute: [
      { lat: MERIDA.prolongMontejo.latitude, lng: MERIDA.prolongMontejo.longitude, listingId: L3.id, order: 1 },
      { lat: MERIDA.prolongMontejo.latitude, lng: MERIDA.prolongMontejo.longitude, listingId: L4.id, order: 2 },
      { lat: MERIDA.prolongMontejo.latitude, lng: MERIDA.prolongMontejo.longitude, listingId: L5.id, order: 3 },
      { lat: MERIDA.altabrisa.latitude, lng: MERIDA.altabrisa.longitude, listingId: L13.id, order: 4 },
      { lat: MERIDA.altabrisa.latitude, lng: MERIDA.altabrisa.longitude, listingId: L14.id, order: 5 },
    ],
  }).returning();
  for (const lid of [L3.id, L4.id, L5.id, L13.id, L14.id]) {
    await db.update(schema.listings).set({ batchId: b2.id, status: "batched" }).where(eq(schema.listings.id, lid));
  }

  // Batch 3: Sur zone — available (tomorrow)
  const [b3] = await db.insert(schema.batches).values({
    zone: "García Ginerés / Chuburná", status: "available", totalEstimatedKg: 58, stopsCount: 4,
    scheduledDate: tomorrow, scheduledTime: "08:30",
    optimizedRoute: [
      { lat: MERIDA.garciaGineres.latitude, lng: MERIDA.garciaGineres.longitude, listingId: L11.id, order: 1 },
      { lat: MERIDA.garciaGineres.latitude, lng: MERIDA.garciaGineres.longitude, listingId: L12.id, order: 2 },
      { lat: MERIDA.chuburna.latitude, lng: MERIDA.chuburna.longitude, listingId: L15.id, order: 3 },
      { lat: MERIDA.chuburna.latitude, lng: MERIDA.chuburna.longitude, listingId: L16.id, order: 4 },
    ],
  }).returning();
  for (const lid of [L11.id, L12.id, L15.id, L16.id]) {
    await db.update(schema.listings).set({ batchId: b3.id, status: "batched" }).where(eq(schema.listings.id, lid));
  }

  // Batch 4: Francisco / Las Américas — available
  const [b4] = await db.insert(schema.batches).values({
    zone: "Francisco de Montejo / Las Américas", status: "available", totalEstimatedKg: 31.5, stopsCount: 4,
    scheduledDate: tomorrow, scheduledTime: "10:00",
    optimizedRoute: [
      { lat: MERIDA.francisco.latitude, lng: MERIDA.francisco.longitude, listingId: L17.id, order: 1 },
      { lat: MERIDA.francisco.latitude, lng: MERIDA.francisco.longitude, listingId: L18.id, order: 2 },
      { lat: MERIDA.lasAmericas.latitude, lng: MERIDA.lasAmericas.longitude, listingId: L9.id, order: 3 },
      { lat: MERIDA.lasAmericas.latitude, lng: MERIDA.lasAmericas.longitude, listingId: L10.id, order: 4 },
    ],
  }).returning();
  for (const lid of [L17.id, L18.id, L9.id, L10.id]) {
    await db.update(schema.listings).set({ batchId: b4.id, status: "batched" }).where(eq(schema.listings.id, lid));
  }

  // Batch 5: In progress — recycler1
  await db.insert(schema.batches).values({
    zone: "Itzimná / Centro", status: "in_progress", totalEstimatedKg: 62, stopsCount: 3,
    scheduledDate: today, scheduledTime: "07:30", recyclerId: rec1.id,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    optimizedRoute: [
      { lat: MERIDA.itzimna.latitude, lng: MERIDA.itzimna.longitude, order: 1 },
      { lat: MERIDA.centroParque.latitude, lng: MERIDA.centroParque.longitude, order: 2 },
      { lat: MERIDA.santaAna.latitude, lng: MERIDA.santaAna.longitude, order: 3 },
    ],
  });

  // Batch 6: Completed yesterday — recycler1
  await db.insert(schema.batches).values({
    zone: "Pensiones / Caucel", status: "completed", totalEstimatedKg: 95, stopsCount: 6,
    scheduledDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    scheduledTime: "08:00", recyclerId: rec1.id,
    startedAt: daysAgo(1), completedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
  });

  // Batch 7: Assigned to recycler2
  await db.insert(schema.batches).values({
    zone: "Miraflores / Vergel", status: "assigned", totalEstimatedKg: 41, stopsCount: 3,
    scheduledDate: tomorrow, scheduledTime: "11:00", recyclerId: rec2.id,
    optimizedRoute: [
      { lat: MERIDA.miraflores.latitude, lng: MERIDA.miraflores.longitude, listingId: L19.id, order: 1 },
      { lat: MERIDA.miraflores.latitude, lng: MERIDA.miraflores.longitude, listingId: L20.id, order: 2 },
      { lat: MERIDA.vergel.latitude, lng: MERIDA.vergel.longitude, order: 3 },
    ],
  });

  // Batch 8: Completed 3 days ago — recycler2
  await db.insert(schema.batches).values({
    zone: "Altabrisa / Montebello", status: "completed", totalEstimatedKg: 68, stopsCount: 4,
    scheduledDate: daysAgo(3).toISOString().split("T")[0],
    scheduledTime: "09:00", recyclerId: rec2.id,
    startedAt: daysAgo(3), completedAt: daysAgo(3),
  });

  console.log("  ✅ 8 batches created (4 available, 1 in_progress, 2 completed, 1 assigned)");

  // ═══════════════════════════════════════════════════════════════════
  // TRANSACTIONS — 12 realistic transactions spanning 30 days
  // ═══════════════════════════════════════════════════════════════════

  const txData = [
    // rec1 → c1 (2 days ago) — big delivery
    { rid: rec1.id, cid: c1.id, days: 2, kg: 95, amount: 1180, pts: 1420, items: [
      { materialType: "cardboard" as const, kg: 40, pricePerKg: 2.80, subtotal: 112 },
      { materialType: "pet" as const, kg: 25, pricePerKg: 7.50, subtotal: 187.5 },
      { materialType: "aluminum" as const, kg: 12, pricePerKg: 24.00, subtotal: 288 },
      { materialType: "cooking_oil" as const, kg: 18, pricePerKg: 9.00, subtotal: 162 },
    ]},
    // rec1 → c2 (5 days ago)
    { rid: rec1.id, cid: c2.id, days: 5, kg: 68, amount: 850, pts: 980, items: [
      { materialType: "pet" as const, kg: 30, pricePerKg: 8.50, subtotal: 255 },
      { materialType: "aluminum" as const, kg: 15, pricePerKg: 26.00, subtotal: 390 },
      { materialType: "cardboard" as const, kg: 23, pricePerKg: 2.50, subtotal: 57.5 },
    ]},
    // rec1 → c1 (8 days ago)
    { rid: rec1.id, cid: c1.id, days: 8, kg: 52, amount: 620, pts: 740, items: [
      { materialType: "metal_scrap" as const, kg: 18, pricePerKg: 14.50, subtotal: 261 },
      { materialType: "cardboard" as const, kg: 22, pricePerKg: 2.80, subtotal: 61.6 },
      { materialType: "glass" as const, kg: 12, pricePerKg: 0.80, subtotal: 9.6 },
    ]},
    // rec1 → c3 (12 days ago)
    { rid: rec1.id, cid: c3.id, days: 12, kg: 28, amount: 540, pts: 620, items: [
      { materialType: "electronics" as const, kg: 8, pricePerKg: 22.00, subtotal: 176 },
      { materialType: "metal_scrap" as const, kg: 12, pricePerKg: 16.00, subtotal: 192 },
      { materialType: "cooking_oil" as const, kg: 8, pricePerKg: 10.50, subtotal: 84 },
    ]},
    // rec1 → c2 (18 days ago)
    { rid: rec1.id, cid: c2.id, days: 18, kg: 45, amount: 580, pts: 680, items: [
      { materialType: "pet" as const, kg: 20, pricePerKg: 8.50, subtotal: 170 },
      { materialType: "aluminum" as const, kg: 10, pricePerKg: 26.00, subtotal: 260 },
      { materialType: "paper" as const, kg: 15, pricePerKg: 1.50, subtotal: 22.5 },
    ]},
    // rec1 → c1 (25 days ago)
    { rid: rec1.id, cid: c1.id, days: 25, kg: 72, amount: 780, pts: 920, items: [
      { materialType: "cardboard" as const, kg: 35, pricePerKg: 2.80, subtotal: 98 },
      { materialType: "pet" as const, kg: 18, pricePerKg: 7.50, subtotal: 135 },
      { materialType: "cooking_oil" as const, kg: 12, pricePerKg: 9.00, subtotal: 108 },
      { materialType: "aluminum" as const, kg: 7, pricePerKg: 24.00, subtotal: 168 },
    ]},
    // rec2 → c2 (3 days ago)
    { rid: rec2.id, cid: c2.id, days: 3, kg: 42, amount: 520, pts: 580, items: [
      { materialType: "pet" as const, kg: 18, pricePerKg: 8.50, subtotal: 153 },
      { materialType: "aluminum" as const, kg: 8, pricePerKg: 26.00, subtotal: 208 },
      { materialType: "cardboard" as const, kg: 16, pricePerKg: 2.50, subtotal: 40 },
    ]},
    // rec2 → c1 (7 days ago)
    { rid: rec2.id, cid: c1.id, days: 7, kg: 35, amount: 310, pts: 420, items: [
      { materialType: "glass" as const, kg: 15, pricePerKg: 0.80, subtotal: 12 },
      { materialType: "paper" as const, kg: 12, pricePerKg: 2.00, subtotal: 24 },
      { materialType: "cardboard" as const, kg: 8, pricePerKg: 2.80, subtotal: 22.4 },
    ]},
    // rec2 → c3 (14 days ago)
    { rid: rec2.id, cid: c3.id, days: 14, kg: 18, amount: 340, pts: 380, items: [
      { materialType: "electronics" as const, kg: 5, pricePerKg: 22.00, subtotal: 110 },
      { materialType: "metal_scrap" as const, kg: 8, pricePerKg: 16.00, subtotal: 128 },
      { materialType: "wood" as const, kg: 5, pricePerKg: 1.50, subtotal: 7.5 },
    ]},
    // rec2 → c2 (20 days ago)
    { rid: rec2.id, cid: c2.id, days: 20, kg: 55, amount: 480, pts: 620, items: [
      { materialType: "pet" as const, kg: 22, pricePerKg: 8.50, subtotal: 187 },
      { materialType: "cardboard" as const, kg: 18, pricePerKg: 2.50, subtotal: 45 },
      { materialType: "aluminum" as const, kg: 5, pricePerKg: 26.00, subtotal: 130 },
      { materialType: "paper" as const, kg: 10, pricePerKg: 1.50, subtotal: 15 },
    ]},
    // rec3 → c1 (4 days ago) — new recycler
    { rid: rec3.id, cid: c1.id, days: 4, kg: 30, amount: 280, pts: 360, items: [
      { materialType: "cardboard" as const, kg: 15, pricePerKg: 2.80, subtotal: 42 },
      { materialType: "pet" as const, kg: 10, pricePerKg: 7.50, subtotal: 75 },
      { materialType: "aluminum" as const, kg: 5, pricePerKg: 24.00, subtotal: 120 },
    ]},
    // rec3 → c3 (10 days ago)
    { rid: rec3.id, cid: c3.id, days: 10, kg: 22, amount: 250, pts: 320, items: [
      { materialType: "metal_scrap" as const, kg: 10, pricePerKg: 16.00, subtotal: 160 },
      { materialType: "cooking_oil" as const, kg: 6, pricePerKg: 10.50, subtotal: 63 },
      { materialType: "wood" as const, kg: 6, pricePerKg: 1.50, subtotal: 9 },
    ]},
  ];

  for (const tx of txData) {
    const [t] = await db.insert(schema.transactions).values({
      recyclerId: tx.rid, centerId: tx.cid,
      totalKg: tx.kg, totalAmount: tx.amount, ecoPointsAwarded: tx.pts,
      completedAt: daysAgo(tx.days),
    }).returning();
    await db.insert(schema.transactionItems).values(
      tx.items.map(item => ({ transactionId: t.id, ...item }))
    );
  }

  console.log("  ✅ 12 transactions with 40+ line items created");

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICATIONS — 25+ realistic notifications
  // ═══════════════════════════════════════════════════════════════════
  const notifs = [
    // Recycler notifications
    { userId: rec1.id, type: "batch", title: "Nuevo lote disponible", body: "Lote de 173kg con 5 paradas en Centro Histórico — hoy a las 9am.", read: false },
    { userId: rec1.id, type: "batch", title: "Nuevo lote disponible", body: "Lote de 204kg en Altabrisa/Montejo — hoy a las 2pm. Incluye aceite de cocina.", read: false },
    { userId: rec1.id, type: "transaction", title: "Pago recibido", body: "Ganaste $1,180 MXN y 1,420 EcoPoints por tu entrega a EcoRecicla.", read: true },
    { userId: rec1.id, type: "transaction", title: "Pago recibido", body: "Ganaste $850 MXN y 980 EcoPoints en ReciYuc Sur.", read: true },
    { userId: rec1.id, type: "reward", title: "¡Nivel Platinum!", body: "Alcanzaste nivel Platinum con 12,400 EcoPoints. ¡Sigue así!", read: true },
    { userId: rec2.id, type: "batch", title: "Lote asignado", body: "Tienes un lote asignado para mañana a las 11am en Miraflores.", read: false },
    { userId: rec2.id, type: "batch", title: "Nuevo lote disponible", body: "Lote de 58kg en García Ginerés/Chuburná — mañana 8:30am.", read: false },
    { userId: rec2.id, type: "transaction", title: "Pago recibido", body: "Ganaste $520 MXN y 580 EcoPoints por tu entrega.", read: true },
    { userId: rec3.id, type: "batch", title: "Nuevo lote disponible", body: "Lote de 31kg en Francisco de Montejo — mañana 10am.", read: false },
    // Business notifications
    { userId: biz1.id, type: "listing", title: "Material agrupado", body: "Tu cartón de 85kg del centro fue agrupado en un lote de recolección.", read: false },
    { userId: biz1.id, type: "price", title: "Alerta de precio", body: "El aceite de cocina subió a $9/kg en EcoRecicla. ¡Buen momento para vender!", read: false },
    { userId: biz1.id, type: "listing", title: "Recolección completada", body: "Juan Recolector recogió tu aceite de cocina. Gracias por reciclar.", read: true },
    { userId: biz2.id, type: "listing", title: "Material agrupado", body: "3 de tus listings del hotel fueron agrupados para recolección hoy a las 2pm.", read: false },
    { userId: biz2.id, type: "price", title: "Precio del vidrio", body: "El vidrio se compra a $0.80/kg en EcoRecicla y $0.60/kg en ReciYuc.", read: false },
    { userId: biz3.id, type: "listing", title: "Material agrupado", body: "Tus botellas PET y cartón del OXXO fueron agrupados.", read: false },
    // Household notifications
    { userId: hh1.id, type: "listing", title: "Material agrupado", body: "Tus botellas PET y latas fueron agrupadas para recolección mañana.", read: false },
    { userId: hh1.id, type: "reward", title: "¡Nivel Silver!", body: "Alcanzaste 2,520 EcoPoints. ¡Ya eres nivel Silver!", read: true },
    { userId: hh2.id, type: "listing", title: "Recolección programada", body: "Tu vidrio y papel serán recogidos mañana a las 8:30am.", read: false },
    { userId: hh3.id, type: "listing", title: "Electrónicos listados", body: "Tu listing de electrónicos está visible. Un recolector lo recogerá pronto.", read: false },
    { userId: hh4.id, type: "listing", title: "Chatarra listada", body: "Tu listing de 22kg de chatarra metálica a $10/kg está publicado.", read: false },
    { userId: hh5.id, type: "listing", title: "Material agrupado", body: "Tus latas y garrafones PET fueron agrupados para recolección.", read: false },
    { userId: hh5.id, type: "reward", title: "¡Nivel Gold!", body: "Con 3,100 EcoPoints alcanzaste Gold. ¡Impresionante!", read: true },
    { userId: hh6.id, type: "listing", title: "Madera listada", body: "Tus tarimas de madera están publicadas. Esperando recolector.", read: false },
    // Center notifications
    { userId: cOp1.id, type: "transaction", title: "Entrega en camino", body: "Juan Recolector viene con ~95kg de materiales mixtos.", read: false },
    { userId: cOp1.id, type: "price", title: "Tendencia de aluminio", body: "El aluminio sube regionalmente. Precio promedio: $24/kg.", read: false },
    { userId: cOp2.id, type: "price", title: "Competencia de precios", body: "EcoRecicla actualizó PET a $7.50/kg. Tu precio actual: $8.50/kg.", read: false },
    { userId: cOp2.id, type: "transaction", title: "Nueva entrega", body: "Luis Hernández entregó 42kg (PET, aluminio, cartón). Total: $520 MXN.", read: true },
    { userId: cOp3.id, type: "transaction", title: "Nueva entrega", body: "Roberto Dzul entregó 22kg (chatarra, aceite, madera). Total: $250 MXN.", read: true },
  ];

  for (const n of notifs) {
    await db.insert(schema.notifications).values(n);
  }

  console.log("  ✅ 28 notifications created");

  // ═══════════════════════════════════════════════════════════════════
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  🌱 SEED COMPLETE — Ultra-realistic production data loaded!");
  console.log("══════════════════════════════════════════════════════════");
  console.log("\n  Demo accounts (password: demo123):");
  console.log("  ┌────────────┬──────────────────────────┬──────────────────────────────┐");
  console.log("  │ Role       │ Email                    │ Name                         │");
  console.log("  ├────────────┼──────────────────────────┼──────────────────────────────┤");
  console.log("  │ business   │ restaurant@demo.com      │ Taquería El Sol              │");
  console.log("  │ business   │ hotel@demo.com           │ Hotel Mérida Palace          │");
  console.log("  │ business   │ oxxo@demo.com            │ OXXO Montejo 24h             │");
  console.log("  │ business   │ cafeteria@demo.com       │ Café Impala                  │");
  console.log("  │ household  │ maria@demo.com           │ María García Cámara          │");
  console.log("  │ household  │ carlos@demo.com          │ Carlos López Pech            │");
  console.log("  │ household  │ ana@demo.com             │ Ana Rodríguez Chan           │");
  console.log("  │ household  │ pedro@demo.com           │ Pedro Martínez Uc            │");
  console.log("  │ household  │ luisa@demo.com           │ Luisa Fernández Cen          │");
  console.log("  │ household  │ diego@demo.com           │ Diego Canul May              │");
  console.log("  │ recycler   │ recycler@demo.com        │ Juan Recolector Uicab        │");
  console.log("  │ recycler   │ recycler2@demo.com       │ Luis Hernández Pool          │");
  console.log("  │ recycler   │ recycler3@demo.com       │ Roberto Dzul Canché          │");
  console.log("  │ center     │ center@demo.com          │ EcoRecicla Yucatán           │");
  console.log("  │ center     │ center2@demo.com         │ ReciYuc Sur                  │");
  console.log("  │ center     │ center3@demo.com         │ Verde Limpio Oriente         │");
  console.log("  │ center     │ center4@demo.com         │ Recicladora CDMX Roma        │");
  console.log("  │ center     │ center5@demo.com         │ EcoGDL Zapopan               │");
  console.log("  └────────────┴──────────────────────────┴──────────────────────────────┘");
  console.log("\n  Centers: 4 Mérida + CDMX + Guadalajara + Cancún");
  console.log("  Prices: Real MXN/kg based on 2024-2025 Mexican market data");
  console.log("  History: 30 days of price fluctuation per material per center\n");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
