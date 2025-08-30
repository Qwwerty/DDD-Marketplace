import dayjs from 'dayjs'

import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository'

import {
  CountByProduct,
  CountBySeller,
  ViewsPerDay,
  ViewsRepository,
} from '@/domain/marketplace/application/repositories/views-repository'
import { ViewDetails } from '@/domain/marketplace/enterprise/entities/value-objects/view-details'
import { View } from '@/domain/marketplace/enterprise/entities/view'

export class InMemoryViewsRepository implements ViewsRepository {
  constructor(private attachmentsRepository: InMemoryAttachmentsRepository) {}

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

  async countByProduct({ productId }: CountByProduct): Promise<number> {
    const filtered = this.items.filter((item) => {
      const targetDate = dayjs(item.createdAt)
      const todayDate = dayjs()
      const thirtyDaysAgo = todayDate.subtract(7, 'day')

      return (
        targetDate.isBetween(thirtyDaysAgo, todayDate, 'day', '[]') &&
        item.product.id.toString() === productId
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

  async create(view: View): Promise<ViewDetails> {
    this.items.push(view)

    let viewerAvatar

    if (view.viewer.avatar) {
      viewerAvatar = await this.attachmentsRepository.findById(
        view.viewer.avatar?.attachmentId.toString(),
      )
    }

    let productOwnerAvatar

    if (view.product.owner.avatar) {
      productOwnerAvatar = await this.attachmentsRepository.findById(
        view.product.owner.avatar?.attachmentId.toString(),
      )
    }

    const attachmentsIds = view.product.attachments.currentItems.map((a) =>
      a.attachmentId.toString(),
    )

    const { data: attachments } =
      await this.attachmentsRepository.findManyByIds(attachmentsIds)

    return ViewDetails.create({
      viewer: {
        id: view.viewer.id,
        name: view.viewer.name,
        email: view.viewer.email,
        phone: view.viewer.phone,
        avatar: viewerAvatar
          ? { id: viewerAvatar.id, path: viewerAvatar.path }
          : null,
      },
      product: {
        productId: view.product.id,
        title: view.product.title,
        description: view.product.description,
        priceInCents: view.product.priceInCents,
        status: view.product.status,
        owner: {
          id: view.product.owner.id,
          name: view.product.owner.name,
          phone: view.product.owner.phone,
          email: view.product.owner.email,
          avatar: productOwnerAvatar
            ? { id: productOwnerAvatar.id, path: productOwnerAvatar.path }
            : null,
        },
        category: {
          id: view.product.category.id,
          title: view.product.category.title,
          slug: view.product.category.slug,
        },
        attachments,
      },
    })
  }
}
