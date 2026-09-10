/**
 * Direct MongoDB Atlas Intelligence & User Seeder
 * Connects to MongoDB Atlas and populates real users, cases, entities, and alerts.
 */
const mongoose = require('../server/node_modules/mongoose');
const bcrypt = require('../server/node_modules/bcryptjs');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/circuit_db';

async function seed() {
  console.log('🔄 Connecting to MongoDB database...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to MongoDB Database!');

  const db = mongoose.connection.db;

  // 1. Seed Real Users with Bcrypt Hashed Passwords
  console.log('\n👤 Seeding enterprise users...');
  const usersCollection = db.collection('users');
  const salt = await bcrypt.genSalt(10);
  const seedPassword = process.env.SEED_DEFAULT_PASSWORD || 'demo123';
  const passwordHash = await bcrypt.hash(seedPassword, salt);

  const users = [
    {
      email: 'investigator@circuit.gov',
      passwordHash,
      name: 'Lead Investigator Vikram Rao',
      role: 'investigator',
      department: 'Special Crime Intelligence Wing',
      badgeNumber: 'SCIW-4401',
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      email: 'analyst@circuit.gov',
      passwordHash,
      name: 'Senior Analyst Maya Sen',
      role: 'analyst',
      department: 'Financial Forensics Unit',
      badgeNumber: 'FFU-1022',
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      email: 'admin@circuit.gov',
      passwordHash,
      name: 'System Administrator',
      role: 'admin',
      department: 'Operations Command',
      badgeNumber: 'ADMIN-0001',
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  ];

  for (const u of users) {
    await usersCollection.updateOne(
      { email: u.email },
      { $set: u },
      { upsert: true }
    );
    console.log(`  ✓ User synced: ${u.email} [${u.role}]`);
  }

  // 2. Seed Cases
  console.log('\n📁 Seeding enterprise investigation cases...');
  const casesCollection = db.collection('cases');
  const cases = [
    {
      caseNumber: 'CR-2026-00124',
      title: 'Operation Nightfall',
      description: 'Multi-jurisdiction syndicate investigation involving rapid transfer chains, shell logistics entities, and burner communications.',
      status: 'active',
      priority: 'critical',
      leadInvestigators: ['Vikram Rao', 'Maya Sen'],
      tags: ['flagship', 'hawala', 'shell_company', 'illicit_transit'],
      entityIds: ['P-0001', 'P-0002', 'P-0003', 'O-0001', 'PH-0001', 'V-0001'],
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      caseNumber: 'CR-2026-00842',
      title: 'Operation Goldcrest: Dubai-Delhi Hawala Corridor',
      description: 'Cross-border gold bullion factoring, tokenized cash handshakes across Deira Gold Souk and Karol Bagh vaults.',
      status: 'active',
      priority: 'critical',
      leadInvestigators: ['Maya Sen', 'Rohan Mathur'],
      tags: ['hawala', 'bullion', 'dubai_corridor', 'money_laundering'],
      entityIds: ['P-0004', 'P-0005', 'O-0002', 'O-0003', 'PH-0002', 'V-0002'],
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      caseNumber: 'CR-2026-00315',
      title: 'Operation Red Sand: Inter-State Smuggling Syndicate',
      description: 'Illicit interstate timber and precious mineral transport network moving through South India transit corridors to Ennore port.',
      status: 'active',
      priority: 'high',
      leadInvestigators: ['Vikram Rao', 'Kavita Nair'],
      tags: ['smuggling', 'port_export', 'anpr_tracking', 'interstate'],
      entityIds: ['P-0006', 'P-0007', 'O-0004', 'PH-0003', 'V-0003'],
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      caseNumber: 'CR-2026-00489',
      title: 'Project Phantom: Cyber-Fin Mule Network',
      description: 'Rogue payment gateways, layered UPI routing, and crypto OTC cash conversions across NCR and Western hubs.',
      status: 'active',
      priority: 'high',
      leadInvestigators: ['Aman Gupta', 'Maya Sen'],
      tags: ['cyber_fraud', 'mule_accounts', 'crypto_otc', 'upi_layering'],
      entityIds: ['P-0008', 'P-0009', 'O-0005', 'PH-0004', 'V-0004'],
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      caseNumber: 'CR-2026-00712',
      title: 'Operation Eastern Corridor: Rail Cargo Smuggling',
      description: 'Inland railway freight parcel contraband routing from Bihar to Eastern border checkpoints and foreign transit nodes.',
      status: 'active',
      priority: 'medium',
      leadInvestigators: ['Sanjay Jha'],
      tags: ['rail_transit', 'border_post', 'cargo_fraud'],
      entityIds: ['P-0010', 'P-0011', 'O-0006', 'V-0005'],
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  ];

  for (const c of cases) {
    await casesCollection.updateOne(
      { caseNumber: c.caseNumber },
      { $set: c },
      { upsert: true }
    );
    console.log(`  ✓ Case synced: ${c.caseNumber} - ${c.title}`);
  }

  // 3. Seed Entities
  console.log('\n👥 Seeding intelligence entities...');
  const entitiesCollection = db.collection('entities');
  const entities = [
    {
      entityId: 'P-0001',
      type: 'person',
      label: 'Vikram Rathore',
      aliases: ['Vicky', 'VR'],
      riskFlag: true,
      influenceScore: 92.5,
      cases: ['CR-2026-00124'],
      properties: { designation: 'Primary Syndicate Coordinator', nationality: 'Indian' },
    },
    {
      entityId: 'P-0002',
      type: 'person',
      label: 'Sunil Verma',
      aliases: ['SV', 'Pandit'],
      riskFlag: true,
      influenceScore: 84.2,
      cases: ['CR-2026-00124'],
      properties: { designation: 'Mule & Cash Transit Courier' },
    },
    {
      entityId: 'P-0003',
      type: 'person',
      label: 'Karan Malhotra',
      aliases: ['KM', 'Broker'],
      riskFlag: true,
      influenceScore: 76.0,
      cases: ['CR-2026-00124'],
      properties: { designation: 'Financial Broker & Pass-through Controller' },
    },
    {
      entityId: 'O-0001',
      type: 'organization',
      label: 'NorthStar Logistics Pvt Ltd',
      aliases: ['NorthStar'],
      riskFlag: true,
      influenceScore: 78.9,
      cases: ['CR-2026-00124'],
      properties: { jurisdiction: 'Mumbai', regNo: 'U72900MH2021PTC332211' },
    },
    {
      entityId: 'PH-0001',
      type: 'phone',
      label: '+919876543210',
      aliases: [],
      riskFlag: true,
      influenceScore: 65.0,
      cases: ['CR-2026-00124'],
      properties: { carrier: 'Airtel', circle: 'Delhi-NCR' },
    },
    {
      entityId: 'V-0001',
      type: 'vehicle',
      label: 'MH02CD9988',
      aliases: [],
      riskFlag: true,
      influenceScore: 55.0,
      cases: ['CR-2026-00124'],
      properties: { make: 'Toyota', model: 'Fortuner', color: 'Black' },
    },
    {
      entityId: 'P-0004',
      type: 'person',
      label: 'Rashid Al-Mansoor',
      aliases: ['Sheikh Rashid', 'The Goldsmith'],
      riskFlag: true,
      influenceScore: 94.0,
      cases: ['CR-2026-00842'],
      properties: { designation: 'Gulf Bullion Broker & Token Issuer', nationality: 'Emirati' },
    },
    {
      entityId: 'P-0005',
      type: 'person',
      label: 'Rajesh Singhania',
      aliases: ['Sethji', 'RS Vault'],
      riskFlag: true,
      influenceScore: 88.5,
      cases: ['CR-2026-00842'],
      properties: { designation: 'Karol Bagh Vault Operator' },
    },
  ];

  for (const e of entities) {
    await entitiesCollection.updateOne(
      { entityId: e.entityId },
      { $set: e },
      { upsert: true }
    );
    console.log(`  ✓ Entity synced: ${e.entityId} - ${e.label}`);
  }

  console.log('\n🎉 MongoDB Atlas Cluster successfully seeded with real authentication users and enterprise datasets!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
