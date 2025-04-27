import { pgTable, foreignKey, serial, integer, text, timestamp, unique, boolean, uniqueIndex, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const questions = pgTable("questions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	question: text().notNull(),
	answer: text().notNull(),
	imageUrl: text("image_url"),
	audioUrl: text("audio_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	guestId: text("guest_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "questions_user_id_users_id_fk"
		}),
]);

export const badges = pgTable("badges", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	imageUrl: text("image_url").notNull(),
	category: text().notNull(),
	rarity: text().default('common').notNull(),
	unlockCriteria: text("unlock_criteria").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("badges_name_unique").on(table.name),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text(),
	firebaseId: text("firebase_id"),
	email: text(),
	displayName: text("display_name"),
	photoUrl: text("photo_url"),
	isGuest: boolean("is_guest").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_firebase_id_unique").on(table.firebaseId),
]);

export const achievements = pgTable("achievements", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: text().notNull(),
	type: text().notNull(),
	progress: integer().default(0).notNull(),
	goal: integer().notNull(),
	completed: boolean().default(false).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "achievements_user_id_users_id_fk"
		}),
]);

export const userBadges = pgTable("user_badges", {
	userId: integer("user_id").notNull(),
	badgeId: integer("badge_id").notNull(),
	earnedAt: timestamp("earned_at", { mode: 'string' }).defaultNow().notNull(),
	displayOrder: integer("display_order").default(0),
	favorite: boolean().default(false),
}, (table) => [
	uniqueIndex("user_badge_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.badgeId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_badges_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.badgeId],
			foreignColumns: [badges.id],
			name: "user_badges_badge_id_badges_id_fk"
		}),
	primaryKey({ columns: [table.userId, table.badgeId], name: "user_badges_user_id_badge_id_pk"}),
]);
