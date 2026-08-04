import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FACIELIS database with complete reference images for BIT-Sathy pilot venue...');

  // Clean existing transactional & asset data to allow repeated seed runs
  console.log('Clearing old data for clean re-seed...');
  await prisma.certificate.deleteMany();
  await prisma.score.deleteMany();
  await prisma.crossAuditResponse.deleteMany();
  await prisma.crossAuditQuestion.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.defect.deleteMany();
  await prisma.inspectionItem.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.component.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.referenceImage.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.building.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Organization & Hierarchy
  const org = await prisma.organization.create({
    data: {
      name: 'Bannari Amman Institute of Technology',
      code: 'BIT-SATHY',
      address: 'Sathyamangalam, Erode, Tamil Nadu, India',
    },
  });

  const campus = await prisma.campus.create({
    data: {
      name: 'Main Campus',
      code: 'BIT-MAIN',
      organizationId: org.id,
    },
  });

  const building = await prisma.building.create({
    data: {
      name: 'Learning Center',
      code: 'LC',
      campusId: campus.id,
    },
  });

  const floor = await prisma.floor.create({
    data: {
      name: '4th Floor',
      level: 4,
      buildingId: building.id,
    },
  });

  const venue = await prisma.venue.create({
    data: {
      name: 'Right Cabin (Cabin 3)',
      code: 'LC-4F-RC',
      type: 'Laboratory / Cabin',
      floorId: floor.id,
    },
  });

  // 2. Departments
  const deptData = [
    { name: 'Housekeeping', code: 'HK', description: 'Cleaning & sanitation' },
    { name: 'Electrical', code: 'ELEC', description: 'Wiring, switches, fans, lights, panel' },
    { name: 'Plumbing', code: 'PLUMB', description: 'Water, drainage, piping' },
    { name: 'Network', code: 'NET', description: 'Routers, Ethernet, Wi-Fi' },
    { name: 'Documentation', code: 'DOC', description: 'Reports, records, signage' },
  ];

  const departments: Record<string, any> = {};
  for (const d of deptData) {
    departments[d.code] = await prisma.department.create({ data: d });
  }

  // 3. Demo Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const users: Array<{ email: string; name: string; role: 'SUPER_ADMIN' | 'MANAGER' | 'AUDITOR' | 'TECHNICIAN'; dept: string }> = [
    { email: 'admin@facielis.com', name: 'Super Admin User', role: 'SUPER_ADMIN', dept: 'DOC' },
    { email: 'manager@facielis.com', name: 'Facility Manager', role: 'MANAGER', dept: 'DOC' },
    { email: 'auditor1@facielis.com', name: 'Auditor Ramesh', role: 'AUDITOR', dept: 'DOC' },
    { email: 'auditor2@facielis.com', name: 'Auditor Priya', role: 'AUDITOR', dept: 'DOC' },
    { email: 'tech.elec@facielis.com', name: 'Tech Selvam (Electrical)', role: 'TECHNICIAN', dept: 'ELEC' },
    { email: 'tech.net@facielis.com', name: 'Tech Karthik (Network)', role: 'TECHNICIAN', dept: 'NET' },
    { email: 'tech.hk@facielis.com', name: 'Tech Murugan (Housekeeping)', role: 'TECHNICIAN', dept: 'HK' },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        departmentId: departments[u.dept].id,
        buildingId: building.id,
      },
    });
  }

  // 4. Asset Categories & Web-Sourced Reference Images
  const categoriesData = [
    {
      name: 'Entry Door',
      code: 'DOOR',
      goodImg: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80',
      description: 'Solid timber/composite entry door with lock mechanism, hinges, and weather seals.',
    },
    {
      name: 'Sliding Glass Window',
      code: 'WIN_SLIDING',
      goodImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80',
      description: 'Full height sliding glass window with aluminum frame, rollers, and curtain fabric.',
    },
    {
      name: 'Half Wall Window',
      code: 'WIN_HALF',
      goodImg: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80',
      description: 'Half wall glass partition window positioned outside main cabin corridor.',
    },
    {
      name: '4-Seater Table',
      code: 'TAB_4S',
      goodImg: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
      description: '4-Seater modular workstation table with dual end electrical switch boxes & wiring.',
    },
    {
      name: '2-Seater Table',
      code: 'TAB_2S',
      goodImg: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
      description: '2-Seater workstation table with single electrical switch box.',
    },
    {
      name: 'Chair',
      code: 'CHAIR',
      goodImg: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=800&q=80',
      description: 'Ergonomic mesh office chair with hydraulic lift, armrests, and 5-star swivel casters.',
    },
    {
      name: 'Computer System',
      code: 'COMP',
      goodImg: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
      description: 'Desktop workstation containing monitor, CPU, optical mouse, keyboard, and Cat6 Ethernet cable.',
    },
    {
      name: 'WiFi Router',
      code: 'ROUTER',
      goodImg: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
      description: 'Enterprise ceiling-mounted WiFi access point router.',
    },
    {
      name: 'Floor Surface',
      code: 'FLOOR',
      goodImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: 'Clean tiled floor surface with borders.',
    },
    {
      name: 'Ceiling Surface',
      code: 'CEILING',
      goodImg: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=80',
      description: 'Modular false ceiling grid with flush panels.',
    },
    {
      name: 'Air Conditioner',
      code: 'AC',
      goodImg: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      description: 'Split AC unit with indoor blower, outdoor compressor, remote, filter, and drain pipe.',
    },
    {
      name: 'Ceiling Fan',
      code: 'FAN',
      goodImg: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      description: '3-Blade ceiling fan with motor hub and wall speed regulator.',
    },
    {
      name: 'Light Fixture',
      code: 'LIGHT',
      goodImg: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=80',
      description: 'LED ceiling light fixture panel.',
    },
    {
      name: 'Main Switch Box',
      code: 'SWITCH_MAIN',
      goodImg: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      description: 'Main electrical distribution panel with MCB circuit breakers.',
    },
    {
      name: 'Printer',
      code: 'PRINTER',
      goodImg: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
      acceptableImg: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
      defectiveImg: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
      description: 'Network laser printer with paper tray, toner cartridge, and cables.',
    },
  ];

  const categories: Record<string, any> = {};
  for (const c of categoriesData) {
    const category = await prisma.assetCategory.create({
      data: {
        name: c.name,
        code: c.code,
        description: c.description,
      },
    });
    categories[c.code] = category;

    // Attach reference image entry to database
    await prisma.referenceImage.create({
      data: {
        assetCategoryId: category.id,
        goodImageUrl: c.goodImg,
        acceptableImageUrl: c.acceptableImg,
        defectiveImageUrl: c.defectiveImg,
        description: `Verified standard for ${c.name}`,
      },
    });
  }

  // 5. Asset & Component Generation for Learning Center 4th Floor Right Cabin
  console.log('Generating 143 Assets and ~666 Components...');

  const createAssetWithComponents = async (
    codePrefix: string,
    categoryCode: string,
    namePrefix: string,
    count: number,
    componentNames: string[]
  ) => {
    const cat = categories[categoryCode];
    for (let i = 1; i <= count; i++) {
      const serialNo = `LC4FRC-${codePrefix}-${String(i).padStart(3, '0')}`;
      const name = `${namePrefix} ${String(i).padStart(2, '0')}`;

      const asset = await prisma.asset.create({
        data: {
          serialNo,
          name,
          assetCategoryId: cat.id,
          venueId: venue.id,
          installationDate: new Date('2024-01-15'),
        },
      });

      for (let j = 0; j < componentNames.length; j++) {
        await prisma.component.create({
          data: {
            name: componentNames[j],
            code: `${asset.serialNo}-CMP-${j + 1}`,
            assetId: asset.id,
          },
        });
      }
    }
  };

  // 1) 2 Entry doors (5 components each)
  await createAssetWithComponents('DOOR', 'DOOR', 'Entry Door', 2, [
    'Door Panel Surface',
    'Door Handle',
    'Lock Mechanism',
    'Hinges',
    'Door Frame & Seal',
  ]);

  // 2) 6 Entire sliding Glass windows with curtains (6 components each)
  await createAssetWithComponents('WSL', 'WIN_SLIDING', 'Sliding Glass Window', 6, [
    'Glass Pane Structure',
    'Aluminum Window Frame',
    'Slide Rail & Rollers',
    'Window Latch/Lock',
    'Curtain Fabric',
    'Curtain Rod & Brackets',
  ]);

  // 3) 2 Half wall windows before cabin (5 components each)
  await createAssetWithComponents('WHF', 'WIN_HALF', 'Half Wall Window', 2, [
    'Glass Pane',
    'Window Frame',
    'Window Lock',
    'Curtain Fabric',
    'Curtain Rod',
  ]);

  // 4) 10 4-seater tables with electric switch box in two ends with wiring (8 components each)
  await createAssetWithComponents('T4S', 'TAB_4S', '4-Seater Table', 10, [
    'Table Surface Top',
    'Table Support Legs & Structure',
    'Left End Electrical Switch Box',
    'Right End Electrical Switch Box',
    'Left Electrical Socket Ports',
    'Right Electrical Socket Ports',
    'Internal Switch Box Wiring (Left)',
    'Internal Switch Box Wiring (Right)',
  ]);

  // 5) 10 2-seater tables with single electric switch box with wiring (6 components each)
  await createAssetWithComponents('T2S', 'TAB_2S', '2-Seater Table', 10, [
    'Table Surface Top',
    'Table Support Legs',
    'Single Switch Box',
    'Electrical Socket Ports',
    'Internal Wiring',
    'Cable Grommet Pass-through',
  ]);

  // 6) 60 Chairs (4 components each)
  await createAssetWithComponents('CHR', 'CHAIR', 'Ergonomic Chair', 60, [
    'Seat Cushion & Fabric',
    'Backrest & Lumbar Support',
    'Hydraulic Lift & Base Wheels',
    'Armrests (Left & Right)',
  ]);

  // 7) 20 Computer systems (5 components each)
  await createAssetWithComponents('PC', 'COMP', 'Workstation Desktop System', 20, [
    'Display Monitor Screen',
    'CPU Tower Unit',
    'Optical Mouse',
    'Mechanical Keyboard',
    'Cat6 Ethernet Cable',
  ]);

  // 8) 1 WiFi Router / Receiver (4 components)
  await createAssetWithComponents('RTR', 'ROUTER', 'Enterprise WiFi Access Point', 1, [
    'Router Base Unit',
    'Power Adapter & Cord',
    'Wireless Antennas',
    'Uplink Ethernet Port',
  ]);

  // 9) 1 Floor (2 components)
  await createAssetWithComponents('FLR', 'FLOOR', 'Main Cabin Floor', 1, [
    'Tiled Floor Surface',
    'Skirting & Floor Borders',
  ]);

  // 10) 1 Ceiling (2 components)
  await createAssetWithComponents('CLG', 'CEILING', 'False Ceiling Structure', 1, [
    'False Ceiling Panels',
    'Grid Suspension Framing',
  ]);

  // 11) 1 AC (5 components)
  await createAssetWithComponents('AC', 'AC', 'Split AC Unit', 1, [
    'Indoor Blower Unit',
    'Outdoor Compressor Unit',
    'Remote Controller',
    'Air Filter Screen',
    'Condensate Water Drain Pipe',
  ]);

  // 12) 6 Ceiling Fans (4 components each)
  await createAssetWithComponents('FAN', 'FAN', 'Ceiling Fan', 6, [
    'Fan Motor Hub',
    'Fan Blades (Set of 3)',
    'Wall Speed Regulator',
    'Ceiling Mounting Hook & Downrod',
  ]);

  // 13) 20 Different Lights (approx) (4 components each)
  await createAssetWithComponents('LGT', 'LIGHT', 'LED Ceiling Light Fixture', 20, [
    'LED Panel / Tube',
    'Fixture Housing Frame',
    'Internal Driver Wiring',
    'Control Switch Connection',
  ]);

  // 14) 2 Main switch boxes for operating lights & fans (4 components each)
  await createAssetWithComponents('MSB', 'SWITCH_MAIN', 'Main Electrical Panel Switch Box', 2, [
    'Panel Enclosure & Cover',
    'MCB Circuit Breakers',
    'Master Busbar & Wiring',
    'Ground Earth Connection',
  ]);

  // 15) 1 Printer (5 components)
  await createAssetWithComponents('PRN', 'PRINTER', 'Network Laser Printer', 1, [
    'Printer Body Chassis',
    'Paper Tray Mechanism',
    'Toner Cartridge Bay',
    'Power Cable',
    'USB / Network Data Port',
  ]);

  console.log('Successfully seeded 143 Assets with Reference Images!');

  // 6. Default Rules for Rule Engine
  console.log('Seeding Deterministic Rules...');
  const rulesData: Array<{
    componentType: string;
    keywordMatch: string;
    category: string;
    priority: 'P1' | 'P2' | 'P3' | 'P4';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    departmentName: string;
    slaHours: number;
  }> = [
    {
      componentType: 'Internal Wiring',
      keywordMatch: 'burn,discoloration,smoke,spark',
      category: 'Electrical',
      priority: 'P1',
      severity: 'CRITICAL',
      departmentName: 'Electrical',
      slaHours: 1,
    },
    {
      componentType: 'MCB Circuit Breakers',
      keywordMatch: 'trip,spark,fault,broken',
      category: 'Electrical',
      priority: 'P1',
      severity: 'CRITICAL',
      departmentName: 'Electrical',
      slaHours: 2,
    },
    {
      componentType: 'Electrical Socket Ports',
      keywordMatch: 'loose,loose socket,no power,crack',
      category: 'Electrical',
      priority: 'P2',
      severity: 'HIGH',
      departmentName: 'Electrical',
      slaHours: 4,
    },
    {
      componentType: 'Display Monitor Screen',
      keywordMatch: 'flicker,no display,lines,crack',
      category: 'Network',
      priority: 'P3',
      severity: 'MEDIUM',
      departmentName: 'Network',
      slaHours: 8,
    },
    {
      componentType: 'Cat6 Ethernet Cable',
      keywordMatch: 'damaged,disconnected,no connection',
      category: 'Network',
      priority: 'P2',
      severity: 'HIGH',
      departmentName: 'Network',
      slaHours: 4,
    },
    {
      componentType: 'Condensate Water Drain Pipe',
      keywordMatch: 'leak,water dripping,blockage',
      category: 'Plumbing',
      priority: 'P2',
      severity: 'HIGH',
      departmentName: 'Plumbing',
      slaHours: 4,
    },
    {
      componentType: 'Tiled Floor Surface',
      keywordMatch: 'dirty,dust,stain,broken tile',
      category: 'Housekeeping',
      priority: 'P3',
      severity: 'LOW',
      departmentName: 'Housekeeping',
      slaHours: 12,
    },
  ];

  for (const r of rulesData) {
    await prisma.rule.create({ data: r });
  }

  // 7. Cross-Audit Integrity Questions
  console.log('Seeding Cross-Audit Questions for Right Cabin...');
  const crossAuditQuestions = [
    {
      venueId: venue.id,
      question: 'How many 4-seater electrical tables are located in the Right Cabin?',
      assetType: 'Table',
      expectedCount: 10,
      optionA: '8 Tables',
      optionB: '10 Tables',
      optionC: '12 Tables',
      optionD: '6 Tables',
      correctAnswer: 'B',
    },
    {
      venueId: venue.id,
      question: 'How many total ceiling fans are installed in this cabin?',
      assetType: 'Ceiling Fan',
      expectedCount: 6,
      optionA: '4 Fans',
      optionB: '5 Fans',
      optionC: '6 Fans',
      optionD: '8 Fans',
      correctAnswer: 'C',
    },
    {
      venueId: venue.id,
      question: 'Where is the network laser printer situated in the Right Cabin?',
      assetType: 'Printer',
      expectedCount: 1,
      optionA: 'Near Main Entry Door',
      optionB: 'Center Wall Counter',
      optionC: 'Corner near Window 4',
      optionD: 'Outside Cabin Corridor',
      correctAnswer: 'A',
    },
  ];

  for (const q of crossAuditQuestions) {
    await prisma.crossAuditQuestion.create({ data: q });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
