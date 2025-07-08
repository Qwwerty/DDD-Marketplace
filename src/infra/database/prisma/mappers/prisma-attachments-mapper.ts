import { Attachment as PrismaAttachment, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'

export class PrismaAttachmentsMapper {
  static toDomain(raw: PrismaAttachment): Attachment {
    return Attachment.create(
      {
        title: raw.title,
        path: raw.path,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    attachment: Attachment,
  ): Prisma.AttachmentUncheckedCreateInput {
    return {
      id: attachment.id.toString(),
      title: attachment.title,
      path: attachment.path,
    }
  }
}
