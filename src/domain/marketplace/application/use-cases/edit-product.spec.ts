import { makeCategory } from 'test/factories/make-category'
import { makeProduct } from 'test/factories/make-product'
import { makeProductAttachment } from 'test/factories/make-product-attachment'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryCategoriesRepository } from 'test/repositories/in-memory-categories-repository'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryUserAttachmentsRepository } from 'test/repositories/in-memory-user-attachments-repository'

import { EditProductUseCase } from './edit-product'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductStatus } from '../../enterprise/entities/product'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryCategoriesRepository: InMemoryCategoriesRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let inMemoryProductAttachmentsRepository: InMemoryProductAttachmentsRepository
let sut: EditProductUseCase

describe('Edit Product Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository()

    inMemoryProductAttachmentsRepository =
      new InMemoryProductAttachmentsRepository()

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    )

    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachmentsRepository,
      inMemoryAttachmentsRepository,
    )

    inMemoryCategoriesRepository = new InMemoryCategoriesRepository()

    sut = new EditProductUseCase(
      inMemorySellersRepository,
      inMemoryCategoriesRepository,
      inMemoryProductsRepository,
      inMemoryProductAttachmentsRepository,
    )
  })

  it('should be able to edit a product', async () => {
    const seller = makeSeller()
    const category = makeCategory()

    const product = makeProduct({}, seller, new UniqueEntityId('product-1'))

    inMemorySellersRepository.items.push(seller)
    inMemoryCategoriesRepository.items.push(category)
    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: 'product-1',
      ownerId: seller.id.toString(),
      categoryId: category.id.toString(),
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: [],
    })

    expect(inMemoryProductsRepository.items[0]).toStrictEqual(
      expect.objectContaining({
        title: 'Title product test',
        description: 'Description product test',
        priceInCents: 2000,
      }),
    )
  })

  it('should not able to create a product with a non-existent product', async () => {
    const seller = makeSeller()
    const category = makeCategory()

    inMemorySellersRepository.items.push(seller)
    inMemoryCategoriesRepository.items.push(category)

    const result = await sut.execute({
      productId: 'product-1',
      ownerId: seller.id.toString(),
      categoryId: category.id.toString(),
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not able to create a product with a non-existent user', async () => {
    const seller = makeSeller()
    const category = makeCategory()

    const product = makeProduct({}, seller, new UniqueEntityId('product-1'))

    inMemoryCategoriesRepository.items.push(category)
    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: 'product-1',
      ownerId: seller.id.toString(),
      categoryId: category.id.toString(),
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not able to create a product with a non-existent category', async () => {
    const seller = makeSeller()
    const product = makeProduct({}, seller, new UniqueEntityId('product-1'))

    inMemorySellersRepository.items.push(seller)
    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: 'product-1',
      ownerId: seller.id.toString(),
      categoryId: 'category-1',
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not able to create a product with a non-existent images', async () => {
    const seller = makeSeller()
    const category = makeCategory()

    const product = makeProduct({}, seller, new UniqueEntityId('product-1'))

    inMemorySellersRepository.items.push(seller)
    inMemoryCategoriesRepository.items.push(category)
    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: product.id.toString(),
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

  it('should not allow editing a sold product', async () => {
    const seller = makeSeller()
    const category = makeCategory()

    const product = makeProduct(
      { status: ProductStatus.SOLD },
      seller,
      new UniqueEntityId('product-1'),
    )

    inMemorySellersRepository.items.push(seller)
    inMemoryCategoriesRepository.items.push(category)
    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: product.id.toString(),
      ownerId: seller.id.toString(),
      categoryId: category.id.toString(),
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not allow updating a product from another user', async () => {
    const seller1 = makeSeller()
    const seller2 = makeSeller()

    inMemorySellersRepository.items.push(seller1, seller2)

    const category = makeCategory()

    const product = makeProduct({}, seller1, new UniqueEntityId('product-1'))

    inMemoryCategoriesRepository.items.push(category)
    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: product.id.toString(),
      ownerId: seller2.id.toString(),
      categoryId: category.id.toString(),
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should sync new and removed attachments when editing a product', async () => {
    const seller = makeSeller()
    const category = makeCategory()

    const product = makeProduct({}, seller, new UniqueEntityId('product-1'))

    inMemoryProductAttachmentsRepository.items.push(
      makeProductAttachment({
        productId: product.id,
        attachmentId: new UniqueEntityId('1'),
      }),
      makeProductAttachment({
        productId: product.id,
        attachmentId: new UniqueEntityId('2'),
      }),
    )

    inMemorySellersRepository.items.push(seller)
    inMemoryCategoriesRepository.items.push(category)
    inMemoryProductsRepository.items.push(product)

    await sut.execute({
      productId: 'product-1',
      ownerId: seller.id.toString(),
      categoryId: category.id.toString(),
      title: 'Title product test',
      description: 'Description product test',
      priceInCents: 2000,
      attachmentsIds: ['1', '3'],
    })

    expect(inMemoryProductAttachmentsRepository.items).toHaveLength(2)
    expect(
      inMemoryProductsRepository.items[0].attachments.currentItems,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityId('3') }),
      ]),
    )
  })
})
