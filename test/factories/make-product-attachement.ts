import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

import {
  ProductAttachment,
  ProductAttachmentProps,
} from '@/domain/marketplace/enterprise/entities/product-attachment'

export function makeProductAttachment(
  override: Partial<ProductAttachmentProps> = {},
  id?: UniqueEntityId,
) {
  return ProductAttachment.create(
    {
      productId: new UniqueEntityId(),
      attachmentId: new UniqueEntityId(),
      ...override,
    },
    id,
  )
}
