import { UserAttachmentsRepository } from '@/domain/marketplace/application/repositories/user-attachments-repository'
import { UserAttachment } from '@/domain/marketplace/enterprise/entities/user-attachment'

export class InMemoryUserAttachmentsRepository
  implements UserAttachmentsRepository
{
  public items: UserAttachment[] = []

  async findById(userId: string): Promise<UserAttachment | null> {
    const userAttachment = this.items.find(
      (item) => item.onwerId.toString() === userId,
    )

    if (!userAttachment) {
      return null
    }

    return userAttachment
  }

  async create(attachement: UserAttachment): Promise<void> {
    this.items.push(attachement)
  }

  async delete(attachement: UserAttachment): Promise<void> {
    this.items = this.items.filter(
      (item) => attachement.attachmentId !== item.attachmentId,
    )
  }
}
