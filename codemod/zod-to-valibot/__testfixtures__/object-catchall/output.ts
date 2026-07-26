import * as v from "valibot";

const Schema1 = v.objectWithRest({key: v.string()}, v.null());
const Schema2 = v.objectWithRest({key: v.string()}, v.null(), "some message");
const Schema3 = v.pipe(
  v.object({key: v.string()}),
  v.description("some description"),
  v.catchall(v.null())
);
const Schema4 = v.object({key: v.string()});
const Schema5 = v.pipe(Schema4, v.catchall(v.null()));