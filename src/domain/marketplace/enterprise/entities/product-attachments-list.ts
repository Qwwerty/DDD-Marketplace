import { ProductAttachment } from './product-attachment'

import { WatchedList } from '@/core/entities/watched-list'

export class ProductAttachmentList extends WatchedList<ProductAttachment> {
  compareItems(a: ProductAttachment, b: ProductAttachment): boolean {
    return a.id.equals(b.id)
  }
}
