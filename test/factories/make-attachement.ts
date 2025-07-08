import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import {
  Attachment,
  AttachmentProps,
} from '@/domain/marketplace/enterprise/entities/attachment'
import { PrismaAttachmentsMapper } from '@/infra/database/prisma/mappers/prisma-attachments-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

export function makeAttachment(
  override: Partial<AttachmentProps> = {},
  id?: UniqueEntityId,
) {
  return Attachment.create(
    {
      title: faker.lorem.sentence(),
      path: faker.internet.url(),
      ...override,
    },
    id,
  )
}

@Injectable()
export class AttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAttachment(
    data: Partial<AttachmentProps> = {},
  ): Promise<Attachment> {
    const attachment = makeAttachment(data)

    await this.prisma.attachment.create({
      data: PrismaAttachmentsMapper.toPrisma(attachment),
    })

    return attachment
  }
}
