import * as v from "valibot";

// ------------ single ------------
// invalid_type_error
const Schema1 = v.string("must be a string");
const Schema2 = v.literal("valibot", 'must be "valibot"');
// message
const Schema3 = v.string("must be a string");
const Schema4 = v.literal("foo", 'must be "foo"');
// required_error
const Schema5 = v.string(issue => issue.input === undefined ? "is required" : issue.message);
const Schema6 = v.literal(
  "bar",
  issue => issue.input === undefined ? '"bar" is required' : issue.message
);
// description
const Schema7 = v.pipe(v.string(), v.description("some description"));
const schema7Description = v.getDescription(Schema7);
const Schema8 = v.pipe(v.literal("hello"), v.description('some description (literal "hello")'));
const schema8Description = v.getDescription(Schema8);
// coerce
const Schema9 = v.pipe(v.unknown(), v.transform(String), v.string());
const Schema10 = v.string();
// errorMap - supported by Valibot but incompatible
const Schema11 = v.string();
const Schema12 = v.literal("world");

// ------------ multiple ------------
// invalid_type_error + required_error
const Schema13 = v.string(issue => issue.input === undefined ? "is required" : "must be a string");
const Schema14 = v.literal(
  "bot",
  issue => issue.input === undefined ? '"bot" is required' : 'must be "bot"'
);
// invalid_type_error + message
const Schema15 = v.string("must be a string (msg)");
const Schema16 = v.literal("bot", 'must be "bot" (msg)');
// required_error + message
const Schema17 = v.string("must be a string (msg)");
const Schema18 = v.literal("bot", 'must be "bot" (msg)');
// invalid_type_error + required_error + message
const Schema19 = v.string("must be a string (msg)");
const Schema20 = v.literal("bot", 'must be "bot" (msg)');
// coerce + invalid_type_error
const Schema21 = v.pipe(v.unknown(), v.transform(String), v.string("must be a string"));
const Schema22 = v.string("must be a string");
// coerce + description
const Schema23 = v.pipe(
  v.unknown(),
  v.transform(String),
  v.string(),
  v.description("some description")
);
const schema23Description = v.getDescription(Schema23);
const Schema24 = v.pipe(v.string(), v.description("some description"));
const schema24Description = v.getDescription(Schema24);
// coerce + invalid_type_error + description
const Schema25 = v.pipe(
  v.unknown(),
  v.transform(String),
  v.string("must be a string"),
  v.description("some description")
);
const schema25Description = v.getDescription(Schema25);
const Schema26 = v.pipe(v.string("must be a string"), v.description("some description"));
const schema26Description = v.getDescription(Schema26);