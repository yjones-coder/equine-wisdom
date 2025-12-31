CREATE TABLE `careLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`horseId` int NOT NULL,
	`userId` int NOT NULL,
	`careType` enum('feeding','grooming','exercise','veterinary','farrier','medication','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`cost` int,
	`nextDueDate` timestamp,
	`reminderSet` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `careLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `horses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stableId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`breedId` int,
	`matchedBreedId` int,
	`matchConfidence` int,
	`identificationDescription` text,
	`age` int,
	`gender` enum('mare','stallion','gelding','colt','filly','unknown') DEFAULT 'unknown',
	`color` varchar(100),
	`markings` text,
	`height` int,
	`weight` int,
	`notes` text,
	`specialNeeds` text,
	`feedingSchedule` text,
	`veterinarian` varchar(255),
	`farrier` varchar(255),
	`photoUrls` json,
	`profilePhotoUrl` text,
	`dateOfBirth` timestamp,
	`dateAcquired` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `horses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`breedId` int,
	`category` varchar(50),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletterSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedBreeds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`breedId` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedBreeds_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_breed` UNIQUE(`userId`,`breedId`)
);
--> statement-breakpoint
CREATE TABLE `searchHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`searchType` enum('breed_search','identification','browse') NOT NULL,
	`query` varchar(500),
	`category` varchar(50),
	`filters` json,
	`resultsCount` int,
	`selectedBreedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `searchHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`capacity` int DEFAULT 10,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stables_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_stable_name` UNIQUE(`userId`,`name`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` boolean DEFAULT true,
	`newsletterFrequency` enum('daily','weekly','monthly','never') DEFAULT 'weekly',
	`careReminders` boolean DEFAULT true,
	`newsAlerts` boolean DEFAULT true,
	`favoriteCategories` json,
	`experienceLevel` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`theme` enum('light','dark','system') DEFAULT 'system',
	`measurementUnit` enum('imperial','metric') DEFAULT 'imperial',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `careLogs` ADD CONSTRAINT `careLogs_horseId_horses_id_fk` FOREIGN KEY (`horseId`) REFERENCES `horses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careLogs` ADD CONSTRAINT `careLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `horses` ADD CONSTRAINT `horses_stableId_stables_id_fk` FOREIGN KEY (`stableId`) REFERENCES `stables`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `horses` ADD CONSTRAINT `horses_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `horses` ADD CONSTRAINT `horses_breedId_breeds_id_fk` FOREIGN KEY (`breedId`) REFERENCES `breeds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `horses` ADD CONSTRAINT `horses_matchedBreedId_breeds_id_fk` FOREIGN KEY (`matchedBreedId`) REFERENCES `breeds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newsletterSubscriptions` ADD CONSTRAINT `newsletterSubscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newsletterSubscriptions` ADD CONSTRAINT `newsletterSubscriptions_breedId_breeds_id_fk` FOREIGN KEY (`breedId`) REFERENCES `breeds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `savedBreeds` ADD CONSTRAINT `savedBreeds_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `savedBreeds` ADD CONSTRAINT `savedBreeds_breedId_breeds_id_fk` FOREIGN KEY (`breedId`) REFERENCES `breeds`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `searchHistory` ADD CONSTRAINT `searchHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `searchHistory` ADD CONSTRAINT `searchHistory_selectedBreedId_breeds_id_fk` FOREIGN KEY (`selectedBreedId`) REFERENCES `breeds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stables` ADD CONSTRAINT `stables_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userPreferences` ADD CONSTRAINT `userPreferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `careLogs_horseId_idx` ON `careLogs` (`horseId`);--> statement-breakpoint
CREATE INDEX `careLogs_userId_idx` ON `careLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `careLogs_date_idx` ON `careLogs` (`date`);--> statement-breakpoint
CREATE INDEX `horses_userId_idx` ON `horses` (`userId`);--> statement-breakpoint
CREATE INDEX `horses_stableId_idx` ON `horses` (`stableId`);--> statement-breakpoint
CREATE INDEX `horses_breedId_idx` ON `horses` (`breedId`);--> statement-breakpoint
CREATE INDEX `newsletterSubs_userId_idx` ON `newsletterSubscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `savedBreeds_userId_idx` ON `savedBreeds` (`userId`);--> statement-breakpoint
CREATE INDEX `searchHistory_userId_createdAt_idx` ON `searchHistory` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `stables_userId_idx` ON `stables` (`userId`);