import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { makeSeller } from 'test/factories/make-seller'
import { makeCategory } from 'test/factories/make-category'

import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { SellProductUseCase } from './sell-product'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let inMemoryProductAttachmentsRepository: InMemoryProductAttachmentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let sut: SellProductUseCase

describe('Sell Product Use Case', () => {
  beforeEach(() => {
    inMemoryProductAttachmentsRepository =
      new InMemoryProductAttachmentsRepository()

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachmentsRepository,
    )

    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachmentsRepository,
    )

    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()

    sut = new SellProductUseCase(
      inMemorySellersRepository,
      inMemoryCategoriesRepository,
      inMemoryProductsRepository,
      inMemoryProductAttachmentsRepository,
    )
  })

  it('should be able to sell a product', async () => {
    const seller = makeSeller()
    const category = makeCategory()

    inMemorySellersRepository.items.push(seller)
    inMemoryCategoriesRepository.items.push(category)

    await sut.execute({
      ownerId: seller.id.toString(),
      categoryId: category.id.toString(),
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: ['attachment-1'],
    })

    expect(inMemoryProductsRepository.items).toHaveLength(1)
  })

  it('should not able to create a product with a non-existent user', async () => {
    const category = makeCategory()

    inMemoryCategoriesRepository.items.push(category)

    const result = await sut.execute({
      ownerId: 'onwer-id',
      categoryId: category.id.toString(),
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: ['attachments-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not able to create a product with a non-existent category', async () => {
    const seller = makeSeller()

    inMemorySellersRepository.items.push(seller)

    const result = await sut.execute({
      ownerId: seller.id.toString(),
      categoryId: 'category-id',
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: ['attachments-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it.skip('should not able to create a product with a non-existent images', async () => {
    const seller = makeSeller()
    const category = makeCategory()

    inMemorySellersRepository.items.push(seller)
    inMemoryCategoriesRepository.items.push(category)

    const result = await sut.execute({
      ownerId: seller.id.toString(),
      categoryId: category.id.toString(),
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: ['attachment-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
