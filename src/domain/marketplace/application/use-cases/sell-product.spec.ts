import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { SellProductUseCase } from './sell-product'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { makeSeller } from 'test/factories/make-seller'
import { makeCategory } from 'test/factories/make-category'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { makeAttachment } from 'test/factories/make-attachement'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let sut: SellProductUseCase

describe('Sell Product Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachmentsRepository,
    )

    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryAttachmentsRepository,
    )

    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()

    sut = new SellProductUseCase(
      inMemorySellersRepository,
      inMemoryCategoriesRepository,
      inMemoryProductsRepository,
      inMemoryAttachmentsRepository,
    )
  })

  it('should be able to sell a product', async () => {
    const seller = makeSeller()
    const category = makeCategory()
    const attachment = makeAttachment({}, new UniqueEntityId('attachment-1'))

    inMemorySellersRepository.items.push(seller)
    inMemoryCategoriesRepository.items.push(category)
    inMemoryAttachmentsRepository.items.push(attachment)

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
    const attachment = makeAttachment({}, new UniqueEntityId('attachment-1'))

    inMemoryCategoriesRepository.items.push(category)
    inMemoryAttachmentsRepository.items.push(attachment)

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
    const attachment = makeAttachment({}, new UniqueEntityId('attachment-1'))

    inMemorySellersRepository.items.push(seller)
    inMemoryAttachmentsRepository.items.push(attachment)

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
      attachmentsIds: ['attachment-1'],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
