import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Roles
  const roles = ['CLIENTE', 'VENDEDOR', 'ADMIN'];
  for (const name of roles) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  const clienteRole = await prisma.role.findUnique({ where: { name: 'CLIENTE' } });
  const vendedorRole = await prisma.role.findUnique({ where: { name: 'VENDEDOR' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

  // States & Municipalities
  const statesData: Record<string, string[]> = {
    'Distrito Capital': ['Libertador'],
    'Miranda': ['Sucre', 'Baruta', 'Chacao', 'El Hatillo', 'Plaza'],
    'Carabobo': ['Valencia', 'Naguanagua', 'San Diego', 'Libertador'],
    'Zulia': ['Maracaibo', 'San Francisco', 'Cabimas', 'Lagunillas'],
    'Aragua': ['Girardot', 'Santiago Mari\u00f1o', 'Libertador', 'Zamora'],
    'Lara': ['Iribarren', 'Palavecino', 'Cabudare'],
    'T\u00e1chira': ['San Crist\u00f3bal', 'C\u00e1rdenas', 'Jun\u00edn'],
    'Anzo\u00e1tegui': ['Sotillo', 'Urbaneja', 'Bol\u00edvar', 'Sim\u00f3n Rodr\u00edguez'],
    'Bol\u00edvar': ['Caron\u00ed', 'Heres', 'Piar'],
    'M\u00e9rida': ['Libertador', 'Campo El\u00edas', 'Sucre'],
  };

  const stateMap: Record<string, string> = {};
  const municipalityMap: Record<string, string> = {};

  for (const [stateName, municipalities] of Object.entries(statesData)) {
    const state = await prisma.state.upsert({
      where: { name: stateName },
      update: {},
      create: { name: stateName },
    });
    stateMap[stateName] = state.id;
    for (const munName of municipalities) {
      const mun = await prisma.municipality.upsert({
        where: { stateId_name: { stateId: state.id, name: munName } },
        update: {},
        create: { stateId: state.id, name: munName },
      });
      municipalityMap[`${stateName}-${munName}`] = mun.id;
    }
  }

  // Vehicle Brands & Models
  const vehicleData: Record<string, string[]> = {
    'Toyota': ['Corolla', 'Camry', 'RAV4', 'Hilux', 'Yaris'],
    'Ford': ['F-150', 'Explorer', 'Mustang', 'Fiesta', 'Focus'],
    'Chevrolet': ['Silverado', 'Cruze', 'Spark', 'Aveo', 'Captiva'],
    'Nissan': ['Sentra', 'Versa', 'Frontier', 'Pathfinder', 'March'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Fit', 'HR-V'],
    'Hyundai': ['Tucson', 'Elantra', 'Accent', 'Santa Fe', 'Creta'],
    'Kia': ['Sportage', 'Rio', 'Cerato', 'Sorento', 'Picanto'],
    'Mazda': ['3', '6', 'CX-5', 'CX-3', '2'],
    'Volkswagen': ['Gol', 'Jetta', 'Tiguan', 'Polo', 'Amarok'],
    'Renault': ['Logan', 'Sandero', 'Duster', 'Captur', 'Kwid'],
  };

  const vehicleModelMap: Record<string, string> = {};

  for (const [brandName, models] of Object.entries(vehicleData)) {
    const brand = await prisma.vehicleBrand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });
    for (const modelName of models) {
      const model = await prisma.vehicleModel.upsert({
        where: { brandId_name: { brandId: brand.id, name: modelName } },
        update: {},
        create: { brandId: brand.id, name: modelName },
      });
      vehicleModelMap[`${brandName}-${modelName}`] = model.id;
    }
  }

  // Part Categories & Subcategories
  const partData: Record<string, string[]> = {
    'Motor': ['Pistones', 'Bielas', 'Cig\u00fce\u00f1al', 'V\u00e1lvulas', 'Buj\u00edas', 'Empaques'],
    'Transmisi\u00f3n': ['Caja de cambios', 'Embrague', 'Card\u00e1n', 'Diferencial'],
    'Suspensi\u00f3n': ['Amortiguadores', 'Resortes', 'R\u00f3tulas', 'Bujes', 'Barras'],
    'Frenos': ['Pastillas', 'Discos', 'Tambores', 'L\u00edquido de frenos', 'Calibradores'],
    'El\u00e9ctrico': ['Alternador', 'Motor de arranque', 'Bater\u00eda', 'Bobinas', 'Sensores'],
    'Carrocer\u00eda': ['Parachoques', 'Guardafangos', 'Cap\u00f3', 'Puertas', 'Espejos'],
    'Iluminaci\u00f3n': ['Faros', 'Stops', 'Bombillos', 'Exploradoras'],
    'Interior': ['Tapicer\u00eda', 'Tablero', 'Alfombras', 'Manillas'],
    'Neum\u00e1ticos': ['Cauchos', 'Rines', 'V\u00e1lvulas de aire'],
    'Filtros': ['Filtro de aceite', 'Filtro de aire', 'Filtro de combustible', 'Filtro de cabina'],
  };

  const subcategoryMap: Record<string, string> = {};

  for (const [catName, subcats] of Object.entries(partData)) {
    const category = await prisma.partCategory.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
    for (const subName of subcats) {
      const sub = await prisma.partSubcategory.upsert({
        where: { categoryId_name: { categoryId: category.id, name: subName } },
        update: {},
        create: { categoryId: category.id, name: subName },
      });
      subcategoryMap[`${catName}-${subName}`] = sub.id;
    }
  }

  // Plans
  await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Plan B\u00e1sico',
      description: 'Plan gratuito con funcionalidades b\u00e1sicas',
      price: 0,
      billingCycle: 'monthly',
      isActive: true,
    },
  });
  await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Plan Premium',
      description: 'Plan premium con todas las funcionalidades',
      price: 9.99,
      billingCycle: 'monthly',
      isActive: true,
    },
  });

  // Test User: john@doe.com
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      phone: '+58412000000',
      documentId: 'V-12345678',
    },
  });

  // Assign all roles to test user
  for (const role of [clienteRole!, vendedorRole!, adminRole!]) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: testUser.id, roleId: role.id } },
      update: {},
      create: { userId: testUser.id, roleId: role.id },
    });
  }

  // Create vendor profile for test user
  const dcStateId = stateMap['Distrito Capital'];
  const libertadorMunId = municipalityMap['Distrito Capital-Libertador'];

  const vendor = await prisma.vendor.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      businessName: 'NEXXOS Test',
      rif: 'J-12345678-9',
      stateId: dcStateId,
      municipalityId: libertadorMunId,
      searchRadiusKm: 15,
      isAvailable: true,
    },
  });

  // Assign some vehicle models to vendor
  const vendorModels = [
    vehicleModelMap['Toyota-Corolla'],
    vehicleModelMap['Ford-F-150'],
    vehicleModelMap['Chevrolet-Cruze'],
    vehicleModelMap['Honda-Civic'],
  ].filter(Boolean);

  for (const modelId of vendorModels) {
    await prisma.vendorVehicleModel.upsert({
      where: { vendorId_vehicleModelId: { vendorId: vendor.id, vehicleModelId: modelId } },
      update: {},
      create: { vendorId: vendor.id, vehicleModelId: modelId },
    });
  }

  // Assign some part subcategories to vendor
  const vendorSubcats = [
    subcategoryMap['Motor-Buj\u00edas'],
    subcategoryMap['Frenos-Pastillas'],
    subcategoryMap['Frenos-Discos'],
    subcategoryMap['Filtros-Filtro de aceite'],
    subcategoryMap['Filtros-Filtro de aire'],
  ].filter(Boolean);

  for (const subId of vendorSubcats) {
    await prisma.vendorPartSubcategory.upsert({
      where: { vendorId_partSubcategoryId: { vendorId: vendor.id, partSubcategoryId: subId } },
      update: {},
      create: { vendorId: vendor.id, partSubcategoryId: subId },
    });
  }

  // Create vendor metrics
  await prisma.vendorMetrics.upsert({
    where: { vendorId: vendor.id },
    update: {},
    create: { vendorId: vendor.id },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
