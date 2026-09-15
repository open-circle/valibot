import { describe, expect, test } from 'vitest';
import { UUID_REGEX } from '../../regex.ts';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { uuid, type UuidAction, type UuidIssue } from './uuid.ts';

describe('uuid', () => {
  describe('should return action object', () => {
    const baseAction: Omit<UuidAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'uuid',
      reference: uuid,
      expects: null,
      requirement: UUID_REGEX,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: UuidAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(uuid()).toStrictEqual(action);
      expect(uuid(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(uuid('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies UuidAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(uuid(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies UuidAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = uuid();

    test('for untyped inputs', () => {
      const issues: [StringIssue] = [
        {
          kind: 'schema',
          type: 'string',
          input: null,
          expected: 'string',
          received: 'null',
          message: 'message',
        },
      ];
      expect(
        action['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for valid UUID v1', () => {
      expectNoActionIssue(action, [
        'a6021db4-0b07-11ef-9262-0242ac120002',
        'bf576dbe-0b07-11ef-9262-0242ac120002',
        'bf576fda-0b07-11ef-9262-0242ac120002',
        'bf577106-0b07-11ef-9262-0242ac120002',
        'bf57721e-0b07-11ef-9262-0242ac120002',
      ]);
    });

    test('for valid UUID v4', () => {
      expectNoActionIssue(action, [
        'c1e12793-2e77-4611-874d-a4f9cc727e1e',
        '95d9d16b-feba-495d-ab7b-07e4212ff3d0',
        'c4322ec9-5c1f-4865-b0b1-52298acc5a8e',
        '6f66b7d5-8400-4e48-99f9-ae94ba418069',
        '779c2294-cb0a-4347-9587-61d4509d32db',
      ]);
    });

    test('for valid UUID v7', () => {
      expectNoActionIssue(action, [
        '018f4f48-1658-7538-8aa9-e3b64526bb43',
        '018f4f48-9a53-72b6-8ee6-91c47cd95f6f',
        '018f4f48-b0a1-75bc-ab3f-11081dfb40b8',
        '018f4f48-cecc-7bfc-b0bc-a77fe4d77d66',
        '018f4f48-e99c-7008-adbe-e3b7e7497ed8',
      ]);
    });

    test('for valid UUID versions 1-8', () => {
      expectNoActionIssue(action, [
        '12345678-1234-1234-1234-1234567890ab',
        '12345678-1234-2234-1234-1234567890ab',
        '12345678-1234-3234-1234-1234567890ab',
        '12345678-1234-4234-1234-1234567890ab',
        '12345678-1234-5234-1234-1234567890ab',
        '12345678-1234-6234-1234-1234567890ab',
        '12345678-1234-7234-1234-1234567890ab',
        '12345678-1234-8234-1234-1234567890ab',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = uuid('message');
    const baseIssue: Omit<UuidIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'uuid',
      expected: null,
      message: 'message',
      requirement: UUID_REGEX,
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for blank spaces', () => {
      expectActionIssue(action, baseIssue, [
        ' c1e12793-2e77-4611-874d-a4f9cc727e1e',
        'c1e12793-2e77-4611-874d-a4f9cc727e1e ',
        ' c1e12793-2e77-4611-874d-a4f9cc727e1e ',
      ]);
    });

    test('for too short UUIDs', () => {
      expectActionIssue(action, baseIssue, [
        'e05717b-1020-4f83-8dce-f33dcac6c101',
        'e057f17b-100-4f83-8dce-f33dcac6c101',
        'e057f17b-1020-f83-8dce-f33dcac6c101',
        'e057f17b-1020-4f83-8de-f33dcac6c101',
        'e057f17b-1020-4f83-8dce-f3dcac6c101',
      ]);
    });

    test('for too long UUIDs', () => {
      expectActionIssue(action, baseIssue, [
        'e057f147b-1020-4f83-8dce-f33dcac6c101',
        'e057f17b-10220-4f83-8dce-f33dcac6c101',
        'e057f17b-1020-4f873-8dce-f33dcac6c101',
        'e057f17b-1020-4f83-8dc2e-f33dcac6c101',
        'e057f17b-1020-4f83-8dce-f33d3cac6c101',
      ]);
    });

    test('for invalid hyphenated UUIDs', () => {
      expectActionIssue(action, baseIssue, [
        'a6021db4-0b07-11ef-9262-0242ac120002-',
        '95d9d16b-feba-495d-ab7b--07e4212ff3d0',
        '95d9d16b--feba-495d-ab7b-07e4212ff3d0',
        '95d9d16b--feba--495d--ab7b--07e4212ff3d0',
      ]);
    });

    test('for invalid placed hyphens', () => {
      expectActionIssue(action, baseIssue, [
        'a6021db4-0b07-11ef-9262-0242ac120002-0',
        '95d9d16b-feba-495d-ab7b-07e4212ff3d-0',
        'c1e1279-32e77-4611-874d-a4f9cc727e1e',
      ]);
    });

    test('for invalid letters', () => {
      expectActionIssue(action, baseIssue, [
        'd8600862-9dea-4g51-b261-ff899d608069',
        'd8600862-9dea-4d51-b261-hf899d608069',
        'd8600862-9dea-4d51-k261-ff899d608069',
        'd8600862-9dea-4d51-b261-zf899d608069',
        'd8600862-9dta-4d51-b261-ff899d608069',
        'd8600862-9dex-4d51-b261-ff899d608069',
      ]);
    });

    test('for invalid version characters', () => {
      expectActionIssue(action, baseIssue, [
        '00000000-0000-0000-0000-000000000000',
        '12345678-1234-0234-1234-1234567890ab',
        '12345678-1234-9234-1234-1234567890ab',
        '12345678-1234-a234-1234-1234567890ab',
      ]);
    });
  });
});
