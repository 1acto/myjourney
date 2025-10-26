/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `usr_avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_del` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_firstname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_google_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_is_active` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_lastname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_role_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_update_at` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."User_usr_email_key";

-- DropIndex
DROP INDEX "public"."User_usr_google_id_key";

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "usr_avatar",
DROP COLUMN "usr_created_at",
DROP COLUMN "usr_del",
DROP COLUMN "usr_email",
DROP COLUMN "usr_firstname",
DROP COLUMN "usr_google_id",
DROP COLUMN "usr_id",
DROP COLUMN "usr_is_active",
DROP COLUMN "usr_lastname",
DROP COLUMN "usr_phone",
DROP COLUMN "usr_role_name",
DROP COLUMN "usr_update_at",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "public"."UserRoleEnum";

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "address" TEXT,
    "zipCode" TEXT,
    "subDistrict" TEXT,
    "district" TEXT,
    "province" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Poi" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "locationId" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visitDate" TIMESTAMP(3),
    "time" TIME(0),
    "review" TEXT,

    CONSTRAINT "Poi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "poiId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Poi_locationId_key" ON "public"."Poi"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Poi" ADD CONSTRAINT "Poi_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Poi" ADD CONSTRAINT "Poi_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_poiId_fkey" FOREIGN KEY ("poiId") REFERENCES "public"."Poi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
