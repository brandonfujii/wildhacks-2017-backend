CREATE TABLE IF NOT EXISTS `events` (
    `id` INTEGER NOT NULL auto_increment,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255),
    `meta_value` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE (`meta_value`)
);

INSERT INTO `events`
    (`id`, `name`, `meta_value`, `description`, `created_at`, `updated_at`) 
    VALUES 
        (DEFAULT, "Day 1 Registration", "day-1-registration", "", now(), now()),
        (DEFAULT, "Career Fair", "career-fair", "", now(), now()),
        (DEFAULT, "Day 1 Dinner", "day-1-dinner", "", now(), now()),
        (DEFAULT, "Day 1 Midnight Snack", "day-1-midnight-snack", "", now(), now(),
        (DEFAULT, "Beginner Workshop", "beginner-workshop", "", now(), now(),
        (DEFAULT, "Day 2 Breakfast", "day-2-breakfast", "", now(), now(),
        (DEFAULT, "Gameroom", "gameroom", "", now(), now(),
        (DEFAULT, "Day 2 Dinner", "day-2-dinner", "", now(), now(),
        (DEFAULT, "Day 2 Midnight Snack", "day-2-midnight-snack", "", now(), now(),
        (DEFAULT, "Cup stacking", "cup-stacking", "", now(), now(),
        (DEFAULT, "Day 3 Brunch", "day-3-brunch", "", now(), now());