import { Either, right } from '@/core/either'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import { CategoriesRepository } from '../repositories/categories-repository'

type ListAllCategoriesResponse = Either<
  null,
  {
    categories: Category[]
  }
>

export class ListAllCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute(): Promise<ListAllCategoriesResponse> {
    const categories = await this.categoriesRepository.listAll()

    return right({
      categories,
    })
  }
}
