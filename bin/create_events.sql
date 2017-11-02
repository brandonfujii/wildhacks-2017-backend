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
        (DEFAULT, "Day 1 Registration", "day-1-registration", "Friday 4:00PM at Ground floor ping-pong table", now(), now()),
        (DEFAULT, "Career Fair", "career-fair", "Friday 4:30 - 7:30PM at Norris 2nd Floor Hallway", now(), now()),
        (DEFAULT, "Day 1 Dinner", "day-1-dinner", "Friday 7:00PM at Ground floor", now(), now()),
        (DEFAULT, "Opening Ceremony", "opening-ceremony", "Friday 8:30PM at Tech Ryan Auditorium", now(), now()),
        (DEFAULT, "Day 1 Midnight Snack", "day-1-midnight-snack", "Friday 11:30PM at Ground Floor - Potbelly", now(), now()),
        (DEFAULT, "Beginner Workshop", "beginner-workshop", "Friday 10:30PM at Mccormick Auditorium", now(), now()),
        (DEFAULT, "Day 2 Breakfast", "day-2-breakfast", "Saturday 7:30AM at Ground Floor - Sodexo", now(), now()),
        (DEFAULT, "Gameroom", "gameroom", "Saturday 3:00PM at Norris Game Room", now(), now()),
        (DEFAULT, "Day 2 Lunch", "day-2-lunch", "Saturday 11:15AM at Ground floor - Potbelly", now(), now()),
        (DEFAULT, "Day 2 Dinner", "day-2-dinner", "Saturday 7:30PM at Ground floor - Sodexo", now(), now()),
        (DEFAULT, "Day 2 Midnight Snack", "day-2-midnight-snack", "Saturday 11:30PM at Ground Floor - Potbelly", now(), now()),
        (DEFAULT, "Cup stacking", "cup-stacking", "Sunday 8:00PM TBD", now(), now()),
        (DEFAULT, "Day 3 Brunch", "day-3-brunch", "Sunday 10:00AM at Ground floor - Sodexo", now(), now());