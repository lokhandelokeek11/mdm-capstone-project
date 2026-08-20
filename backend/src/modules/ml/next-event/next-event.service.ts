export interface NextEventService {
  predict(organizationId: string, customerId: string): Promise<string | null>;
}

export const nextEventService: NextEventService = {
  async predict() {
    return null;
  },
};
