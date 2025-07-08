import { Module } from '@nestjs/common'

import { PrismaService } from './prisma/prisma.service'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'
import { PrismaSellersRepository } from './prisma/repositories/prisma-sellers-repository'
import { PrismaUserAttachmentsRepository } from './prisma/repositories/prisma-user-attachment-repository'

import { AttachmentsRepository } from '@/domain/marketplace/application/repositories/attachments-repository'
import { SellersRepository } from '@/domain/marketplace/application/repositories/sellers-repository'
import { UserAttachmentsRepository } from '@/domain/marketplace/application/repositories/user-attachments-repository'

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
    {
      provide: UserAttachmentsRepository,
      useClass: PrismaUserAttachmentsRepository,
    },
  ],
  exports: [PrismaService, SellersRepository, AttachmentsRepository],
})
export class DatabaseModule {}
