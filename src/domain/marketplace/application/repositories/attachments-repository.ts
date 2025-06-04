import { Attachment } from '../../enterprise/entities/attachment'

export interface FindMany<T> {
  data: T[]
  hasAll: boolean
  inexistentIds: string[]
}

export type AsyncFindMany<T> = Promise<FindMany<T>>

export abstract class AttachmentsRepository {
  abstract createMany(attachement: Attachment[]): Promise<void>
  abstract findById(attachmentId: string): Promise<Attachment | null>
  abstract findManyByIds(ids: string[]): AsyncFindMany<Attachment>
}
