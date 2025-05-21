import { AttachmentsRepository } from '@/domain/marketplace/application/repositories/attachmenets-repository'
import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  public items: Attachment[] = []

  async create(attachment: Attachment): Promise<void> {
    this.items.push(attachment)
  }

  async createMany(attachments: Attachment[]): Promise<void> {
    this.items.push(...attachments)
  }
}
