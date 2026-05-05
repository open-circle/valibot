import { z } from "zod";

const Schema1 = z.set(z.string()).nonempty();
const Schema2 = z.set(z.string()).nonempty("some message");
const Schema3 = z.set(z.string()).nonempty({message: "some message"});
const Schema4 = z.set(z.string()).min(5);
const Schema5 = z.set(z.string()).min(5, "some message");
const Schema6 = z.set(z.string()).min(5, {message: "some message"});
const Schema7 = z.set(z.string()).max(6);
const Schema8 = z.set(z.string()).max(6, "some message");
const Schema9 = z.set(z.string()).max(6, {message: "some message"});
const Schema10 = z.set(z.string()).size(7);
const Schema11 = z.set(z.string()).size(7, "some message");
const Schema12 = z.set(z.string()).size(7, {message: "some message"});