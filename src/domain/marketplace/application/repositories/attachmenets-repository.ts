import { Attachment } from '../../enterprise/entities/attachment'

export abstract class AttachmentsRepository {
  abstract createMany(attachments: Attachment[]): Promise<void>
}
