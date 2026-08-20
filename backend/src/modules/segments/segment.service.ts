import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/utils/errors";

export const segmentService = {
  async list(organizationId: string, skip: number, limit: number, isActive?: boolean) {
    const where = {
      organizationId,
      ...(isActive !== undefined && { isActive }),
    };
    const [segments, total] = await Promise.all([
      prisma.segment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { customerSegments: true } } },
      }),
      prisma.segment.count({ where }),
    ]);
    return { segments, total };
  },

  async getById(organizationId: string, id: string) {
    const segment = await prisma.segment.findFirst({
      where: { id, organizationId },
      include: { customerSegments: { include: { customer: true } } },
    });
    if (!segment) throw new NotFoundError("Segment not found");
    return segment;
  },
};
