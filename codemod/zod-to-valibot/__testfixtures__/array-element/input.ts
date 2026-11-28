import { z } from "zod";

const Schema1 = z.array(z.string());
const Schema2 = Schema1.element;
const Schema3 = z.array(z.number()).element;
const Schema4 = Schema1.element.trim().email();
const Schema5 = z.array(z.string()).element.trim().email();
const Schema6 = z.number().array().element.min(2);
const Schema7 = z.number().array();
const Schema8 = Schema7.element.max(3);
const Schema9 = Schema7.min(1);