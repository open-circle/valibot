/**
 * [Base64](https://en.wikipedia.org/wiki/Base64) regex.
 */
export const BASE64_REGEX: RegExp =
  /^(?:[\da-z+/]{4})*(?:[\da-z+/]{2}==|[\da-z+/]{3}=)?$/iu;

/**
 * [BIC](https://en.wikipedia.org/wiki/ISO_9362) regex.
 */
export const BIC_REGEX: RegExp = /^[A-Z]{6}(?!00)[\dA-Z]{2}(?:[\dA-Z]{3})?$/u;

/**
 * [Cuid2](https://github.com/paralleldrive/cuid2) regex.
 */
export const CUID2_REGEX: RegExp = /^[a-z][\da-z]*$/u;

/**
 * [Decimal](https://en.wikipedia.org/wiki/Decimal) regex.
 */
// eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive
export const DECIMAL_REGEX: RegExp = /^[+-]?(?:\d*\.)?\d+$/u;

/**
 * [Digits](https://en.wikipedia.org/wiki/Numerical_digit) regex.
 */
export const DIGITS_REGEX: RegExp = /^\d+$/u;

/**
 * [Domain name](https://en.wikipedia.org/wiki/Domain_name) regex.
 *
 * Hint: Hint: ASCII-only validation. 
 * Internationalized domain names (IDN) not supported (including their Punycode form).
 */
export const DOMAIN_REGEX: RegExp =
  // eslint-disable-next-line regexp/require-unicode-regexp
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/**
 * [Email address](https://en.wikipedia.org/wiki/Email_address) regex.
 */
export const EMAIL_REGEX: RegExp =
  /^[\w+-]+(?:\.[\w+-]+)*@[\da-z]+(?:[.-][\da-z]+)*\.[a-z]{2,}$/iu;

/**
 * Emoji regex from [emoji-regex-xs](https://github.com/slevithan/emoji-regex-xs) v1.0.0 (MIT license).
 *
 * Hint: We decided against the newer `/^\p{RGI_Emoji}+$/v` regex because it is
 * not supported in older runtimes and does not match all emoji.
 */
export const EMOJI_REGEX: RegExp =
  // eslint-disable-next-line redos-detector/no-unsafe-regex, regexp/no-dupe-disjunctions -- false positives
  /^(?:[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{2}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{1,3}\u{E007F}|(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})(?:\u200D(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}))*)+$/u;

/**
 * [Hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal) regex.
 *
 * Hint: We decided against the `i` flag for better JSON Schema compatibility.
 */
export const HEXADECIMAL_REGEX: RegExp = /^(?:0[hx])?[\da-fA-F]+$/u;

/**
 * [Hex color](https://en.wikipedia.org/wiki/Web_colors#Hex_triplet) regex.
 *
 * Hint: We decided against the `i` flag for better JSON Schema compatibility.
 */
export const HEX_COLOR_REGEX: RegExp =
  /^#(?:[\da-fA-F]{3,4}|[\da-fA-F]{6}|[\da-fA-F]{8})$/u;

/**
 * [IMEI](https://en.wikipedia.org/wiki/International_Mobile_Equipment_Identity) regex.
 */
export const IMEI_REGEX: RegExp = /^\d{15}$|^\d{2}-\d{6}-\d{6}-\d$/u;

/**
 * [IPv4](https://en.wikipedia.org/wiki/IPv4) regex.
 */
export const IPV4_REGEX: RegExp =
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive
  /^(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])(?:\.(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])){3}$/u;

/**
 * [IPv6](https://en.wikipedia.org/wiki/IPv6) regex.
 */
export const IPV6_REGEX: RegExp =
  /^(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?::[\da-f]{1,4}){1,6}|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:f{4}(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))$/iu;

/**
 * [IP](https://en.wikipedia.org/wiki/IP_address) regex.
 */
export const IP_REGEX: RegExp =
  /^(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])(?:\.(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])){3}$|^(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?::[\da-f]{1,4}){1,6}|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:f{4}(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))$/iu;

/**
 * [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date regex.
 */
