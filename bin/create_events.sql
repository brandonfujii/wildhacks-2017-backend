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
        (DEFAULT, "Dinner - Day 1", "day-1-dinner", "", now(), now()),
        (DEFAULT, "Breakfast - Day 2", "day-2-breakfast", "", now(), now()),
        (DEFAULT, "Lunch - Day 2", "day-2-lunch", "", now(), now()),
        (DEFAULT, "Dinner - Day 2", "day-2-dinner", "", now(), now());