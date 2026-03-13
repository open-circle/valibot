import { z } from "zod";

const EmailSchema = z.string().email();
const UrlSchema = z.string().url();
const EmojiSchema = z.string().emoji();
const UUIDSchema = z.string().uuid();
const NanoIDSchema = z.string().nanoid();
const CUID2Schema = z.string().cuid2();
const ULIDSchema = z.string().ulid();
const Base64Schema = z.string().base64();
const IpSchema = z.string().ip();
const IpV4Schema = z.string().ip({ version: "v4" });
const IpV6Schema = z.string().ip({ version: "v6" });
const DateSchema = z.string().date();
const RegexSchema = z.string().regex(/valibot/iu);
const StartsWithSchema = z.string().startsWith("foo");
const EndsWithSchema = z.string().endsWith("bar");
const MinLengthSchema = z.string().min(5);
const MaxLengthSchema = z.string().max(10);
const LengthSchema = z.string().length(12);
const NonEmptySchema = z.string().nonempty();
const TrimSchema = z.string().trim();
const ToLowerSchema = z.string().toLowerCase();
const ToUpperSchema = z.string().toUpperCase();
const IncludesSchema = z.string().includes("foo");
// `position` is not supported by Valibot
const IncludesWithPositionSchema = z.string().includes("bar", { position: 1 });
const TimeSchema = z.string().time();
// `precision` is not supported by Valibot
const TimeWithPrecisionSchema = z.string().time({ precision: 3 });
const DateTimeSchema = z.string().datetime();
// none of the customizations are supported by Valibot
const DateTimeWithCustomizatonsSchema = z.string().datetime({ offset: true, local: false, precision: 2 });
// validators that are not supported by Valibot
const CUIDSchema = z.string().cuid();
const Base64UrlSchema = z.string().base64url();
const JWTSchema = z.string().jwt();
const CIDRSchema = z.string().cidr();
const DurationSchema = z.string().duration();