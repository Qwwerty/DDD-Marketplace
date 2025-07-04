import { Module } from '@nestjs/common'

import { SellersRepository } from '@/domain/marketplace/application/repositories/sellers-repository'

import { PrismaService } from './prisma/prisma.service'
import { PrismaSellersRepository } from './prisma/repositories/prisma-sellers-repository'
import { AttachmentsRepository } from '@/domain/marketplace/application/repositories/attachments-repository'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: SellersRepository,
      useClass: PrismaSellersRepository,
    },
    {
      provide: AttachmentsRepository,
      useClass: PrismaAttachmentsRepository,
    },
  ],
  exports: [PrismaService, SellersRepository, AttachmentsRepository],
})
export class DatabaseModule {}
