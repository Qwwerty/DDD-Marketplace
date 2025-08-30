import { Injectable } from '@nestjs/common'

import { PrismaViewerMapper } from '../mappers/prisma-viewer-mapper'
import { PrismaService } from '../prisma.service'

import { ViewersRepository } from '@/domain/marketplace/application/repositories/viewers-repository'
import { Viewer } from '@/domain/marketplace/enterprise/entities/viewer'

@Injectable()
export class PrismaViewersRepository implements ViewersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Viewer | null> {
    const viewer = await this.prisma.user.findUnique({
      where: {
        id,
      },
    })

    if (!viewer) {
      return null
    }

    return PrismaViewerMapper.toDomain(viewer)
  }
}
