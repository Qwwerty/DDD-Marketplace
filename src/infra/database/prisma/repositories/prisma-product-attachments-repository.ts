import { Injectable } from '@nestjs/common'

import { PrismaProductAttachmentMapper } from '../mappers/prisma-product-attachment-mapper'
import { PrismaService } from '../prisma.service'

import { ProductAttachmentsRepository } from '@/domain/marketplace/application/repositories/product-attachments-repository'
import { ProductAttachment } from '@/domain/marketplace/enterprise/entities/product-attachment'

@Injectable()
export class PrismaProductAttachmentsRepository
  implements ProductAttachmentsRepository
{
  constructor(private prisma: PrismaService) {}

  async createMany(attachments: ProductAttachment[]): Promise<void> {
    if (attachments.length === 0) {
      return
    }

    const data = PrismaProductAttachmentMapper.toPrismaUpdateMany(attachments)

    await this.prisma.attachment.updateMany(data)
  }

  deleteMany(attachments: ProductAttachment[]): Promise<void> {
    throw new Error('Method not implemented.')
  }

  findByProductId(productId: string): Promise<ProductAttachment[]> {
    throw new Error('Method not implemented.')
  }
}
