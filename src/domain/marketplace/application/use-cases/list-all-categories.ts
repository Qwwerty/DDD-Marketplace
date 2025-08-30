import { Injectable } from '@nestjs/common'

import { CategoriesRepository } from '../repositories/categories-repository'

import { Either, right } from '@/core/either'
import { Category } from '@/domain/marketplace/enterprise/entities/category'

type ListAllCategoriesResponse = Either<
  null,
  {
    categories: Category[]
  }
>

@Injectable()
export class ListAllCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute(): Promise<ListAllCategoriesResponse> {
    const categories = await this.categoriesRepository.listAll()

    return right({
      categories,
    })
  }
}
