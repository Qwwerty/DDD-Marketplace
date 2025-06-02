import { UserAttachment } from '../../enterprise/entities/user-attachment'

export abstract class UserAttachmentsRepository {
  abstract create(attachement: UserAttachment): Promise<void>
}
