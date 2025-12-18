CREATE TABLE `breeds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`category` enum('light','draft','pony','gaited','warmblood') NOT NULL,
	`heightMin` int,
	`heightMax` int,
	`weightMin` int,
	`weightMax` int,
	`colors` json,
	`distinctiveFeatures` text,
	`overview` text NOT NULL,
	`physicalDescription` text,
	`temperament` text,
	`history` text,
	`uses` text,
	`careRequirements` text,
	`healthConsiderations` text,
	`feedingNotes` text,
	`lifespan` varchar(50),
	`origin` varchar(100),
	`popularity` enum('common','moderate','rare') DEFAULT 'moderate',
	`keywords` json,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `breeds_id` PRIMARY KEY(`id`),
	CONSTRAINT `breeds_name_unique` UNIQUE(`name`),
	CONSTRAINT `breeds_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `horseFacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`category` enum('general','health','behavior','nutrition','training','history','care') NOT NULL,
	`audienceLevel` enum('beginner','intermediate','advanced','all') NOT NULL DEFAULT 'all',
	`source` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `horseFacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `identificationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`description` text NOT NULL,
	`matchedBreeds` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `identificationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `identificationHistory` ADD CONSTRAINT `identificationHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;