import { WatchedList } from '@/core/entities/watched-list'
import { Attachment } from './entities/attachment'

export class ProductAttachments extends WatchedList<Attachment> {
  compareItems(a: Attachment, b: Attachment): boolean {
    return a.id.equals(b.id)
  }
}
