-- CreateTable
CREATE TABLE `users` (
    `user_id` VARCHAR(45) NOT NULL,
    `name` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `profile_picture` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_credentials` (
    `user_id` VARCHAR(45) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rooms` (
    `room_id` VARCHAR(45) NOT NULL,
    `name` VARCHAR(45) NOT NULL,
    `type` ENUM('dm', 'room') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`room_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_memberships` (
    `user_id` VARCHAR(45) NOT NULL,
    `room_id` VARCHAR(45) NOT NULL,
    `membership_type` ENUM('admin', 'member') NOT NULL DEFAULT 'member',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`, `room_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `message_id` VARCHAR(45) NOT NULL,
    `content` TEXT NOT NULL,
    `room_id` VARCHAR(45) NOT NULL,
    `sent_by` VARCHAR(45) NULL,
    `sent_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_credentials` ADD CONSTRAINT `user_credentials_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_memberships` ADD CONSTRAINT `room_memberships_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_memberships` ADD CONSTRAINT `room_memberships_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sent_by_fkey` FOREIGN KEY (`sent_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
