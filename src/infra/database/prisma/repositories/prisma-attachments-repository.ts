import { Injectable } from '@nestjs/common'

import {
  AsyncFindMany,
  AttachmentsRepository,
} from '@/domain/marketplace/application/repositories/attachments-repository'
import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'
import { PrismaService } from '../prisma.service'
import { PrismaAttachmentsMapper } from '../mappers/prisma-attachments-mapper'

@Injectable()
export class PrismaAttachmentsRepository implements AttachmentsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(attachmentId: string): Promise<Attachment | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: {
        id: attachmentId,
      },
    })

    if (!attachment) {
      return null
    }

    return PrismaAttachmentsMapper.toDomain(attachment)
  }

  findManyByIds(ids: string[]): AsyncFindMany<Attachment> {
    throw new Error('Method not implemented.')
  }

  createMany(attachement: Attachment[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  delete(attachmentId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
