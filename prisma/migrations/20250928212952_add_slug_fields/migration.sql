/*
  Warnings:

  - Added the required column `slug` to the `lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `subtopics` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lessons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "subtopicId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lessons_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "subtopics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_lessons" ("content", "createdAt", "description", "duration", "id", "subtopicId", "title", "updatedAt", "slug") 
SELECT "content", "createdAt", "description", "duration", "id", "subtopicId", "title", "updatedAt", 
CASE 
  WHEN "title" = 'Линейные уравнения' THEN 'linear-equations'
  WHEN "title" = 'Квадратные уравнения' THEN 'quadratic-equations'
  ELSE 'lesson-' || "id"
END as "slug"
FROM "lessons";
DROP TABLE "lessons";
ALTER TABLE "new_lessons" RENAME TO "lessons";
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");
CREATE TABLE "new_subtopics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "themeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subtopics_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_subtopics" ("createdAt", "description", "id", "themeId", "title", "updatedAt", "slug") 
SELECT "createdAt", "description", "id", "themeId", "title", "updatedAt",
CASE 
  WHEN "title" = 'Алгебра' THEN 'algebra'
  WHEN "title" = 'Геометрия' THEN 'geometry'
  WHEN "title" = 'Механика' THEN 'mechanics'
  WHEN "title" = 'Термодинамика' THEN 'thermodynamics'
  WHEN "title" = 'Органическая химия' THEN 'organic-chemistry'
  WHEN "title" = 'Неорганическая химия' THEN 'inorganic-chemistry'
  ELSE 'subtopic-' || "id"
END as "slug"
FROM "subtopics";
DROP TABLE "subtopics";
ALTER TABLE "new_subtopics" RENAME TO "subtopics";
CREATE UNIQUE INDEX "subtopics_slug_key" ON "subtopics"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
