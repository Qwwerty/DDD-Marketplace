import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import {
  Attachment,
  AttachmentProps,
} from '@/domain/marketplace/enterprise/entities/attachment'

export function makeAttachment(
  override: Partial<AttachmentProps> = {},
  id?: UniqueEntityId,
) {
  return Attachment.create(
    {
      path: faker.internet.url(),
      ...override,
    },
    id,
  )
}
