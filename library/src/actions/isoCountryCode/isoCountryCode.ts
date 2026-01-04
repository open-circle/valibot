import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * ISO3166 country code entries.
 *
 * @see https://www.iso.org/iso-3166-country-codes.html
 * @see https://www.iso.org/obp/ui/#search/code/
 */
export const ISO_3166_ENTRIES = [
  {
    alphaTwo: 'AF',
    alphaThree: 'AFG',
  },
  {
    alphaTwo: 'AL',
    alphaThree: 'ALB',
  },
  {
    alphaTwo: 'DZ',
    alphaThree: 'DZA',
  },
  {
    alphaTwo: 'AS',
    alphaThree: 'ASM',
  },
  {
    alphaTwo: 'AD',
    alphaThree: 'AND',
  },
  {
    alphaTwo: 'AO',
    alphaThree: 'AGO',
  },
  {
    alphaTwo: 'AI',
    alphaThree: 'AIA',
  },
  {
    alphaTwo: 'AQ',
    alphaThree: 'ATA',
  },
  {
    alphaTwo: 'AG',
    alphaThree: 'ATG',
  },
  {
    alphaTwo: 'AR',
    alphaThree: 'ARG',
  },
  {
    alphaTwo: 'AM',
    alphaThree: 'ARM',
  },
  {
    alphaTwo: 'AW',
    alphaThree: 'ABW',
  },
  {
    alphaTwo: 'AU',
    alphaThree: 'AUS',
  },
  {
    alphaTwo: 'AT',
    alphaThree: 'AUT',
  },
  {
    alphaTwo: 'AZ',
    alphaThree: 'AZE',
  },
  {
    alphaTwo: 'BS',
    alphaThree: 'BHS',
  },
  {
    alphaTwo: 'BH',
    alphaThree: 'BHR',
  },
  {
    alphaTwo: 'BD',
    alphaThree: 'BGD',
  },
  {
    alphaTwo: 'BB',
    alphaThree: 'BRB',
  },
  {
    alphaTwo: 'BY',
    alphaThree: 'BLR',
  },
  {
    alphaTwo: 'BE',
    alphaThree: 'BEL',
  },
  {
    alphaTwo: 'BZ',
    alphaThree: 'BLZ',
  },
  {
    alphaTwo: 'BJ',
    alphaThree: 'BEN',
  },
  {
    alphaTwo: 'BM',
    alphaThree: 'BMU',
  },
  {
    alphaTwo: 'AX',
    alphaThree: 'ALA',
  },
  {
    alphaTwo: 'BT',
    alphaThree: 'BTN',
  },
  {
    alphaTwo: 'BO',
    alphaThree: 'BOL',
  },
  {
    alphaTwo: 'BQ',
    alphaThree: 'BES',
  },
  {
    alphaTwo: 'BA',
    alphaThree: 'BIH',
  },
  {
    alphaTwo: 'BW',
    alphaThree: 'BWA',
  },
  {
    alphaTwo: 'BV',
    alphaThree: 'BVT',
  },
  {
    alphaTwo: 'BR',
    alphaThree: 'BRA',
  },
  {
    alphaTwo: 'IO',
    alphaThree: 'IOT',
  },
  {
    alphaTwo: 'BN',
    alphaThree: 'BRN',
  },
  {
    alphaTwo: 'BG',
    alphaThree: 'BGR',
  },
  {
    alphaTwo: 'BF',
    alphaThree: 'BFA',
  },
  {
    alphaTwo: 'BI',
    alphaThree: 'BDI',
  },
  {
    alphaTwo: 'CV',
    alphaThree: 'CPV',
  },
  {
    alphaTwo: 'KH',
    alphaThree: 'KHM',
  },
  {
    alphaTwo: 'CM',
    alphaThree: 'CMR',
  },
  {
    alphaTwo: 'CA',
    alphaThree: 'CAN',
  },
  {
    alphaTwo: 'KY',
    alphaThree: 'CYM',
  },
  {
    alphaTwo: 'CF',
    alphaThree: 'CAF',
  },
  {
    alphaTwo: 'TD',
    alphaThree: 'TCD',
  },
  {
    alphaTwo: 'CL',
    alphaThree: 'CHL',
  },
  {
    alphaTwo: 'CN',
    alphaThree: 'CHN',
  },
  {
    alphaTwo: 'CX',
    alphaThree: 'CXR',
  },
  {
    alphaTwo: 'CC',
    alphaThree: 'CCK',
  },
  {
    alphaTwo: 'CO',
    alphaThree: 'COL',
  },
  {
    alphaTwo: 'KM',
    alphaThree: 'COM',
  },
  {
    alphaTwo: 'CD',
    alphaThree: 'COD',
  },
  {
    alphaTwo: 'CG',
    alphaThree: 'COG',
  },
  {
    alphaTwo: 'CK',
    alphaThree: 'COK',
  },
  {
    alphaTwo: 'CR',
    alphaThree: 'CRI',
  },
  {
    alphaTwo: 'HR',
    alphaThree: 'HRV',
  },
  {
    alphaTwo: 'CU',
    alphaThree: 'CUB',
  },
  {
    alphaTwo: 'CW',
    alphaThree: 'CUW',
  },
  {
    alphaTwo: 'CY',
    alphaThree: 'CYP',
  },
  {
    alphaTwo: 'CZ',
    alphaThree: 'CZE',
  },
  {
    alphaTwo: 'CI',
    alphaThree: 'CIV',
  },
  {
    alphaTwo: 'DK',
    alphaThree: 'DNK',
  },
  {
    alphaTwo: 'DJ',
    alphaThree: 'DJI',
  },
  {
    alphaTwo: 'DM',
    alphaThree: 'DMA',
  },
  {
    alphaTwo: 'DO',
    alphaThree: 'DOM',
  },
  {
    alphaTwo: 'EC',
    alphaThree: 'ECU',
  },
  {
    alphaTwo: 'EG',
    alphaThree: 'EGY',
  },
  {
    alphaTwo: 'SV',
    alphaThree: 'SLV',
  },
  {
    alphaTwo: 'GQ',
    alphaThree: 'GNQ',
  },
  {
    alphaTwo: 'ER',
    alphaThree: 'ERI',
  },
  {
    alphaTwo: 'EE',
    alphaThree: 'EST',
  },
  {
    alphaTwo: 'SZ',
    alphaThree: 'SWZ',
  },
  {
    alphaTwo: 'ET',
    alphaThree: 'ETH',
  },
  {
    alphaTwo: 'FK',
    alphaThree: 'FLK',
  },
  {
    alphaTwo: 'FO',
    alphaThree: 'FRO',
  },
  {
    alphaTwo: 'FJ',
    alphaThree: 'FJI',
  },
  {
    alphaTwo: 'FI',
    alphaThree: 'FIN',
  },
  {
    alphaTwo: 'FR',
    alphaThree: 'FRA',
  },
  {
    alphaTwo: 'GF',
    alphaThree: 'GUF',
  },
  {
    alphaTwo: 'PF',
    alphaThree: 'PYF',
  },
  {
    alphaTwo: 'TF',
    alphaThree: 'ATF',
  },
  {
    alphaTwo: 'GA',
    alphaThree: 'GAB',
  },
  {
    alphaTwo: 'GM',
    alphaThree: 'GMB',
  },
  {
    alphaTwo: 'GE',
    alphaThree: 'GEO',
  },
  {
    alphaTwo: 'DE',
    alphaThree: 'DEU',
  },
  {
    alphaTwo: 'GH',
    alphaThree: 'GHA',
  },
  {
    alphaTwo: 'GI',
    alphaThree: 'GIB',
  },
  {
    alphaTwo: 'GR',
    alphaThree: 'GRC',
  },
  {
    alphaTwo: 'GL',
    alphaThree: 'GRL',
  },
  {
    alphaTwo: 'GD',
    alphaThree: 'GRD',
  },
  {
    alphaTwo: 'GP',
    alphaThree: 'GLP',
  },
  {
    alphaTwo: 'GU',
    alphaThree: 'GUM',
  },
  {
    alphaTwo: 'GT',
    alphaThree: 'GTM',
  },
  {
    alphaTwo: 'GG',
    alphaThree: 'GGY',
  },
  {
    alphaTwo: 'GN',
    alphaThree: 'GIN',
  },
  {
    alphaTwo: 'GW',
    alphaThree: 'GNB',
  },
  {
    alphaTwo: 'GY',
    alphaThree: 'GUY',
  },
  {
    alphaTwo: 'HT',
    alphaThree: 'HTI',
  },
  {
    alphaTwo: 'HM',
    alphaThree: 'HMD',
  },
  {
    alphaTwo: 'VA',
    alphaThree: 'VAT',
  },
  {
    alphaTwo: 'HN',
    alphaThree: 'HND',
  },
  {
    alphaTwo: 'HK',
    alphaThree: 'HKG',
  },
  {
    alphaTwo: 'HU',
    alphaThree: 'HUN',
  },
  {
    alphaTwo: 'IS',
    alphaThree: 'ISL',
  },
  {
    alphaTwo: 'IN',
    alphaThree: 'IND',
  },
  {
    alphaTwo: 'ID',
    alphaThree: 'IDN',
  },
  {
    alphaTwo: 'IR',
    alphaThree: 'IRN',
  },
  {
    alphaTwo: 'IQ',
    alphaThree: 'IRQ',
  },
  {
    alphaTwo: 'IE',
    alphaThree: 'IRL',
  },
  {
    alphaTwo: 'IM',
    alphaThree: 'IMN',
  },
  {
    alphaTwo: 'IL',
    alphaThree: 'ISR',
  },
  {
    alphaTwo: 'IT',
    alphaThree: 'ITA',
  },
  {
    alphaTwo: 'JM',
    alphaThree: 'JAM',
  },
  {
    alphaTwo: 'JP',
    alphaThree: 'JPN',
  },
  {
    alphaTwo: 'JE',
    alphaThree: 'JEY',
  },
  {
    alphaTwo: 'JO',
    alphaThree: 'JOR',
  },
  {
    alphaTwo: 'KZ',
    alphaThree: 'KAZ',
  },
  {
    alphaTwo: 'KE',
    alphaThree: 'KEN',
  },
  {
    alphaTwo: 'KI',
    alphaThree: 'KIR',
  },
  {
    alphaTwo: 'KP',
    alphaThree: 'PRK',
  },
  {
    alphaTwo: 'KR',
    alphaThree: 'KOR',
  },
  {
    alphaTwo: 'KW',
    alphaThree: 'KWT',
  },
  {
    alphaTwo: 'KG',
    alphaThree: 'KGZ',
  },
  {
    alphaTwo: 'LA',
    alphaThree: 'LAO',
  },
  {
    alphaTwo: 'LV',
    alphaThree: 'LVA',
  },
  {
    alphaTwo: 'LB',
    alphaThree: 'LBN',
  },
  {
    alphaTwo: 'LS',
    alphaThree: 'LSO',
  },
  {
    alphaTwo: 'LR',
    alphaThree: 'LBR',
  },
  {
    alphaTwo: 'LY',
    alphaThree: 'LBY',
  },
  {
    alphaTwo: 'LI',
    alphaThree: 'LIE',
  },
  {
    alphaTwo: 'LT',
    alphaThree: 'LTU',
  },
  {
    alphaTwo: 'LU',
    alphaThree: 'LUX',
  },
  {
    alphaTwo: 'MO',
    alphaThree: 'MAC',
  },
  {
    alphaTwo: 'MG',
    alphaThree: 'MDG',
  },
  {
    alphaTwo: 'MW',
    alphaThree: 'MWI',
  },
  {
    alphaTwo: 'MY',
    alphaThree: 'MYS',
  },
  {
    alphaTwo: 'MV',
    alphaThree: 'MDV',
  },
  {
    alphaTwo: 'ML',
    alphaThree: 'MLI',
  },
  {
    alphaTwo: 'MT',
    alphaThree: 'MLT',
  },
  {
    alphaTwo: 'MH',
    alphaThree: 'MHL',
  },
  {
    alphaTwo: 'MQ',
    alphaThree: 'MTQ',
  },
  {
    alphaTwo: 'MR',
    alphaThree: 'MRT',
  },
  {
    alphaTwo: 'MU',
    alphaThree: 'MUS',
  },
  {
    alphaTwo: 'YT',
    alphaThree: 'MYT',
  },
  {
    alphaTwo: 'MX',
    alphaThree: 'MEX',
  },
  {
    alphaTwo: 'FM',
    alphaThree: 'FSM',
  },
  {
    alphaTwo: 'MD',
    alphaThree: 'MDA',
  },
  {
    alphaTwo: 'MC',
    alphaThree: 'MCO',
  },
  {
    alphaTwo: 'MN',
    alphaThree: 'MNG',
  },
  {
    alphaTwo: 'ME',
    alphaThree: 'MNE',
  },
  {
    alphaTwo: 'MS',
    alphaThree: 'MSR',
  },
  {
    alphaTwo: 'MA',
    alphaThree: 'MAR',
  },
  {
    alphaTwo: 'MZ',
    alphaThree: 'MOZ',
  },
  {
    alphaTwo: 'MM',
    alphaThree: 'MMR',
  },
  {
    alphaTwo: 'NA',
    alphaThree: 'NAM',
  },
  {
    alphaTwo: 'NR',
    alphaThree: 'NRU',
  },
  {
    alphaTwo: 'NP',
    alphaThree: 'NPL',
  },
  {
    alphaTwo: 'NL',
    alphaThree: 'NLD',
  },
  {
    alphaTwo: 'NC',
    alphaThree: 'NCL',
  },
  {
    alphaTwo: 'NZ',
    alphaThree: 'NZL',
  },
  {
    alphaTwo: 'NI',
    alphaThree: 'NIC',
  },
  {
    alphaTwo: 'NE',
    alphaThree: 'NER',
  },
  {
    alphaTwo: 'NG',
    alphaThree: 'NGA',
  },
  {
    alphaTwo: 'NU',
    alphaThree: 'NIU',
  },
  {
    alphaTwo: 'NF',
    alphaThree: 'NFK',
  },
  {
    alphaTwo: 'MK',
    alphaThree: 'MKD',
  },
  {
    alphaTwo: 'MP',
    alphaThree: 'MNP',
  },
  {
    alphaTwo: 'NO',
    alphaThree: 'NOR',
  },
  {
    alphaTwo: 'OM',
    alphaThree: 'OMN',
  },
  {
    alphaTwo: 'PK',
    alphaThree: 'PAK',
  },
  {
    alphaTwo: 'PW',
    alphaThree: 'PLW',
  },
  {
    alphaTwo: 'PS',
    alphaThree: 'PSE',
  },
  {
    alphaTwo: 'PA',
    alphaThree: 'PAN',
  },
  {
    alphaTwo: 'PG',
    alphaThree: 'PNG',
  },
  {
    alphaTwo: 'PY',
    alphaThree: 'PRY',
  },
  {
    alphaTwo: 'PE',
    alphaThree: 'PER',
  },
  {
    alphaTwo: 'PH',
    alphaThree: 'PHL',
  },
  {
    alphaTwo: 'PN',
    alphaThree: 'PCN',
  },
  {
    alphaTwo: 'PL',
    alphaThree: 'POL',
  },
  {
    alphaTwo: 'PT',
    alphaThree: 'PRT',
  },
  {
    alphaTwo: 'PR',
    alphaThree: 'PRI',
  },
  {
    alphaTwo: 'QA',
    alphaThree: 'QAT',
  },
  {
    alphaTwo: 'RO',
    alphaThree: 'ROU',
  },
  {
    alphaTwo: 'RU',
    alphaThree: 'RUS',
  },
  {
    alphaTwo: 'RW',
    alphaThree: 'RWA',
  },
  {
    alphaTwo: 'RE',
    alphaThree: 'REU',
  },
  {
    alphaTwo: 'BL',
    alphaThree: 'BLM',
  },
  {
    alphaTwo: 'SH',
    alphaThree: 'SHN',
  },
  {
    alphaTwo: 'KN',
    alphaThree: 'KNA',
  },
  {
    alphaTwo: 'LC',
    alphaThree: 'LCA',
  },
  {
    alphaTwo: 'MF',
    alphaThree: 'MAF',
  },
  {
    alphaTwo: 'PM',
    alphaThree: 'SPM',
  },
  {
    alphaTwo: 'VC',
    alphaThree: 'VCT',
  },
  {
    alphaTwo: 'WS',
    alphaThree: 'WSM',
  },
  {
    alphaTwo: 'SM',
    alphaThree: 'SMR',
  },
  {
    alphaTwo: 'ST',
    alphaThree: 'STP',
  },
  {
    alphaTwo: 'SA',
    alphaThree: 'SAU',
  },
  {
    alphaTwo: 'SN',
    alphaThree: 'SEN',
  },
  {
    alphaTwo: 'RS',
    alphaThree: 'SRB',
  },
  {
    alphaTwo: 'SC',
    alphaThree: 'SYC',
  },
  {
    alphaTwo: 'SL',
    alphaThree: 'SLE',
  },
  {
    alphaTwo: 'SG',
    alphaThree: 'SGP',
  },
  {
    alphaTwo: 'SX',
    alphaThree: 'SXM',
  },
  {
    alphaTwo: 'SK',
    alphaThree: 'SVK',
  },
  {
    alphaTwo: 'SI',
    alphaThree: 'SVN',
  },
  {
    alphaTwo: 'SB',
    alphaThree: 'SLB',
  },
  {
    alphaTwo: 'SO',
    alphaThree: 'SOM',
  },
  {
    alphaTwo: 'ZA',
    alphaThree: 'ZAF',
  },
  {
    alphaTwo: 'GS',
    alphaThree: 'SGS',
  },
  {
    alphaTwo: 'SS',
    alphaThree: 'SSD',
  },
  {
    alphaTwo: 'ES',
    alphaThree: 'ESP',
  },
  {
    alphaTwo: 'LK',
    alphaThree: 'LKA',
  },
  {
    alphaTwo: 'SD',
    alphaThree: 'SDN',
  },
  {
    alphaTwo: 'SR',
    alphaThree: 'SUR',
  },
  {
    alphaTwo: 'SJ',
    alphaThree: 'SJM',
  },
  {
    alphaTwo: 'SE',
    alphaThree: 'SWE',
  },
  {
    alphaTwo: 'CH',
    alphaThree: 'CHE',
  },
  {
    alphaTwo: 'SY',
    alphaThree: 'SYR',
  },
  {
    alphaTwo: 'TW',
    alphaThree: 'TWN',
  },
  {
    alphaTwo: 'TJ',
    alphaThree: 'TJK',
  },
  {
    alphaTwo: 'TZ',
    alphaThree: 'TZA',
  },
  {
    alphaTwo: 'TH',
    alphaThree: 'THA',
  },
  {
    alphaTwo: 'TL',
    alphaThree: 'TLS',
  },
  {
    alphaTwo: 'TG',
    alphaThree: 'TGO',
  },
  {
    alphaTwo: 'TK',
    alphaThree: 'TKL',
  },
  {
    alphaTwo: 'TO',
    alphaThree: 'TON',
  },
  {
    alphaTwo: 'TT',
    alphaThree: 'TTO',
  },
  {
    alphaTwo: 'TN',
    alphaThree: 'TUN',
  },
  {
    alphaTwo: 'TM',
    alphaThree: 'TKM',
  },
  {
    alphaTwo: 'TC',
    alphaThree: 'TCA',
  },
  {
    alphaTwo: 'TV',
    alphaThree: 'TUV',
  },
  {
    alphaTwo: 'TR',
    alphaThree: 'TUR',
  },
  {
    alphaTwo: 'UG',
    alphaThree: 'UGA',
  },
  {
    alphaTwo: 'UA',
    alphaThree: 'UKR',
  },
  {
    alphaTwo: 'AE',
    alphaThree: 'ARE',
  },
  {
    alphaTwo: 'GB',
    alphaThree: 'GBR',
  },
  {
    alphaTwo: 'UM',
    alphaThree: 'UMI',
  },
  {
    alphaTwo: 'US',
    alphaThree: 'USA',
  },
  {
    alphaTwo: 'UY',
    alphaThree: 'URY',
  },
  {
    alphaTwo: 'UZ',
    alphaThree: 'UZB',
  },
  {
    alphaTwo: 'VU',
    alphaThree: 'VUT',
  },
  {
    alphaTwo: 'VE',
    alphaThree: 'VEN',
  },
  {
    alphaTwo: 'VN',
    alphaThree: 'VNM',
  },
  {
    alphaTwo: 'VG',
    alphaThree: 'VGB',
  },
  {
    alphaTwo: 'VI',
    alphaThree: 'VIR',
  },
  {
    alphaTwo: 'WF',
    alphaThree: 'WLF',
  },
  {
    alphaTwo: 'EH',
    alphaThree: 'ESH',
  },
  {
    alphaTwo: 'YE',
    alphaThree: 'YEM',
  },
  {
    alphaTwo: 'ZM',
    alphaThree: 'ZMB',
  },
  {
    alphaTwo: 'ZW',
    alphaThree: 'ZWE',
  },
] as const;

