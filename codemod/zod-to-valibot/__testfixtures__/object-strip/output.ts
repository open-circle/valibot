import * as v from "valibot";

// passthrough
const Schema1 = v.object({key: v.string()});
const Schema2 = v.object({key: v.string()}, "some message");
const Schema3 = v.object(
  v.pipe(v.object({key: v.string()}), v.description("some description")).entries
);
const Schema4 = v.looseObject({key: v.string()});
const Schema5 = v.pipe(Schema4, v.strip());
const Schema6 = v.object({key: v.string()});
const Schema7 = v.object(
  /*@valibot-migrate we can't detect if Schema6 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema6.entries
);

// strict
const Schema8 = v.object({key: v.string()});
const Schema9 = v.object({key: v.string()}, "some message");
const Schema10 = v.object(
  v.pipe(v.object({key: v.string()}), v.description("some description")).entries
);
const Schema11 = v.strictObject({key: v.string()});
const Schema12 = v.pipe(Schema11, v.strip());
const Schema13 = v.object({key: v.string()});
const Schema14 = v.object(
  /*@valibot-migrate we can't detect if Schema13 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema13.entries
);