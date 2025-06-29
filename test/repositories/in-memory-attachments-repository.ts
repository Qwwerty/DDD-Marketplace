import {
  AsyncFindMany,
  AttachmentsRepository,
} from '@/domain/marketplace/application/repositories/attachments-repository'
import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  public items: Attachment[] = []

  async findById(attachmentId: string): Promise<Attachment | null> {
    const attachment = this.items.find(
      (item) => item.id.toString() === attachmentId,
    )

    if (!attachment) {
      return null
    }

    return attachment
  }

  async findManyByIds(ids: string[]): AsyncFindMany<Attachment> {
    const itemsById = new Map(
      this.items.map((item) => [item.id.toString(), item]),
    )

    const data: Attachment[] = []
    const inexistentIds: string[] = []

    for (const id of ids) {
      const found = itemsById.get(id)

      if (found) {
        data.push(found)
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

  async createMany(attachments: Attachment[]): Promise<void> {
    this.items.push(...attachments)
  }

  async delete(attachmentId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.id.toString() !== attachmentId,
    )
  }
}
