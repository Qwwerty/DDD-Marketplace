import { Injectable } from '@nestjs/common'

import { PrismaCategoryMapper } from '../mappers/prisma-category-mapper'
import { PrismaService } from '../prisma.service'

import { CategoriesRepository } from '@/domain/marketplace/application/repositories/categories-repository'
import { Category } from '@/domain/marketplace/enterprise/entities/category'

@Injectable()
export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private prisma: PrismaService) {}
  async findById(categoryId: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    })

    if (!category) {
      return null
    }

    return PrismaCategoryMapper.toDomain(category)
  }

  async listAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany()

    return categories.map((category) => PrismaCategoryMapper.toDomain(category))
  }
}
