import bcrypt from "bcrypt";
import {
  PrismaClient,
  UserRole,
  EventType,
  JourneyStageType,
  PredictionType,
  RecommendedActionType,
  ModelStatus,
  DatasetStatus,
  DataSourceType,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://cji_user:cji_password@localhost:5432/customer_journey_intelligence",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const org = await prisma.organization.upsert({
    where: { slug: "demo-retail-co" },
    update: {},
    create: {
      name: "Demo Retail Co",
      slug: "demo-retail-co",
    },
  });

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo-retail.com" },
    update: {},
    create: {
      name: "Lokeek Lokhande",
      email: "admin@demo-retail.com",
      passwordHash,
      role: UserRole.ADMIN,
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "analyst@demo-retail.com" },
    update: {},
    create: {
      name: "Gauri Dhondge",
      email: "analyst@demo-retail.com",
      passwordHash,
      role: UserRole.MARKETING_ANALYST,
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@demo-retail.com" },
    update: {},
    create: {
      name: "Ved Mahajan",
      email: "manager@demo-retail.com",
      passwordHash,
      role: UserRole.MARKETING_MANAGER,
      organizationId: org.id,
    },
  });

  const dataset = await prisma.dataset.create({
    data: {
      organizationId: org.id,
      name: "Demo Behavioral Events",
      description: "Synthetic customer behavioral dataset for development",
      sourceType: DataSourceType.CSV,
      status: DatasetStatus.READY,
      rowCount: 1250,
    },
  });

  const stages = await Promise.all(
    [
      { name: "Awareness", stageType: JourneyStageType.AWARENESS, orderIndex: 1 },
      { name: "Consideration", stageType: JourneyStageType.CONSIDERATION, orderIndex: 2 },
      { name: "High Intent", stageType: JourneyStageType.INTENT, orderIndex: 3 },
      { name: "Purchase", stageType: JourneyStageType.PURCHASE, orderIndex: 4 },
      { name: "Retention", stageType: JourneyStageType.RETENTION, orderIndex: 5 },
    ].map((s) =>
      prisma.journeyStage.create({
        data: { organizationId: org.id, ...s },
      }),
    ),
  );

  const segments = await Promise.all(
    [
      { name: "Cart Abandoners", description: "Added to cart but did not purchase" },
      { name: "High Intent", description: "Strong purchase signals" },
      { name: "Repeat Buyers", description: "Multiple purchases" },
      { name: "Inactive", description: "No recent activity" },
      { name: "Browsers", description: "Product views only" },
    ].map((s) =>
      prisma.segment.create({
        data: { organizationId: org.id, ...s, isActive: true },
      }),
    ),
  );

  const products = await Promise.all(
    [
      { externalId: "P001", name: "Wireless Headphones", category: "Electronics", price: 79.99 },
      { externalId: "P002", name: "Running Shoes", category: "Footwear", price: 129.99 },
      { externalId: "P003", name: "Coffee Maker", category: "Home", price: 49.99 },
      { externalId: "P004", name: "Laptop Stand", category: "Electronics", price: 34.99 },
      { externalId: "P005", name: "Yoga Mat", category: "Fitness", price: 24.99 },
    ].map((p) =>
      prisma.product.create({
        data: { organizationId: org.id, ...p },
      }),
    ),
  );

  const modelVersion = await prisma.modelVersion.create({
    data: {
      organizationId: org.id,
      name: "Purchase Propensity v1",
      modelType: "purchase_propensity",
      version: "1.0.0",
      status: ModelStatus.READY,
      metrics: { accuracy: 0.82, auc: 0.87 },
    },
  });

  const customerData = [
    { externalId: "82931", name: "Customer 82931", email: "cust82931@demo.example" },
    { externalId: "82932", name: "Customer 82932", email: "cust82932@demo.example" },
    { externalId: "82933", name: "Customer 82933", email: "cust82933@demo.example" },
    { externalId: "82934", name: "Customer 82934", email: "cust82934@demo.example" },
    { externalId: "82935", name: "Customer 82935", email: "cust82935@demo.example" },
    { externalId: "82936", name: "Customer 82936", email: "cust82936@demo.example" },
    { externalId: "82937", name: "Customer 82937", email: "cust82937@demo.example" },
    { externalId: "82938", name: "Customer 82938", email: "cust82938@demo.example" },
  ];

  for (let i = 0; i < customerData.length; i++) {
    const c = customerData[i];
    const customer = await prisma.customer.create({
      data: {
        organizationId: org.id,
        externalId: c.externalId,
        name: c.name,
        email: c.email,
      },
    });

    const sessionStart = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000);
    const session = await prisma.session.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        startedAt: sessionStart,
        endedAt: new Date(sessionStart.getTime() + 30 * 60 * 1000),
      },
    });

    const eventTypes: EventType[] = [
      EventType.SESSION_START,
      EventType.PRODUCT_VIEW,
      EventType.PRODUCT_VIEW,
      EventType.SEARCH,
      EventType.ADD_TO_CART,
    ];
    if (i % 3 === 0) eventTypes.push(EventType.PURCHASE);
    if (i % 4 === 0) eventTypes.push(EventType.SESSION_END);

    for (let j = 0; j < eventTypes.length; j++) {
      await prisma.event.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          sessionId: session.id,
          datasetId: dataset.id,
          eventType: eventTypes[j],
          productId: products[j % products.length].id,
          occurredAt: new Date(sessionStart.getTime() + j * 5 * 60 * 1000),
        },
      });
    }

    if (i % 3 === 0) {
      await prisma.transaction.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          productId: products[0].id,
          amount: 79.99,
          occurredAt: new Date(sessionStart.getTime() + 25 * 60 * 1000),
        },
      });
    }

    await prisma.customerFeature.createMany({
      data: [
        {
          organizationId: org.id,
          customerId: customer.id,
          featureKey: "engagement_score",
          featureValue: 50 + i * 5,
        },
        {
          organizationId: org.id,
          customerId: customer.id,
          featureKey: "purchase_propensity",
          featureValue: 0.4 + i * 0.05,
        },
        {
          organizationId: org.id,
          customerId: customer.id,
          featureKey: "journey_stage",
          featureValue: stages[Math.min(i, stages.length - 1)].stageType,
        },
      ],
    });

    await prisma.customerSegment.create({
      data: {
        customerId: customer.id,
        segmentId: segments[i % segments.length].id,
      },
    });

    await prisma.prediction.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        modelVersionId: modelVersion.id,
        predictionType: PredictionType.PURCHASE_PROPENSITY,
        predictedValue: { probability: 0.4 + i * 0.05 },
        confidence: 0.75 + i * 0.02,
      },
    });

    await prisma.prediction.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        modelVersionId: modelVersion.id,
        predictionType: PredictionType.NEXT_EVENT,
        predictedValue: { eventType: i % 3 === 0 ? "PURCHASE" : "ADD_TO_CART" },
        confidence: 0.7,
      },
    });

    const actionTypes = [
      RecommendedActionType.CART_REMINDER,
      RecommendedActionType.PRODUCT_RECOMMENDATION,
      RecommendedActionType.PERSONALIZED_EMAIL,
      RecommendedActionType.WAIT,
      RecommendedActionType.RE_ENGAGEMENT,
    ];

    await prisma.recommendedAction.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        actionType: actionTypes[i % actionTypes.length],
        reason: "Demo recommendation based on journey stage and behavior",
        priority: 10 - i,
      },
    });

    await prisma.productRecommendation.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        productId: products[(i + 1) % products.length].id,
        score: 0.85 - i * 0.05,
        reason: "Based on browsing history",
      },
    });
  }

  await prisma.strategyExperiment.create({
    data: {
      organizationId: org.id,
      name: "Cart Reminder vs Discount",
      description: "Compare cart reminder email vs discount offer",
      status: "DRAFT",
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: admin.id,
      action: "SEED",
      resource: "database",
      metadata: { message: "Initial seed completed" },
    },
  });

  console.log("Seed completed successfully.");
  console.log("Demo credentials:");
  console.log("  admin@demo-retail.com / Password123!");
  console.log("  analyst@demo-retail.com / Password123!");
  console.log("  manager@demo-retail.com / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
