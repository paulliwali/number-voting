-- CreateTable
CREATE TABLE "public"."votes" (
    "id" TEXT NOT NULL,
    "number1" INTEGER NOT NULL,
    "number2" INTEGER NOT NULL,
    "winner" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);
