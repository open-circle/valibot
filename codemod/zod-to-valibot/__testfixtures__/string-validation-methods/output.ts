import * as v from "valibot";

const EmailSchema = v.pipe(v.string(), v.email());
const UrlSchema = v.pipe(v.string(), v.url());
const EmojiSchema = v.pipe(v.string(), v.emoji());
const UUIDSchema = v.pipe(v.string(), v.uuid());
const NanoIDSchema = v.pipe(v.string(), v.nanoid());
const CUID2Schema = v.pipe(v.string(), v.cuid2());
const ULIDSchema = v.pipe(v.string(), v.ulid());
const Base64Schema = v.pipe(v.string(), v.base64());
const IpSchema = v.pipe(v.string(), v.ip());
const IpV4Schema = v.pipe(v.string(), v.ipv4());
const IpV6Schema = v.pipe(v.string(), v.ipv6());
const DateSchema = v.pipe(v.string(), v.isoDate());
const RegexSchema = v.pipe(v.string(), v.regex(/valibot/iu));
const StartsWithSchema = v.pipe(v.string(), v.startsWith("foo"));
const EndsWithSchema = v.pipe(v.string(), v.endsWith("bar"));
const MinLengthSchema = v.pipe(v.string(), v.minLength(5));
const MaxLengthSchema = v.pipe(v.string(), v.maxLength(10));
const LengthSchema = v.pipe(v.string(), v.length(12));
const NonEmptySchema = v.pipe(v.string(), v.nonEmpty());
const TrimSchema = v.pipe(v.string(), v.trim());
const ToLowerSchema = v.pipe(v.string(), v.toLowerCase());
const ToUpperSchema = v.pipe(v.string(), v.toUpperCase());
const IncludesSchema = v.pipe(v.string(), v.includes("foo"));
// `position` is not supported by Valibot
const IncludesWithPositionSchema = v.pipe(v.string(), v.includes("bar"));
const TimeSchema = v.pipe(v.string(), v.isoTimeSecond());
// `precision` is not supported by Valibot
const TimeWithPrecisionSchema = v.pipe(v.string(), v.isoTimeSecond());
const DateTimeSchema = v.pipe(v.string(), v.isoTimestamp());
// none of the customizations are supported by Valibot
const DateTimeWithCustomizatonsSchema = v.pipe(v.string(), v.isoTimestamp());
// validators that are not supported by Valibot
const CUIDSchema = v.pipe(v.string(), v.cuid());
const Base64UrlSchema = v.pipe(v.string(), v.base64url());
const JWTSchema = v.pipe(v.string(), v.jwt());
const CIDRSchema = v.pipe(v.string(), v.cidr());
const DurationSchema = v.pipe(v.string(), v.duration());