export const ISO_DATE_REGEX: RegExp =
  /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])$/u;

/**
 * [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date-time regex.
 */
export const ISO_DATE_TIME_REGEX: RegExp =
  /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])[T ](?:0\d|1\d|2[0-3]):[0-5]\d$/u;

/**
 * [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) time regex.
 */
export const ISO_TIME_REGEX: RegExp = /^(?:0\d|1\d|2[0-3]):[0-5]\d$/u;

/**
 * [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) time with seconds regex.
 */
export const ISO_TIME_SECOND_REGEX: RegExp =
  /^(?:0\d|1\d|2[0-3])(?::[0-5]\d){2}$/u;

/**
 * [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp regex.
 */
export const ISO_TIMESTAMP_REGEX: RegExp =
  /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])[T ](?:0\d|1\d|2[0-3])(?::[0-5]\d){2}(?:\.\d{1,9})?(?:Z|[+-](?:0\d|1\d|2[0-3])(?::?[0-5]\d)?)$/u;

/**
 * [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) week regex.
 */
export const ISO_WEEK_REGEX: RegExp = /^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/u;

/**
 * [MAC](https://en.wikipedia.org/wiki/MAC_address) 48 bit regex.
 */
export const MAC48_REGEX: RegExp =
  /^(?:[\da-f]{2}:){5}[\da-f]{2}$|^(?:[\da-f]{2}-){5}[\da-f]{2}$|^(?:[\da-f]{4}\.){2}[\da-f]{4}$/iu;

/**
 * [MAC](https://en.wikipedia.org/wiki/MAC_address) 64 bit regex.
 */
export const MAC64_REGEX: RegExp =
  /^(?:[\da-f]{2}:){7}[\da-f]{2}$|^(?:[\da-f]{2}-){7}[\da-f]{2}$|^(?:[\da-f]{4}\.){3}[\da-f]{4}$|^(?:[\da-f]{4}:){3}[\da-f]{4}$/iu;

/**
 * [MAC](https://en.wikipedia.org/wiki/MAC_address) regex.
 */
export const MAC_REGEX: RegExp =
  /^(?:[\da-f]{2}:){5}[\da-f]{2}$|^(?:[\da-f]{2}-){5}[\da-f]{2}$|^(?:[\da-f]{4}\.){2}[\da-f]{4}$|^(?:[\da-f]{2}:){7}[\da-f]{2}$|^(?:[\da-f]{2}-){7}[\da-f]{2}$|^(?:[\da-f]{4}\.){3}[\da-f]{4}$|^(?:[\da-f]{4}:){3}[\da-f]{4}$/iu;

/**
 * [Nano ID](https://github.com/ai/nanoid) regex.
 */
export const NANO_ID_REGEX: RegExp = /^[\w-]+$/u;

/**
 * [Octal](https://en.wikipedia.org/wiki/Octal) regex.
 */
export const OCTAL_REGEX: RegExp = /^(?:0o)?[0-7]+$/u;

/**
 * [RFC 5322 email address](https://datatracker.ietf.org/doc/html/rfc5322#section-3.4.1) regex.
 *
 * Hint: This regex was taken from the [HTML Living Standard Specification](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address) and does not perfectly represent RFC 5322.
 */
export const RFC_EMAIL_REGEX: RegExp =
  // eslint-disable-next-line regexp/prefer-w, no-useless-escape, regexp/no-useless-escape, regexp/require-unicode-regexp
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * [Slug](https://en.wikipedia.org/wiki/Clean_URL#Slug) regex.
 */
export const SLUG_REGEX: RegExp = /^[\da-z]+(?:[-_][\da-z]+)*$/u;

/**
 * [ULID](https://github.com/ulid/spec) regex.
 *
 * Hint: We decided against the `i` flag for better JSON Schema compatibility.
 */
export const ULID_REGEX: RegExp = /^[\da-hjkmnp-tv-zA-HJKMNP-TV-Z]{26}$/u;

/**
 * [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) regex.
 */
export const UUID_REGEX: RegExp =
  /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/iu;
