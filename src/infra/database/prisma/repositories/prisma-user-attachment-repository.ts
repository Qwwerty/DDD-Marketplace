import { Injectable } from '@nestjs/common'

import { PrismaService } from '../prisma.service'

import { UserAttachmentsRepository } from '@/domain/marketplace/application/repositories/user-attachments-repository'
import { UserAttachment } from '@/domain/marketplace/enterprise/entities/user-attachment'

@Injectable()
export class PrismaUserAttachmentsRepository
  implements UserAttachmentsRepository
{
  constructor(private prisma: PrismaService) {}

  async create(attachment: UserAttachment): Promise<void> {
    await this.prisma.attachment.update({
      where: {
        id: attachment.attachmentId.toString(),
      },
      data: {
        user_id: attachment.userId.toString(),
      },
    })
  }

  async delete(attachmentId: string): Promise<void> {
    await this.prisma.attachment.delete({
      where: {
        id: attachmentId,
      },
    })
  }
}
