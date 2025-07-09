import { Injectable } from '@nestjs/common'

import { PrismaAttachmentsMapper } from '../mappers/prisma-attachments-mapper'
import { PrismaService } from '../prisma.service'

import {
  AsyncFindMany,
  AttachmentsRepository,
} from '@/domain/marketplace/application/repositories/attachments-repository'
import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'

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

  async createMany(attachements: Attachment[]): Promise<void> {
    if (attachements.length === 0) {
      return
    }

    const data = attachements.map((attachment) =>
      PrismaAttachmentsMapper.toPrisma(attachment),
    )

    await this.prisma.attachment.createMany({ data })
  }

  async delete(attachmentId: string): Promise<void> {
    await this.prisma.attachment.delete({
      where: {
        id: attachmentId,
      },
    })
  }
}