/**
 * ISO3166 country code issue interface.
 */
export interface IsoCountryCodeIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'iso_country_code';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The validation function.
   */
  readonly requirement: (input: string) => boolean;
}

/**
 * ISO3166 country code action interface.
 */
export interface IsoCountryCodeAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsoCountryCodeIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsoCountryCodeIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'iso_country_code';
  /**
   * The action reference.
   */
  readonly reference: typeof isoCountryCode;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: (input: string) => boolean;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an [ISO3166](https://www.iso.org/iso-3166-country-codes.html) country code action.
 *
 * @returns An ISO3166 country code action.
 *
 * @beta
 */
export function isoCountryCode<TInput extends string>(): IsoCountryCodeAction<
  TInput,
  undefined
>;

/**
 * Creates an [ISO3166](https://www.iso.org/iso-3166-country-codes.html) country code action.
 *
 * @param message The error message.
 *
 * @returns An ISO3166 country code action.
 *
 * @beta
 */
export function isoCountryCode<
  TInput extends string,
  const TMessage extends ErrorMessage<IsoCountryCodeIssue<TInput>> | undefined,
>(message: TMessage): IsoCountryCodeAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isoCountryCode(
  message?: ErrorMessage<IsoCountryCodeIssue<string>>
): IsoCountryCodeAction<
  string,
  ErrorMessage<IsoCountryCodeIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'iso_country_code',
    reference: isoCountryCode,
    async: false,
    expects: null,
    requirement(input) {
      return ISO_3166_ENTRIES.some(
        (entry) => entry.alphaTwo === input || entry.alphaThree === input
      );
    },
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'iso_country_code', dataset, config);
      }
      return dataset;
    },
  };
}
