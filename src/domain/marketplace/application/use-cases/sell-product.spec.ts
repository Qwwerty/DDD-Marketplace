import { makeAttachment } from 'test/factories/make-attachement'
import { makeCategory } from 'test/factories/make-category'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories-repository'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryUserAttachmentsRepository } from 'test/repositories/in-memory-user-attachments-repository'

import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { SellProductUseCase } from './sell-product'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let inMemoryProductAttachmentsRepository: InMemoryProductAttachmentsRepository
let sut: SellProductUseCase

describe('Sell Product Use Case', () => {
  beforeEach(() => {
    inMemoryProductAttachmentsRepository =
      new InMemoryProductAttachmentsRepository()

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository()

    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    )

    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachmentsRepository,
      inMemoryAttachmentsRepository,
    )

    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()

    sut = new SellProductUseCase(
      inMemorySellersRepository,
      inMemoryCategoriesRepository,
      inMemoryProductsRepository,
    )
  })

  it('should be able to sell a product', async () => {
    inMemoryAttachmentsRepository.items.push(
      makeAttachment({}, new UniqueEntityId('1')),
      makeAttachment({}, new UniqueEntityId('2')),
    )

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
      attachmentsIds: ['1', '2'],
    })

    expect(inMemoryProductsRepository.items).toHaveLength(1)
    expect(inMemoryProductAttachmentsRepository.items).toHaveLength(2)
    expect(result.value).toStrictEqual({
      product: expect.objectContaining({
        productId: expect.any(UniqueEntityId),
        attachments: [
          expect.objectContaining({
            id: new UniqueEntityId('1'),
            path: expect.any(String),
          }),
          expect.objectContaining({
            id: new UniqueEntityId('2'),
            path: expect.any(String),
          }),
        ],
      }),
    })
  })

  it('should not able to create a product with a non-existent user', async () => {
    const category = makeCategory()

    inMemoryCategoriesRepository.items.push(category)

    const result = await sut.execute({
      ownerId: 'owner-id',
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

  it('should not able to create a product with a non-existent images', async () => {
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
      attachmentsIds: ['1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
