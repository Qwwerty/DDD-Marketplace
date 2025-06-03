import { UserAttachment } from '../../enterprise/entities/user-attachment'

export abstract class UserAttachmentsRepository {
  abstract findById(id: string): Promise<UserAttachment | null>
  abstract create(attachement: UserAttachment): Promise<void>
  abstract delete(attachement: UserAttachment): Promise<void>
}
