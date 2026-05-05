import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { hash, type HashAction, type HashIssue } from './hash.ts';

describe('hash', () => {
  describe('should return action object', () => {
    const baseAction: Omit<HashAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'hash',
      reference: hash,
      expects: null,
      requirement: expect.any(RegExp),
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: HashAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(hash(['md5'])).toStrictEqual(action);
      expect(hash(['md5'], undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(hash(['md5'], 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies HashAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(hash(['md5'], message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies HashAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
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
        hash(['md5'])['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for md4 hashes', () => {
      expectNoActionIssue(hash(['md4']), [
        'c93d3bf7a7c4afe94b64e30c2ce39f4f',
        '16360e57b209fb9d07f725aa796789ac',
        'fbe550055d737a0cd3a4325df5dfdc79',
      ]);
    });

    test('for md5 hashes', () => {
      expectNoActionIssue(hash(['md5']), [
        'd41d8cd98f00b204e9800998ecf8427e',
        '52f3810691030a673b1d060a98b31d09',
        '8a00ee7faa357ad736a5832a56c03c73',
      ]);
    });

    test('for sha1 hashes', () => {
      expectNoActionIssue(hash(['sha1']), [
        'd033e22ae348aeb5660fc2140aec35850c4da997',
        '6a382c838f2d4b656062a55e69e3755ae267c254',
        'ed8bda3e9fba8a9341fc1267926389bdac60df33',
      ]);
    });

    test('for sha256 hashes', () => {
      expectNoActionIssue(hash(['sha256']), [
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        '03b04c0f41234a184ddb0f6dd5f85a63e7f40b4bbad056160954306922f12d57',
        '86f5b2c8a75e3f359e588debdd10a076b839a9c9f47db2edf903c0b908dea46f',
      ]);
    });

    test('for sha384 hashes', () => {
      expectNoActionIssue(hash(['sha384']), [
        '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
        'e1c83876fcf6991b54fb249d79c6a75dc85643385d3727a9801413a86087fd177ae09b3a63a7991d5631836dc1cdffd1',
        'b6b6b75130ad75944c39b2e347362446c009f7ba57eb16693c86129983c692ce82d94b4b0f4bb5a408dd76e59fdf4fef',
      ]);
    });

    test('for sha512 hashes', () => {
      expectNoActionIssue(hash(['sha512']), [
        'a8cdec07e13c3af4a7a992db4a352efe3699fe95b470ee503940b7198c4b0ddc8ba0eda677be76bcf638c27ac837c779cd924de0726a1fc137a88ae8a208ef28',
        '6c3fa2fd93b9615fb138973c37f13df3de43bd6917a29c75ed9870cc7882fee2fb89706209abc05d39c3cff220f36ea94e4e3ce900d2204d99e20315c2702a55',
        'c2529f7fe73e78b926d44c76270a1dbb22239da068ecfcef7a6dec99be5fb8e083fb34eb4f79cdf97c559ccad4deb61869ac17aa651a23f254db35ecc9fca5d5',
      ]);
    });

    test('for ripemd128 hashes', () => {
      expectNoActionIssue(hash(['ripemd128']), [
        'c766f912a89d4ccda88e0cce6a713ef7',
        '350de5ee5242d93e23a98966ad7ea3ce',
        '3fa9692610626962c2c9a12adbb2b264',
      ]);
    });

    test('for ripemd160 hashes', () => {
      expectNoActionIssue(hash(['ripemd160']), [
        '9c1185a5c5e9fc54612808977ee8f548b2258d31',
        'e5075950e0b90e426ef7474e4993abb724aef047',
        'a04fefb2f2b664fd10cdb8b17b1ec974db299529',
      ]);
    });

    test('for tiger128 hashes', () => {
      expectNoActionIssue(hash(['tiger128']), [
        '7ab383fc29d81f8d0d68e87c69bae5f1',
        'c914df7857ee41f7d6bebe131a902723',
        'b971739819c2475c757f6e2d7a3309f8',
      ]);
    });

    test('for tiger160 hashes', () => {
      expectNoActionIssue(hash(['tiger160']), [
        '7ab383fc29d81f8d0d68e87c69bae5f1f18266d7',
        'f741ee5778df14c92327901a13bebed617fc3968',
        '5c47c219987371b9f809337a2d6e7f753d7d0f84',
      ]);
    });

    test('for tiger192 hashes', () => {
      expectNoActionIssue(hash(['tiger192']), [
        '4dd00f9e8e8a6a8e3883af1051237c4b47bd2a329b1de1a3',
        'f741ee5778df14c92327901a13bebed617fc3968d42eee4c',
        '5c47c219987371b9f809337a2d6e7f753d7d0f8420fdd8bf',
      ]);
    });

    test('for crc32 hashes', () => {
      expectNoActionIssue(hash(['crc32']), [
        '3d08bb77',
        'd87f7e0c',
        '35ce1956',
        'fb57a171',
      ]);
    });

    test('for crc32b hashes', () => {
      expectNoActionIssue(hash(['crc32b']), [
        '7d4da703',
        '35ce1956',
        'fb57a171',
      ]);
    });

    test('for adler32 hashes', () => {
      expectNoActionIssue(hash(['adler32']), [
        '045d01c1',
        '0bbf02f2',
        '66b108b6',
      ]);
    });

    test('for md5 or adler32 hashes', () => {
      expectNoActionIssue(hash(['md5', 'adler32']), [
        '045d01c1',
        'd41d8cd98f00b204e9800998ecf8427e',
        '52f3810691030a673b1d060a98b31d09',
        '0bbf02f2',
        '8a00ee7faa357ad736a5832a56c03c73',
        '66b108b6',
      ]);
    });

    test('for md4, sha256 or tiger128 hashes', () => {
      expectNoActionIssue(hash(['md4', 'sha256', 'tiger128']), [
        'c93d3bf7a7c4afe94b64e30c2ce39f4f',
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        '7ab383fc29d81f8d0d68e87c69bae5f1',
        'c914df7857ee41f7d6bebe131a902723',
        '16360e57b209fb9d07f725aa796789ac',
        '03b04c0f41234a184ddb0f6dd5f85a63e7f40b4bbad056160954306922f12d57',
        'b971739819c2475c757f6e2d7a3309f8',
        'fbe550055d737a0cd3a4325df5dfdc79',
        '86f5b2c8a75e3f359e588debdd10a076b839a9c9f47db2edf903c0b908dea46f',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseIssue: Omit<
      HashIssue<string>,
      'input' | 'received' | 'requirement'
    > = {
      kind: 'validation',
      type: 'hash',
      expected: null,
      message: 'message',
    };

    test('for invalid md4 hashes', () => {
      expectActionIssue(
        hash(['md4'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{32}$/u },
        [
          '',
          ' ',
          '12345',
          'c93d3bf7a7c4afe94b64e+0c2ce39f4f',
          'd033e22ae348aeb5660fc2140aec35850c4da997',
        ]
      );
    });

    test('for invalid md5 hashes', () => {
      expectActionIssue(
        hash(['md5'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{32}$/u },
        [
          '',
          ' ',
          '12345',
          'd41d8cd98f00b204g9800998ecf8427e',
          '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
        ]
      );
    });

    test('for invalid sha1 hashes', () => {
      expectActionIssue(
        hash(['sha1'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{40}$/u },
        [
          '',
          ' ',
          '12345',
          'ed8bda3e9fba8a9341fc12679263h9bdac60df33',
          '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        ]
      );
    });

    test('for invalid sha256 hashes', () => {
      expectActionIssue(
        hash(['sha256'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{64}$/u },
        [
          '',
          ' ',
          '12345',
          '9f86d081884c7d659a2feaa0c5iad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          'a8cdec07e13c3af4a7a992db4a352efe3699fe95b470ee503940b7198c4b0ddc8ba0eda677be76bcf638c27ac837c779cd924de0726a1fc137a88ae8a208ef28',
        ]
      );
    });

    test('for invalid sha384 hashes', () => {
      expectActionIssue(
        hash(['sha384'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{96}$/u },
        [
          '',
          ' ',
          '12345',
          '38b060a751ac96384cd9327eb1b1e36a21fdb711k4be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
          'c2529f7fe73e78b926d44c76270a1dbb22239da068ecfcef7a6dec99be5fb8e083fb34eb4f79cdf97c559ccad4deb61869ac17aa651a23f254db35ecc9fca5d5',
        ]
      );
    });

    test('for invalid sha512 hashes', () => {
      expectActionIssue(
        hash(['sha512'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{128}$/u },
        [
          '',
          ' ',
          '12345',
          'a8cdec07e13c3af4a7a992db4a352efe3699fe95b470ee5j3940b7198c4b0ddc8ba0eda677be76bcf638c27ac837c779cd924de0726a1fc137a88ae8a208ef28',
          'd41d8cd98f00b204e9800998ecf8427e',
        ]
      );
    });

    test('for invalid ripemd128 hashes', () => {
      expectActionIssue(
        hash(['ripemd128'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{32}$/u },
        [
          '',
          ' ',
          '12345',
          'c766f912a89d4ccdal8e0cce6a713ef7',
          'e5075950e0b90e426ef7474e4993abb724aef047',
        ]
      );
    });

    test('for invalid ripemd160 hashes', () => {
      expectActionIssue(
        hash(['ripemd160'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{40}$/u },
        [
          '',
          ' ',
          '12345',
          '350de5ee5242d93e23a98966ad7ea3ce',
          '9c1185a5c5e9fc54612m08977ee8f548b2258d31',
        ]
      );
    });

    test('for invalid tiger128 hashes', () => {
      expectActionIssue(
        hash(['tiger128'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{32}$/u },
        [
          '',
          ' ',
          '12345',
          '7ab383fc29d81f8d0dn8e87c69bae5f1',
          'f741ee5778df14c92327901a13bebed617fc3968',
        ]
      );
    });

    test('for invalid tiger160 hashes', () => {
      expectActionIssue(
        hash(['tiger160'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{40}$/u },
        [
          '',
          ' ',
          '12345',
          '7ab383fc29d81f8d0d68eo7c69bae5f1f18266d7',
          'f741ee5778df14c92327901a13bebed617fc3968d42eee4c',
        ]
      );
    });

    test('for invalid tiger192 hashes', () => {
      expectActionIssue(
        hash(['tiger192'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{48}$/u },
        [
          '',
          ' ',
          '12345',
          '4dd00f9e8e8a6a8e3883af1051237p4b47bd2a329b1de1a3',
          '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        ]
      );
    });

    test('for invalid crc32 hashes', () => {
      expectActionIssue(
        hash(['crc32'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{8}$/u },
        ['', ' ', '12345', '3d08bq77', 'c93d3bf7a7c4afe94b64e30c2ce39f4f']
      );
    });

    test('for invalid crc32b hashes', () => {
      expectActionIssue(
        hash(['crc32b'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{8}$/u },
        ['', ' ', '12345', '35cer956', 'fbe550055d737a0cd3a4325df5dfdc79']
      );
    });

    test('for invalid adler32 hashes', () => {
      expectActionIssue(
        hash(['adler32'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{8}$/u },
        ['', ' ', '12345', '045dx1c1', '16360e57b209fb9d07f725aa796789ac']
      );
    });

    test('for invalid md5 and adler32 hashes', () => {
      expectActionIssue(
        hash(['adler32', 'md5'], 'message'),
        { ...baseIssue, requirement: /^[a-fA-F0-9]{8}$|^[a-fA-F0-9]{32}$/u },
        [
          '',
          ' ',
          '12345',
          '045d0yc1',
          'd41d8zd98f00b204e9800998ecf8427e',
          '52f38#0691030a673b1d060a98b31d09',
          '9f86d081884c7d659a2feaa0c5iad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        ]
      );
    });

    test('for invalid crc32, ripemd128 and sha1 hashes', () => {
      expectActionIssue(
        hash(['crc32', 'ripemd128', 'sha1'], 'message'),
        {
          ...baseIssue,
          requirement: /^[a-fA-F0-9]{8}$|^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$/u,
        },
        [
          '',
          ' ',
          '1234',
          'fbx7a171',
          '350de5ee5242d93ez3a98966ad7ea3ce',
          '6a382c838f2d4b65y062a55e69e3755ae267c254',
          'c2529f7fe73e78b926d44c76270a1dbb22239da068ecfcef7a6dec99be5fb8e083fb34eb4f79cdf97c559ccad4deb61869ac17aa651a23f254db35ecc9fca5d5',
        ]
      );
    });
  });
});
