import { Injectable } from '@nestjs/common'

import { PrismaAttachmentsMapper } from '../mappers/prisma-attachments-mapper'
import { PrismaService } from '../prisma.service'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
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

  async findManyByIds(ids: string[]): AsyncFindMany<Attachment> {
    const attachments = await this.prisma.attachment.findMany({
      where: {
        id: { in: ids },
      },
    })

    const itemsById = new Map(attachments.map((item) => [item.id, item]))

    const data: Attachment[] = []
    const inexistentIds: string[] = []

    for (const id of ids) {
      const found = itemsById.get(id)

      if (found) {
        data.push(
          Attachment.create(
            {
              title: found.title,
              path: found.path,
            },
            new UniqueEntityId(found.id),
          ),
        )
      } else {
        inexistentIds.push(id)
      }
    }

    return {
      data,
      inexistentIds,
      hasAll: inexistentIds.length === 0,
    }
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
