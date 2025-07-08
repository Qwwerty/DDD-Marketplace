import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories-repository'

import { ListAllCategoriesUseCase } from './list-all-categories'
import { Category } from '../../enterprise/entities/category'

let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let sut: ListAllCategoriesUseCase

describe('List All Categories Use Case', () => {
  beforeEach(() => {
    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()

    sut = new ListAllCategoriesUseCase(inMemoryCategoriesRepository)
  })

  it('should be able to list all all categories', async () => {
    const category = Category.create({
      title: 'Furniture',
      slug: 'furniture',
    })

    inMemoryCategoriesRepository.items.push(category)

    const result = await sut.execute()

    expect(result.value?.categories).toHaveLength(1)
  })
})
