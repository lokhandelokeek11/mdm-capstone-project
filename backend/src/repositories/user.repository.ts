import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const userRepository = {
  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: { organization: true },
      });
    } catch (error) {
      console.error("userRepository.findByEmail DB error:", error);
      return null;
    }
  },

  async findById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: { organization: true },
      });
    } catch (error) {
      console.error("userRepository.findById DB error:", error);
      return null;
    }
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
    try {
      return await prisma.organization.findUnique({ where: { slug } });
    } catch (error) {
      console.error("organizationRepository.findBySlug DB error:", error);
      return null;
    }
  },

  async create(data: Prisma.OrganizationCreateInput) {
    return prisma.organization.create({ data });
  },
};
