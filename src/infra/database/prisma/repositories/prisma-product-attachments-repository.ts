import { Injectable } from '@nestjs/common'

import { PrismaProductAttachmentMapper } from '../mappers/prisma-product-attachment-mapper'
import { PrismaService } from '../prisma.service'

import { ProductAttachmentsRepository } from '@/domain/marketplace/application/repositories/product-attachments-repository'
import { ProductAttachment } from '@/domain/marketplace/enterprise/entities/product-attachment'
import { PrismaAttachmentsMapper } from '../mappers/prisma-attachments-mapper'

@Injectable()
export class PrismaProductAttachmentsRepository
  implements ProductAttachmentsRepository {
  constructor(private prisma: PrismaService) { }

  async createMany(attachments: ProductAttachment[]): Promise<void> {
    if (attachments.length === 0) {
      return
    }

    const data = PrismaProductAttachmentMapper.toPrismaUpdateMany(attachments)

    await this.prisma.attachment.updateMany(data)
  }

  async deleteMany(attachments: ProductAttachment[]): Promise<void> {
    if (attachments.length === 0) {
      return
    }

    const data = PrismaProductAttachmentMapper.toPrismaDeleteMany(attachments)

    await this.prisma.attachment.updateMany(data)
  }

  async findByProductId(productId: string): Promise<ProductAttachment[]> {
    const attachments = await this.prisma.attachment.findMany({
      where: {
        productId
      }
    })

    return attachments.map(attachment => PrismaProductAttachmentMapper.toDomain(attachment))
  }
}
