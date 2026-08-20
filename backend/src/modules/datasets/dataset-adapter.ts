/**
 * Placeholder for dataset adapter architecture.
 * Future: normalize source-specific data into standard event schema.
 */
export interface DatasetAdapter {
  sourceType: string;
  validate(filePath: string): Promise<boolean>;
  parse(filePath: string): Promise<unknown[]>;
}

export interface EventNormalizer {
  normalize(rawEvent: unknown): unknown;
}

export interface DataSource {
  type: string;
  connect(config: Record<string, unknown>): Promise<void>;
  fetchEvents(since?: Date): Promise<unknown[]>;
}
