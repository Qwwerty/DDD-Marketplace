import dayjs from 'dayjs'

import { ViewsRepository } from '@/domain/marketplace/application/repositories/views-repository'
import { View } from '@/domain/marketplace/enterprise/entities/view'

export class InMemoryViewsRepository implements ViewsRepository {
  public items: View[] = []

  async isViewed(view: View): Promise<boolean> {
    return this.items.some(
      (item) =>
        item.viewer.equals(view.viewer) &&
        item.product.equals(view.product) &&
        dayjs(item.createdAt).isSame(view.createdAt, 'day'),
    )
  }
}
