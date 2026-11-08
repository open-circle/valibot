import type { GenericSchema, GenericSchemaAsync } from '../../types/index.ts';
import type {
  createMutualRecursive,
  MutualConstruction,
} from '../mutualRecursive/_mutualRecursive.ts';
import {
  checkRecursiveReferences,
  createRecursiveSchema,
  createRef,
  type RecursiveOwner,
  type Ref,
  type RefAsync,
} from './_recursive.ts';

type SyncOrAsyncSchema = GenericSchema | GenericSchemaAsync;

type Construction = { readonly reference: RecursiveOwner['reference'] } & (
  | {
      readonly type: 'recursive';
      readonly async: false;
      readonly build: (self: Ref) => GenericSchema;
    }
  | {
      readonly type: 'recursiveAsync';
      readonly async: true;
      readonly build: (self: RefAsync) => SyncOrAsyncSchema;
    }
  | (MutualConstruction & {
      readonly mutual: typeof createMutualRecursive;
    })
);

/**
 * Creates a recursive schema or a map of mutually recursive schemas.
 *
 * @param construction The schema construction options.
 *
 * @returns A recursive schema or a map of recursive schemas.
 *
 * @internal
 */
export function createRecursive(construction: Construction): unknown {
  let definition: RecursiveOwner['definition'];
  const owner = {
    ...construction,
    get definition() {
      return definition;
    },
  } satisfies RecursiveOwner;

  if ('mutual' in owner) {
    return owner.mutual(owner, (definitions) => {
      definition = definitions;
    });
  }

  // @ts-expect-error TS can't correlate the owner's sync/async build callback with its matching reference.
  definition = owner.build(createRef(owner));
  checkRecursiveReferences(definition, owner);
  return createRecursiveSchema<
    SyncOrAsyncSchema & { readonly wrapped: SyncOrAsyncSchema }
  >(definition, owner, owner.type, owner.reference);
}
