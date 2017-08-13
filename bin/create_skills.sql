CREATE TABLE IF NOT EXISTS `skills` (
    `id` INTEGER NOT NULL auto_increment,
    `name` VARCHAR(255) NOT NULL,
    `meta_value` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE (`meta_value`)
);

INSERT INTO `skills`
    (`id`, `name`, `meta_value`, `created_at`, `updated_at`) 
    VALUES 
        (DEFAULT, "iOS Development", "ios", now(), now()),
        (DEFAULT, "Android Development", "android", now(), now()),
        (DEFAULT, "Web Development", "web", now(), now()),
        (DEFAULT, "Computer networking", "networking", now(), now()),
        (DEFAULT, "Data Science", "data-sci", now(), now()),
        (DEFAULT, "Embedded Systems", "embedded-systems", now(), now());