import { relations } from "drizzle-orm/relations";
import { users, questions, achievements, userBadges, badges } from "./schema";

export const questionsRelations = relations(questions, ({one}) => ({
	user: one(users, {
		fields: [questions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	questions: many(questions),
	achievements: many(achievements),
	userBadges: many(userBadges),
}));

export const achievementsRelations = relations(achievements, ({one}) => ({
	user: one(users, {
		fields: [achievements.userId],
		references: [users.id]
	}),
}));

export const userBadgesRelations = relations(userBadges, ({one}) => ({
	user: one(users, {
		fields: [userBadges.userId],
		references: [users.id]
	}),
	badge: one(badges, {
		fields: [userBadges.badgeId],
		references: [badges.id]
	}),
}));

export const badgesRelations = relations(badges, ({many}) => ({
	userBadges: many(userBadges),
}));