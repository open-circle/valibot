import { describe, expect, test } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { iban, type IbanAction, type IbanIssue } from './iban.ts';

describe('iban', () => {
  describe('should return action object', () => {
    const baseAction: Omit<IbanAction<string, never>, 'message'> = {
      kind: 'validation',
      type: 'iban',
      reference: iban,
      expects: null,
      requirement: expect.any(Function),
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: IbanAction<string, undefined> = {
        ...baseAction,
        message: undefined,
      };
      expect(iban()).toStrictEqual(action);
      expect(iban(undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(iban('message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      } satisfies IbanAction<string, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(iban(message)).toStrictEqual({
        ...baseAction,
        message,
      } satisfies IbanAction<string, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const action = iban();

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

    // Hint: Examples of all countries from the SWIFT IBAN Registry
    test('for electronic format', () => {
      expectNoActionIssue(action, [
        'AD1200012030200359100100',
        'AE070331234567890123456',
        'AL47212110090000000235698741',
        'AT611904300234573201',
        'AZ21NABZ00000000137010001944',
        'BA391290079401028494',
        'BE68539007547034',
        'BG80BNBG96611020345678',
        'BH67BMAG00001299123456',
        'BI4210000100010000332045181',
        'BR6699999A03000010009795493C1',
        'BY13NBRB3600900000002Z00AB00',
        'CH9300762011623852957',
        'CR05015202001026284066',
        'CY17002001280000001200527600',
        'CZ6508000000192000145399',
        'DE89370400440532013000',
        'DJ2100010000000154000100186',
        'DK5000400440116243',
        'DO28BAGR00000001212453611324',
        'EE382200221020145685',
        'EG380019000500000000263180002',
        'ES9121000418450200051332',
        'FI2112345600000785',
        'FK88SC123456789012',
        'FO6264600001631634',
        'FR1420041010050500013M02606',
        'GB29NWBK60161331926819',
        'GE29NB0000000101904917',
        'GI75NWBK000000007099453',
        'GL8964710001000206',
        'GR1601101250000000012300695',
        'GT82TRAJ01020000001210029690',
        'HN88CABF00000000000250005469',
        'HR1210010051863000160',
        'HU42117730161111101800000000',
        'IE29AIBK93115212345678',
        'IL620108000000099999999',
        'IQ98NBIQ850123456789012',
        'IS140159260076545510730339',
        'IT60X0542811101000000123456',
        'JO94CBJO0010000000000131000302',
        'KW81CBKU0000000000001234560101',
        'KZ86125KZT5004100100',
        'LB62099900000001001901229114',
        'LC55HEMM000100010012001200023015',
        'LI21088100002324013AA',
        'LT121000011101001000',
        'LU280019400644750000',
        'LV80BANK0000435195001',
        'LY83002048000020100120361',
        'MC5811222000010123456789030',
        'MD24AG000225100013104168',
        'ME25505000012345678951',
        'MK07250120000058984',
        'MN121234123456789123',
        'MR1300020001010000123456753',
        'MT84MALT011000012345MTLCAST001S',
        'MU17BOMM0101101030300200000MUR',
        'NI45BAPR00000013000003558124',
        'NL91ABNA0417164300',
        'NO9386011117947',
        'OM810180000001299123456',
        'PK36SCBL0000001123456702',
        'PL61109010140000071219812874',
        'PS92PALS000000000400123456702',
        'PT50000201231234567890154',
        'QA58DOHB00001234567890ABCDEFG',
        'RO49AAAA1B31007593840000',
        'RS35260005601001611379',
        'RU0304452522540817810538091310419',
        'SA0380000000608010167519',
        'SC18SSCB11010000000000001497USD',
        'SD2129010501234001',
        'SE4550000000058398257466',
        'SI56263300012039086',
        'SK3112000000198742637541',
        'SM86U0322509800000000270100',
        'SO211000001001000100141',
        'ST23000100010051845310146',
        'SV62CENR00000000000000700025',
        'TL380080012345678910157',
        'TN5910006035183598478831',
        'TR330006100519786457841326',
        'UA213223130000026007233566001',
        'VA59001123000012345678',
        'VG96VPVG0000012345678901',
        'XK051212012345678906',
        'YE15CBYE0001018861234567891234',
      ]);
    });

    // Hint: Examples of all countries from the SWIFT IBAN Registry
    test('for print format', () => {
      expectNoActionIssue(action, [
        'AD12 0001 2030 2003 5910 0100',
        'AE07 0331 2345 6789 0123 456',
        'AL47 2121 1009 0000 0002 3569 8741',
        'AT61 1904 3002 3457 3201',
        'AZ21 NABZ 0000 0000 1370 1000 1944',
        'BA39 1290 0794 0102 8494',
        'BE68 5390 0754 7034',
        'BG80 BNBG 9661 1020 3456 78',
        'BH67 BMAG 0000 1299 1234 56',
        'BI42 10000 10001 00003320451 81',
        'BR66 9999 9A03 0000 1000 9795 493C 1',
        'BY13 NBRB 3600 9000 0000 2Z00 AB00',
        'CH93 0076 2011 6238 5295 7',
        'CR05 0152 0200 1026 2840 66',
        'CY17 0020 0128 0000 0012 0052 7600',
        'CZ65 0800 0000 1920 0014 5399',
        'DE89 3704 0044 0532 0130 00',
        'DJ21 0001 0000 0001 5400 0100 186',
        'DK50 0040 0440 1162 43',
        'DO28 BAGR 0000 0001 2124 5361 1324',
        'EE38 2200 2210 2014 5685',
        'EG38 0019 0005 0000 0000 2631 8000 2',
        'ES91 2100 0418 4502 0005 1332',
        'FI21 1234 5600 0007 85',
        'FK88 SC12 3456 7890 12',
        'FO62 6460 0001 6316 34',
        'FR14 2004 1010 0505 0001 3M02 606',
        'GB29 NWBK 6016 1331 9268 19',
        'GE29 NB00 0000 0101 9049 17',
        'GI75 NWBK 0000 0000 7099 453',
        'GL89 6471 0001 0002 06',
        'GR16 0110 1250 0000 0001 2300 695',
        'GT82 TRAJ 0102 0000 0012 1002 9690',
        'HN88 CABF 0000 0000 0002 5000 5469',
        'HR12 1001 0051 8630 0016 0',
        'HU42 1177 3016 1111 1018 0000 0000',
        'IE29 AIBK 9311 5212 3456 78',
        'IL62 0108 0000 0009 9999 999',
        'IQ98 NBIQ 8501 2345 6789 012',
        'IS14 0159 2600 7654 5510 7303 39',
        'IT60 X054 2811 1010 0000 0123 456',
        'JO94 CBJO 0010 0000 0000 0131 0003 02',
        'KW81 CBKU 0000 0000 0000 1234 5601 01',
        'KZ86 125K ZT50 0410 0100',
        'LB62 0999 0000 0001 0019 0122 9114',
        'LC55 HEMM 0001 0001 0012 0012 0002 3015',
        'LI21 0881 0000 2324 013A A',
        'LT12 1000 0111 0100 1000',
        'LU28 0019 4006 4475 0000',
        'LV80 BANK 0000 4351 9500 1',
        'LY83 002 048 000020100120361',
        'MC58 1122 2000 0101 2345 6789 030',
        'MD24 AG00 0225 1000 1310 4168',
        'ME25 5050 0001 2345 6789 51',
        'MK07 2501 2000 0058 984',
        'MN12 1234 1234 5678 9123',
        'MR13 0002 0001 0100 0012 3456 753',
        'MT84 MALT 0110 0001 2345 MTLC AST0 01S',
        'MU17 BOMM 0101 1010 3030 0200 000M UR',
        'NI45 BAPR 0000 0013 0000 0355 8124',
        'NL91 ABNA 0417 1643 00',
        'NO93 8601 1117 947',
        'OM81 0180 0000 0129 9123 456',
        'PK36 SCBL 0000 0011 2345 6702',
        'PL61 1090 1014 0000 0712 1981 2874',
        'PS92 PALS 0000 0000 0400 1234 5670 2',
        'PT50 0002 0123 1234 5678 9015 4',
        'QA58 DOHB 0000 1234 5678 90AB CDEF G',
        'RO49 AAAA 1B31 0075 9384 0000',
        'RS35 2600 0560 1001 6113 79',
        'RU03 0445 2522 5408 1781 0538 0913 1041 9',
        'SA03 8000 0000 6080 1016 7519',
        'SC18 SSCB 1101 0000 0000 0000 1497 USD',
        'SD21 2901 0501 2340 01',
        'SE45 5000 0000 0583 9825 7466',
        'SI56 2633 0001 2039 086',
        'SK31 1200 0000 1987 4263 7541',
        'SM86 U032 2509 8000 0000 0270 100',
        'SO21 1000 0010 0100 0100 141',
        'ST23 0001 0001 0051 8453 1014 6',
        'SV 62 CENR 00000000000000700025',
        'TL38 0080 0123 4567 8910 157',
        'TN59 1000 6035 1835 9847 8831',
        'TR33 0006 1005 1978 6457 8413 26',
        'UA21 3223 1300 0002 6007 2335 6600 1',
        'VA59 001 1230 0001 2345 678',
        'VG96 VPVG 0000 0123 4567 8901',
        'XK05 1212 0123 4567 8906',
        'YE15 CBYE 0001 0188 6123 4567 8912 34',
      ]);
    });

    test('for other print formats', () => {
      expectNoActionIssue(action, [
        'DE 89 3704 0044 0532 0130 00', // space after country code
        'DE893704 0044 0532 0130 00', // first group not separated
        'DE89 370 4004 4053 2013 000', // groups with 3 characters
        'D E 8 9 3 7 0 4 0 0 4 4 0 5 3 2 0 1 3 0 0 0', // space between all characters
      ]);
    });

    test('for check digits 02, 97 and 98', () => {
      expectNoActionIssue(action, [
        'DE02370400440532010007',
        'DE97370400440532010043',
        'DE98370400440532010025',
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const action = iban('message');
    const baseIssue: Omit<IbanIssue<string>, 'input' | 'received'> = {
      kind: 'validation',
      type: 'iban',
      expected: null,
      message: 'message',
      requirement: expect.any(Function),
    };

    test('for empty strings', () => {
      expectActionIssue(action, baseIssue, ['', ' ', '\n']);
    });

    test('for invalid check digits', () => {
      expectActionIssue(action, baseIssue, [
        'DE88370400440532013000',
        'GB83WEST12345698765432',
        'NO9386011117948',
        'DE88 3704 0044 0532 0130 00',
      ]);
    });

    test('for check digits 00, 01 and 99', () => {
      // Hint: These pass the MOD 97-10 check but are never generated
      expectActionIssue(action, baseIssue, [
        'DE00370400440532010043',
        'DE01370400440532010025',
        'DE99370400440532010007',
        'DE 00 3704 0044 0532 0100 43',
        'DE0 1 3704 0044 0532 0100 25',
        'D E 9 9 3 7 0 4 0 0 4 4 0 5 3 2 0 1 0 0 0 7',
      ]);
    });

    test('for unknown country codes', () => {
      // Hint: These pass the MOD 97-10 check
      expectActionIssue(action, baseIssue, [
        'US88370400440532013000',
        'XX46370400440532013000',
      ]);
    });

    test('for invalid BBAN structure of country', () => {
      // Hint: These pass the MOD 97-10 check and have the correct length
      expectActionIssue(action, baseIssue, [
        'DE793704004405W2013000', // letter in digits (DE 18n)
        'DE32370400440532A13000', // letter in digits (DE 18n)
        'GB31WE5T12345698765432', // digit in letters (GB 4a14n)
        'GB55WEST1234569876543A', // letter in digits (GB 4a14n)
        'IT4550542811101000000123456', // digit in letters (IT 1a10n12c)
        'MU19BOMM0101101030300200000M0R', // digit in letters (MU 4a19n3a)
        'NL251BNA0417164300', // digit in letters (NL 4a10n)
      ]);
    });

    test('for invalid length of country', () => {
      // Hint: These pass the MOD 97-10 check
      expectActionIssue(action, baseIssue, [
        'DE5137040044053201300', // too short
        'DE6537040044053201300012', // too long
        'DE893704004405W013000', // '32' replaced with 'W'
        'GB88WEST1234569876543', // too short
        'NO37860111179470', // too long
        'DE933704004405', // no country with 14 characters
        'DE903704004405320', // no country with 17 characters
        'DE7637040044053201300000000000000A', // no country with 34 characters
      ]);
    });

    test('for invalid country codes and check digits', () => {
      expectActionIssue(action, baseIssue, [
        '1E89370400440532013000', // digit in country code
        'D189370400440532013000', // digit in country code
        'DEX9370400440532013000', // letter in check digits
        'DE8X370400440532013000', // letter in check digits
        'DE 8X 3704 0044 0532 0130 00', // letter in check digits
      ]);
    });

    test('for lowercase letters', () => {
      expectActionIssue(action, baseIssue, [
        'de89370400440532013000',
        'GB82west12345698765432',
        'gb82 west 1234 5698 7654 32',
      ]);
    });

    test('for invalid characters', () => {
      expectActionIssue(action, baseIssue, [
        'DE89-3704-0044-0532-0130-00',
        'DE89_3704_0044_0532_0130_00',
        'DE89.3704.0044.0532.0130.00',
        'DE89:3704:0044:0532:0130:00',
        'DE89370400440532013@00',
        'DE8937040044053201300Ё',
        'DE89370400440532013000\n',
      ]);
    });

    test('for invalid print format', () => {
      expectActionIssue(action, baseIssue, [
        ' DE89 3704 0044 0532 0130 00', // leading space
        'DE89 3704 0044 0532 0130 00 ', // trailing space
        'DE89  3704 0044 0532 0130 00', // double space
        'DE89\t3704\t0044\t0532\t0130\t00', // tab as separator
      ]);
    });

    test('for too short and too long inputs', () => {
      expectActionIssue(action, baseIssue, [
        'DE89',
        'DE8937040044',
        'DE8937040044053201300000000000000000',
        'DE89370400440532013000'.padEnd(68, '0'),
      ]);
    });
  });
});
