import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: { organization: true },
    });
  },
};

export const organizationRepository = {
  async findBySlug(slug: string) {
    return prisma.organization.findUnique({ where: { slug } });
  },

  async create(data: Prisma.OrganizationCreateInput) {
    return prisma.organization.create({ data });
  },
};
