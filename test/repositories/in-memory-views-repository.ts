import dayjs from 'dayjs'

import {
  CountBySeller,
  ViewsPerDay,
  ViewsRepository,
} from '@/domain/marketplace/application/repositories/views-repository'
import { View } from '@/domain/marketplace/enterprise/entities/view'

export class InMemoryViewsRepository implements ViewsRepository {
  public items: View[] = []

  async countBySeller({ sellerId }: CountBySeller): Promise<number> {
    const filtered = this.items.filter((item) => {
      const targetDate = dayjs(item.createdAt)
      const todayDate = dayjs()
      const thirtyDaysAgo = todayDate.subtract(30, 'day')

      return (
        targetDate.isBetween(thirtyDaysAgo, todayDate, 'day', '[]') &&
        item.viewer.id.toString() === sellerId
      )
    })

    return filtered.length
  }

  async countPerDay({ sellerId }: CountBySeller): Promise<ViewsPerDay[]> {
    const filtered = this.items.filter((item) => {
      const targetDate = dayjs(item.createdAt)
      const todayDate = dayjs()
      const thirtyDaysAgo = todayDate.subtract(30, 'day')

      return (
        targetDate.isBetween(thirtyDaysAgo, todayDate, 'day', '[]') &&
        item.viewer.id.toString() === sellerId
      )
    })

    const viewMap = new Map<string, ViewsPerDay>()

    for (const item of filtered) {
      const dateKey = item.createdAt.toString()
      const existing = viewMap.get(dateKey)

      if (existing) {
        existing.amount += 1
      } else {
        viewMap.set(dateKey, { date: item.createdAt, amount: 1 })
      }
    }

    return Array.from(viewMap.values())
  }

  async isViewed(view: View): Promise<boolean> {
    return this.items.some(
      (item) =>
        item.viewer.equals(view.viewer) &&
        item.product.equals(view.product) &&
        dayjs(item.createdAt).isSame(view.createdAt, 'day'),
    )
  }

  async create(view: View): Promise<void> {
    this.items.push(view)
  }
}
