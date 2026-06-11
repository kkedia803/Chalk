import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer
} from "drizzle-orm/pg-core";

export const Jobs = pgTable("jobs",{
    id: uuid().primaryKey(),
    language: text().notNull(),
    code: text().notNull(),
    status: text().notNull(),
    output: text(),
    error: text(),
    runtime: integer("runtime"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
});