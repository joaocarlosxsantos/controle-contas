-- CreateTable
CREATE TABLE "public"."BillMemberShare" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillMemberShare_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."BillMemberShare" ADD CONSTRAINT "BillMemberShare_billId_fkey" FOREIGN KEY ("billId") REFERENCES "public"."Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BillMemberShare" ADD CONSTRAINT "BillMemberShare_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
