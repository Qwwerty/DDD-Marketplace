import { Injectable } from '@nestjs/common'

import { PrismaViewMapper } from '../mappers/prisma-view-mapper'
import { PrismaService } from '../prisma.service'

import {
  CountByProduct,
  CountBySeller,
  ViewsPerDay,
  ViewsRepository,
} from '@/domain/marketplace/application/repositories/views-repository'
import { ViewDetails } from '@/domain/marketplace/enterprise/entities/value-objects/view-details'
import { View } from '@/domain/marketplace/enterprise/entities/view'

@Injectable()
export class PrismaViewsRepository implements ViewsRepository {
  constructor(private prisma: PrismaService) {}

  async countBySeller({ sellerId }: CountBySeller): Promise<number> {
    const amount = await this.prisma.view.count({
      where: {
        product: {
          userId: sellerId,
        },
      },
    })

    return amount
  }

  countByProduct(params: CountByProduct): Promise<number> {
    throw new Error('Method not implemented.')
  }

  countPerDay(params: CountBySeller): Promise<ViewsPerDay[]> {
    throw new Error('Method not implemented.')
  }

  async isViewed(view: View): Promise<boolean> {
    const hasView = await this.prisma.view.findUnique({
      where: {
        id: view.id.toString(),
      },
    })

    if (!hasView) {
      return false
    }

    return true
  }

  async create(view: View): Promise<ViewDetails> {
    const data = PrismaViewMapper.toPrisma(view)

    const result = await this.prisma.view.create({
      data,
      include: {
        user: {
          include: {
            attachments: true,
          },
        },
        product: {
          include: {
            user: {
              include: {
                attachments: true,
              },
            },
            category: true,
            attachments: true,
          },
        },
      },
    })

    return PrismaViewMapper.toDomain(result)
  }
}
