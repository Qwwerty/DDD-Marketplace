import { UserAttachmentsRepository } from '@/domain/marketplace/application/repositories/user-attachments-repository'
import { UserAttachment } from '@/domain/marketplace/enterprise/entities/user-attachment'

export class InMemoryUserAttachmentsRepository
  implements UserAttachmentsRepository
{
  public items: UserAttachment[] = []

  async create(attachment: UserAttachment): Promise<void> {
    this.items.push(attachment)
  }
}
