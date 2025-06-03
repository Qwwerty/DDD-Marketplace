import {
  AsyncFindMany,
  AttachmentsRepository,
} from '@/domain/marketplace/application/repositories/attachments-repository'
import { Attachment } from '@/domain/marketplace/enterprise/entities/attachment'

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  public items: Attachment[] = []

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
}
