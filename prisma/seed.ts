import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Categories
  const keyboards = await prisma.category.upsert({
    where: { slug: 'keyboards' },
    update: {},
    create: { name: 'Keyboards', slug: 'keyboards', icon: '⌨' },
  });

  const switches = await prisma.category.upsert({
    where: { slug: 'switches' },
    update: {},
    create: { name: 'Switches', slug: 'switches', icon: '🔴' },
  });

  const keycaps = await prisma.category.upsert({
    where: { slug: 'keycaps' },
    update: {},
    create: { name: 'Keycaps', slug: 'keycaps', icon: '🔲' },
  });

  const deskpads = await prisma.category.upsert({
    where: { slug: 'deskpads' },
    update: {},
    create: { name: 'Desk Pads', slug: 'deskpads', icon: '🟩' },
  });

  // Brands
  const rainy = await prisma.brand.upsert({
    where: { slug: 'rainy' },
    update: {},
    create: { name: 'Rainy', slug: 'rainy' },
  });

  const bridge = await prisma.brand.upsert({
    where: { slug: 'bridge' },
    update: {},
    create: { name: 'Bridge', slug: 'bridge' },
  });

  const neo = await prisma.brand.upsert({
    where: { slug: 'neo-macro' },
    update: {},
    create: { name: 'Neo Macro', slug: 'neo-macro' },
  });

  const wooting = await prisma.brand.upsert({
    where: { slug: 'wooting' },
    update: {},
    create: { name: 'Wooting', slug: 'wooting' },
  });

  const aula = await prisma.brand.upsert({
    where: { slug: 'aula' },
    update: {},
    create: { name: 'Aula', slug: 'aula' },
  });

  // Vendors
  const stacksKB = await prisma.vendor.upsert({
    where: { slug: 'stackskb' },
    update: {},
    create: {
      name: 'StacksKB',
      slug: 'stackskb',
      website: 'https://stackskb.com',
      enabled: true,
    },
  });

  const genesisPC = await prisma.vendor.upsert({
    where: { slug: 'genesispc' },
    update: {},
    create: {
      name: 'GenesisPC',
      slug: 'genesispc',
      website: 'https://genesispc.in',
      enabled: true,
    },
  });

  const neoMacro = await prisma.vendor.upsert({
    where: { slug: 'neomacro' },
    update: {},
    create: {
      name: 'Neo Macro',
      slug: 'neomacro',
      website: 'https://neomacro.com',
      enabled: true,
    },
  });

  const hardwareCorpus = await prisma.vendor.upsert({
    where: { slug: 'hardwarecorpus' },
    update: {},
    create: {
      name: 'Hardware Corpus',
      slug: 'hardwarecorpus',
      website: 'https://hardwarecorpus.com',
      enabled: true,
    },
  });

  // ═══════════════════════════════════════════
  // SPEC FIELDS FOR KEYBOARDS (grouped)
  // ═══════════════════════════════════════════

  const specFields = [
    // Layout & Build
    { name: 'Layout', slug: 'layout', group: 'Layout & Build', type: 'select', order: 0 },
    { name: 'Case Material', slug: 'case_material', group: 'Layout & Build', type: 'select', order: 1 },
    { name: 'Surface Finish', slug: 'surface_finish', group: 'Layout & Build', type: 'text', order: 2 },
    { name: 'Weight', slug: 'weight', group: 'Layout & Build', type: 'text', order: 3 },
    { name: 'Dimensions', slug: 'dimensions', group: 'Layout & Build', type: 'text', order: 4 },
    { name: 'Typing Angle', slug: 'typing_angle', group: 'Layout & Build', type: 'text', order: 5 },
    { name: 'Front Height', slug: 'front_height', group: 'Layout & Build', type: 'text', order: 6 },

    // Mounting
    { name: 'Mount Type', slug: 'mount_type', group: 'Mounting', type: 'select', order: 0 },
    { name: 'Plate Material', slug: 'plate_material', group: 'Mounting', type: 'select', order: 1 },
    { name: 'Stabilizers', slug: 'stabilizers', group: 'Mounting', type: 'text', order: 2 },
    { name: 'Foam', slug: 'foam', group: 'Mounting', type: 'text', order: 3 },
    { name: 'Flex Cuts', slug: 'flex_cuts', group: 'Mounting', type: 'boolean', order: 4 },

    // PCB
    { name: 'PCB Type', slug: 'pcb_type', group: 'PCB', type: 'select', order: 0 },
    { name: 'PCB Thickness', slug: 'pcb_thickness', group: 'PCB', type: 'text', order: 1 },
    { name: 'South Facing LEDs', slug: 'south_facing_leds', group: 'PCB', type: 'boolean', order: 2 },
    { name: 'NKRO', slug: 'nkro', group: 'PCB', type: 'boolean', order: 3 },
    { name: 'Polling Rate', slug: 'polling_rate', group: 'PCB', type: 'text', order: 4 },

    // Connectivity
    { name: 'Connection', slug: 'connection', group: 'Connectivity', type: 'select', order: 0 },
    { name: 'USB', slug: 'usb', group: 'Connectivity', type: 'text', order: 1 },
    { name: 'Bluetooth', slug: 'bluetooth', group: 'Connectivity', type: 'boolean', order: 2 },
    { name: '2.4 GHz', slug: 'wireless_2_4ghz', group: 'Connectivity', type: 'boolean', order: 3 },

    // Lighting
    { name: 'RGB', slug: 'rgb', group: 'Lighting', type: 'select', order: 0 },
    { name: 'Per-Key RGB', slug: 'per_key_rgb', group: 'Lighting', type: 'boolean', order: 1 },

    // Firmware
    { name: 'Software', slug: 'software', group: 'Firmware', type: 'text', order: 0 },
    { name: 'QMK', slug: 'qmk', group: 'Firmware', type: 'boolean', order: 1 },
    { name: 'VIAL', slug: 'vial', group: 'Firmware', type: 'boolean', order: 2 },

    // Switches
    { name: 'Hot Swap', slug: 'hot_swap', group: 'Switches', type: 'boolean', order: 0 },
    { name: 'Included Switch', slug: 'included_switch', group: 'Switches', type: 'text', order: 1 },
    { name: 'Switch Type', slug: 'switch_type', group: 'Switches', type: 'text', order: 2 },

    // Keycaps
    { name: 'Keycap Material', slug: 'keycap_material', group: 'Keycaps', type: 'text', order: 0 },
    { name: 'Keycap Profile', slug: 'keycap_profile', group: 'Keycaps', type: 'text', order: 1 },
    { name: 'Legends', slug: 'legends', group: 'Keycaps', type: 'text', order: 2 },
  ];

  const createdFields: Record<string, { id: string }> = {};

  for (const field of specFields) {
    const upserted = await prisma.specField.upsert({
      where: { slug: field.slug },
      update: { group: field.group, order: field.order, type: field.type },
      create: {
        name: field.name,
        slug: field.slug,
        categoryId: keyboards.id,
        group: field.group,
        type: field.type,
        order: field.order,
      },
    });
    createdFields[field.slug] = upserted;
  }

  // Products
  const rainy75 = await prisma.product.upsert({
    where: { slug: 'rainy75' },
    update: {},
    create: {
      name: 'Rainy75',
      slug: 'rainy75',
      brandId: rainy.id,
      categoryId: keyboards.id,
      description: 'Premium 75% wireless mechanical keyboard with gasket mount and aluminum case.',
    },
  });

  await prisma.specification.createMany({
    data: [
      { productId: rainy75.id, specFieldId: createdFields.layout.id, value: '75%' },
      { productId: rainy75.id, specFieldId: createdFields.case_material.id, value: 'Aluminum' },
      { productId: rainy75.id, specFieldId: createdFields.surface_finish.id, value: 'Anodized' },
      { productId: rainy75.id, specFieldId: createdFields.weight.id, value: '1800 g' },
      { productId: rainy75.id, specFieldId: createdFields.typing_angle.id, value: '6°' },
      { productId: rainy75.id, specFieldId: createdFields.mount_type.id, value: 'Gasket' },
      { productId: rainy75.id, specFieldId: createdFields.plate_material.id, value: 'FR4' },
      { productId: rainy75.id, specFieldId: createdFields.foam.id, value: 'Case + Plate' },
      { productId: rainy75.id, specFieldId: createdFields.pcb_type.id, value: 'Hot Swap' },
      { productId: rainy75.id, specFieldId: createdFields.pcb_thickness.id, value: '1.6 mm' },
      { productId: rainy75.id, specFieldId: createdFields.south_facing_leds.id, value: 'Yes' },
      { productId: rainy75.id, specFieldId: createdFields.nkro.id, value: 'Yes' },
      { productId: rainy75.id, specFieldId: createdFields.polling_rate.id, value: '1000 Hz' },
      { productId: rainy75.id, specFieldId: createdFields.connection.id, value: 'Tri-Mode' },
      { productId: rainy75.id, specFieldId: createdFields.bluetooth.id, value: 'Yes' },
      { productId: rainy75.id, specFieldId: createdFields.wireless_2_4ghz.id, value: 'Yes' },
      { productId: rainy75.id, specFieldId: createdFields.rgb.id, value: 'South Facing' },
      { productId: rainy75.id, specFieldId: createdFields.per_key_rgb.id, value: 'Yes' },
      { productId: rainy75.id, specFieldId: createdFields.software.id, value: 'VIA' },
      { productId: rainy75.id, specFieldId: createdFields.qmk.id, value: 'Yes' },
      { productId: rainy75.id, specFieldId: createdFields.hot_swap.id, value: 'Yes' },
    ],
    skipDuplicates: true,
  });

  const bridge75 = await prisma.product.upsert({
    where: { slug: 'bridge75' },
    update: {},
    create: {
      name: 'Bridge75',
      slug: 'bridge75',
      brandId: bridge.id,
      categoryId: keyboards.id,
      description: 'Affordable 75% keyboard with gasket mount and south-facing RGB.',
    },
  });

  await prisma.specification.createMany({
    data: [
      { productId: bridge75.id, specFieldId: createdFields.layout.id, value: '75%' },
      { productId: bridge75.id, specFieldId: createdFields.case_material.id, value: 'Aluminum' },
      { productId: bridge75.id, specFieldId: createdFields.weight.id, value: '1650 g' },
      { productId: bridge75.id, specFieldId: createdFields.typing_angle.id, value: '6°' },
      { productId: bridge75.id, specFieldId: createdFields.mount_type.id, value: 'Gasket' },
      { productId: bridge75.id, specFieldId: createdFields.plate_material.id, value: 'FR4' },
      { productId: bridge75.id, specFieldId: createdFields.pcb_type.id, value: 'Hot Swap' },
      { productId: bridge75.id, specFieldId: createdFields.south_facing_leds.id, value: 'Yes' },
      { productId: bridge75.id, specFieldId: createdFields.connection.id, value: 'Wired' },
      { productId: bridge75.id, specFieldId: createdFields.rgb.id, value: 'South Facing' },
      { productId: bridge75.id, specFieldId: createdFields.software.id, value: 'VIA' },
      { productId: bridge75.id, specFieldId: createdFields.hot_swap.id, value: 'Yes' },
    ],
    skipDuplicates: true,
  });

  const neo80 = await prisma.product.upsert({
    where: { slug: 'neo80' },
    update: {},
    create: {
      name: 'Neo80',
      slug: 'neo80',
      brandId: neo.id,
      categoryId: keyboards.id,
      description: 'TKL barebone keyboard with aluminum construction.',
    },
  });

  await prisma.specification.createMany({
    data: [
      { productId: neo80.id, specFieldId: createdFields.layout.id, value: 'TKL' },
      { productId: neo80.id, specFieldId: createdFields.case_material.id, value: 'Aluminum' },
      { productId: neo80.id, specFieldId: createdFields.mount_type.id, value: 'Gasket' },
      { productId: neo80.id, specFieldId: createdFields.pcb_type.id, value: 'Hot Swap' },
    ],
    skipDuplicates: true,
  });

  const aulaF75 = await prisma.product.upsert({
    where: { slug: 'aula-f75' },
    update: {},
    create: {
      name: 'Aula F75',
      slug: 'aula-f75',
      brandId: aula.id,
      categoryId: keyboards.id,
      description: 'Budget 75% mechanical keyboard with hot-swap and RGB.',
    },
  });

  const wooting60he = await prisma.product.upsert({
    where: { slug: 'wooting-60he' },
    update: {},
    create: {
      name: 'Wooting 60HE',
      slug: 'wooting-60he',
      brandId: wooting.id,
      categoryId: keyboards.id,
      description: 'Hall Effect gaming keyboard with rapid trigger.',
    },
  });

  await prisma.specification.createMany({
    data: [
      { productId: wooting60he.id, specFieldId: createdFields.layout.id, value: '60%' },
      { productId: wooting60he.id, specFieldId: createdFields.pcb_type.id, value: 'Hall Effect' },
      { productId: wooting60he.id, specFieldId: createdFields.connection.id, value: 'Wired' },
    ],
    skipDuplicates: true,
  });

  // Vendor Products (prices)
  const vendorProducts = [
    { vendorId: stacksKB.id, productId: rainy75.id, price: 8999, shippingIncluded: true, vendorUrl: 'https://stackskb.com/products/rainy75' },
    { vendorId: genesisPC.id, productId: rainy75.id, price: 9499, shippingCost: 0, shippingIncluded: true, vendorUrl: 'https://genesispc.in/products/rainy75' },
    { vendorId: neoMacro.id, productId: rainy75.id, price: 9999, shippingCost: 200, shippingIncluded: false, vendorUrl: 'https://neomacro.com/products/rainy75' },
    { vendorId: hardwareCorpus.id, productId: rainy75.id, price: 10499, shippingIncluded: true, vendorUrl: 'https://hardwarecorpus.com/products/rainy75' },

    { vendorId: stacksKB.id, productId: bridge75.id, price: 3999, shippingIncluded: true, vendorUrl: 'https://stackskb.com/products/bridge75' },
    { vendorId: genesisPC.id, productId: bridge75.id, price: 4299, shippingIncluded: true, vendorUrl: 'https://genesispc.in/products/bridge75' },

    { vendorId: stacksKB.id, productId: neo80.id, price: 7499, shippingIncluded: true, vendorUrl: 'https://stackskb.com/products/neo80' },
    { vendorId: neoMacro.id, productId: neo80.id, price: 7999, shippingCost: 150, shippingIncluded: false, vendorUrl: 'https://neomacro.com/products/neo80' },

    { vendorId: stacksKB.id, productId: aulaF75.id, price: 2499, shippingIncluded: true, vendorUrl: 'https://stackskb.com/products/aula-f75' },
    { vendorId: genesisPC.id, productId: aulaF75.id, price: 2799, shippingIncluded: true, vendorUrl: 'https://genesispc.in/products/aula-f75' },

    { vendorId: stacksKB.id, productId: wooting60he.id, price: 17999, shippingIncluded: true, vendorUrl: 'https://stackskb.com/products/wooting-60he' },
  ];

  for (const vp of vendorProducts) {
    const shipping = vp.shippingIncluded ? 0 : (vp.shippingCost ?? 0);
    const total = vp.price + shipping;

    const existing = await prisma.vendorProduct.findUnique({
      where: { vendorId_productId: { vendorId: vp.vendorId, productId: vp.productId } },
    });

    if (!existing) {
      const created = await prisma.vendorProduct.create({
        data: {
          vendorId: vp.vendorId,
          productId: vp.productId,
          vendorUrl: vp.vendorUrl,
          price: vp.price,
          shippingCost: shipping,
          shippingIncluded: vp.shippingIncluded,
          totalPrice: total,
          stockStatus: 'in_stock',
        },
      });

      await prisma.priceHistory.create({
        data: {
          vendorProductId: created.id,
          price: vp.price,
          shippingCost: shipping,
          totalPrice: total,
          stockStatus: 'in_stock',
        },
      });
    }
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
