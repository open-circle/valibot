import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * ISO 4217 currency codes.
 * six-group is linked from www.iso.org as 'ISO 4217 codes in XLS and XML form'
 *
 * @see https://www.iso.org/iso-4217-currency-codes.html
 * @see https://www.six-group.com/en/products-services/financial-information/market-reference-data/data-standards.html
 */
const ISO_4217_CURRENCY_CODES = [
  'AED',
  'AFN',
  'ALL',
  'AMD',
  'AOA',
  'ARS',
  'AUD',
  'AWG',
  'AZN',
  'BAM',
  'BBD',
  'BDT',
  'BGN',
  'BHD',
  'BIF',
  'BMD',
  'BND',
  'BOB',
  'BOV',
  'BRL',
  'BSD',
  'BTN',
  'BWP',
  'BYN',
  'BZD',
  'CAD',
  'CDF',
  'CHE',
  'CHF',
  'CHW',
  'CLF',
  'CLP',
  'CNY',
  'COP',
  'COU',
  'CRC',
  'CUP',
  'CVE',
  'CZK',
  'DJF',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ERN',
  'ETB',
  'EUR',
  'FJD',
  'FKP',
  'GBP',
  'GEL',
  'GHS',
  'GIP',
  'GMD',
  'GNF',
  'GTQ',
  'GYD',
  'HKD',
  'HNL',
  'HTG',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'IQD',
  'IRR',
  'ISK',
  'JMD',
  'JOD',
  'JPY',
  'KES',
  'KGS',
  'KHR',
  'KMF',
  'KPW',
  'KRW',
  'KWD',
  'KYD',
  'KZT',
  'LAK',
  'LBP',
  'LKR',
  'LRD',
  'LSL',
  'LYD',
  'MAD',
  'MDL',
  'MGA',
  'MKD',
  'MMK',
  'MNT',
  'MOP',
  'MRU',
  'MUR',
  'MVR',
  'MWK',
  'MXN',
  'MXV',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SBD',
  'SCR',
  'SDG',
  'SEK',
  'SGD',
  'SHP',
  'SLE',
  'SOS',
  'SRD',
  'SSP',
  'STN',
  'SVC',
  'SYP',
  'SZL',
  'THB',
  'TJS',
  'TMT',
  'TND',
  'TOP',
  'TRY',
  'TTD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'USD',
  'USN',
  'UYI',
  'UYU',
  'UYW',
  'UZS',
  'VED',
  'VES',
  'VND',
  'VUV',
  'WST',
  'XAF',
  'XAG',
  'XAU',
  'XBA',
  'XBB',
  'XBC',
  'XBD',
  'XCD',
  'XCG',
  'XDR',
  'XOF',
  'XPD',
  'XPF',
  'XPT',
  'XSU',
  'XTS',
  'XUA',
  'XXX',
  'YER',
  'ZAR',
  'ZMW',
  'ZWG',
] as const;

/**
 * ISO 4217 currency code issue interface.
 */
export interface IsoCurrencyCodeIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'iso_currency_code';
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
 * ISO 4217 currency code action interface.
 */
export interface IsoCurrencyCodeAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsoCurrencyCodeIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsoCurrencyCodeIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'iso_currency_code';
  /**
   * The action reference.
   */
  readonly reference: typeof isoCurrencyCode;
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
 * Creates an [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code action.
 *
 * @returns An ISO 4217 currency code action.
 *
 * @beta
 */
export function isoCurrencyCode<TInput extends string>(): IsoCurrencyCodeAction<
  TInput,
  undefined
>;

/**
 * Creates an [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code action.
 *
 * @param message The error message.
 *
 * @returns An ISO 4217 currency code action.
 *
 * @beta
 */
export function isoCurrencyCode<
  TInput extends string,
  const TMessage extends ErrorMessage<IsoCurrencyCodeIssue<TInput>> | undefined,
>(message: TMessage): IsoCurrencyCodeAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isoCurrencyCode(
  message?: ErrorMessage<IsoCurrencyCodeIssue<string>>
): IsoCurrencyCodeAction<
  string,
  ErrorMessage<IsoCurrencyCodeIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'iso_currency_code',
    reference: isoCurrencyCode,
    async: false,
    expects: null,
    requirement(input) {
      return ISO_4217_CURRENCY_CODES.includes(
        input as (typeof ISO_4217_CURRENCY_CODES)[number]
      );
    },
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'iso_currency_code', dataset, config);
      }
      return dataset;
    },
  };
}
