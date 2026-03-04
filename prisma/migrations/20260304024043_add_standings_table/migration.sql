-- CreateTable
CREATE TABLE "standings" (
    "id" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDiff" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "teamId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,

    CONSTRAINT "standings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "standings_leagueId_season_position_idx" ON "standings"("leagueId", "season", "position");

-- CreateIndex
CREATE UNIQUE INDEX "standings_season_teamId_leagueId_key" ON "standings"("season", "teamId", "leagueId");

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
