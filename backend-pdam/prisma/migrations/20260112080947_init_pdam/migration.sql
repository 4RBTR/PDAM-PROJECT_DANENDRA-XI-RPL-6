/*
  Warnings:

  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `user` table. All the data in the column will be lost.
  - The values [CASHIER] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropIndex
DROP INDEX `User_uuid_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`,
    DROP COLUMN `profile_picture`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `uuid`,
    ALTER COLUMN `name` DROP DEFAULT,
    ALTER COLUMN `email` DROP DEFAULT,
    ALTER COLUMN `password` DROP DEFAULT,
    MODIFY `role` ENUM('MANAGER', 'KASIR', 'PELANGGAN') NOT NULL DEFAULT 'PELANGGAN',
    MODIFY `address` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Tagihan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bulan` VARCHAR(191) NOT NULL,
    `tahun` INTEGER NOT NULL,
    `meter_awal` INTEGER NOT NULL,
    `meter_akhir` INTEGER NOT NULL,
    `total_bayar` INTEGER NOT NULL,
    `status_bayar` VARCHAR(191) NOT NULL DEFAULT 'BELUM_BAYAR',
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tagihan` ADD CONSTRAINT `Tagihan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
