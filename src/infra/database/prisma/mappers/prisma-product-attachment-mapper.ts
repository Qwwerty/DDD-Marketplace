import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { ProductAttachment } from '@/domain/marketplace/enterprise/entities/product-attachment'

@Injectable()
export class PrismaProductAttachmentMapper {
  static toPrismaUpdateMany(
    attachments: ProductAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentIds = attachments.map((attachment) => {
      return attachment.attachmentId.toString()
    })

    return {
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        productId: attachments[0].productId.toString(),
      },
    }
  }
}
