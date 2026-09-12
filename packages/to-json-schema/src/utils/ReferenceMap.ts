import type * as v from 'valibot';
import type { JsonSchema } from '../types/index.ts';

/**
 * Schema reference map with collision-free reference ID allocation.
 */
export class ReferenceMap extends Map<
  v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  string
> {
  /**
   * The used reference IDs.
   */
  private readonly usedIds: Set<string>;

  /**
   * The next reference ID candidate.
   */
  private count = 0;

  /**
   * Creates an empty schema reference map.
   */
  constructor() {
    // Entries would call set before usedIds is initialized.
    super();
    this.usedIds = new Set();
  }

  /**
   * Adds a schema reference and reserves its ID.
   *
   * @param schema The Valibot schema.
   * @param referenceId The reference ID.
   *
   * @returns The reference map.
   */
  override set(
    schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
    referenceId: string
  ): this {
    this.usedIds.add(referenceId);
    return super.set(schema, referenceId);
  }

  /**
   * Creates a reference ID that is not yet used.
   *
   * @param definitions The JSON Schema definitions.
   *
   * @returns The unused reference ID.
   */
  createId(definitions: Record<string, JsonSchema>): string {
    while (
      this.usedIds.has(`${this.count}`) ||
      `${this.count}` in definitions
    ) {
      this.count++;
    }
    return `${this.count++}`;
  }
}
