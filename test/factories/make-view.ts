import { Injectable } from '@nestjs/common'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { View, ViewProps } from '@/domain/marketplace/enterprise/entities/view'
import { PrismaViewMapper } from '@/infra/database/prisma/mappers/prisma-view-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { makeViewer } from './make-viewer'
import { makeProduct } from './make-product'

export function makeView(
  override: Partial<ViewProps> = {},
  id?: UniqueEntityId,
) {
  return View.create(
    {
      viewer: makeViewer(),
      product: makeProduct(),
      ...override,
    },
    id,
  )
}

@Injectable()
export class ViewFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaView(data: Partial<ViewProps> = {}): Promise<View> {
    const view = makeView(data)

    await this.prisma.view.create({
      data: PrismaViewMapper.toPrisma(view),
    })

    return view
  }
}
