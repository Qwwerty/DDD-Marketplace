import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { makeProduct } from 'test/factories/make-product'
import { makeSeller } from 'test/factories/make-seller'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'

import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductStatus } from '../../enterprise/entities/product'
import { MarkSellAsSolddUseCase } from './mark-sell-as-sold'

let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemorySellersRepository: InMemorySellersRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: MarkSellAsSolddUseCase

describe('Mark Sell As Sold Use Case', () => {
  beforeEach(() => {
    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachmentsRepository,
    )

    sut = new MarkSellAsSolddUseCase(
      inMemoryProductsRepository,
      inMemorySellersRepository,
    )
  })

  it('should not updating the product status with a nonexistent user', async () => {
    const seller = makeSeller({}, new UniqueEntityId('seller-1'))

    const product = makeProduct(
      {
        title: 'product title',
        description: 'product description',
        status: ProductStatus.CANCELLED,
      },
      seller,
      new UniqueEntityId('product-1'),
    )

    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: 'product-1',
      ownerId: seller.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not updating the status of a nonexistent product', async () => {
    const seller = makeSeller({}, new UniqueEntityId('seller-1'))

    const result = await sut.execute({
      productId: 'product-1',
      ownerId: seller.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not updating the status of product owned by another user', async () => {
    const seller1 = makeSeller({}, new UniqueEntityId('seller-1'))
    const seller2 = makeSeller({}, new UniqueEntityId('seller-2'))

    inMemorySellersRepository.items.push(seller1, seller2)

    const product = makeProduct(
      {
        title: 'product title',
        description: 'product description',
        status: ProductStatus.CANCELLED,
      },
      seller1,
      new UniqueEntityId('product-1'),
    )

    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: 'product-1',
      ownerId: 'seller-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not allow marking a cancelled product as sold', async () => {
    const seller1 = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(seller1)

    const product = makeProduct(
      {
        title: 'product title',
        description: 'product description',
        status: ProductStatus.CANCELLED,
      },
      seller1,
      new UniqueEntityId('product-1'),
    )

    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: 'product-1',
      ownerId: 'seller-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should allow updating the product status to sold', async () => {
    const seller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(seller)

    const product = makeProduct(
      {
        title: 'product title',
        description: 'product description',
        status: ProductStatus.AVAILABLE,
      },
      seller,
      new UniqueEntityId('product-1'),
    )

    inMemoryProductsRepository.items.push(product)

    const result = await sut.execute({
      productId: 'product-1',
      ownerId: seller.id.toString(),
    })

    expect(result.value).toStrictEqual(
      expect.objectContaining({
        product: expect.objectContaining({
          status: 'sold',
        }),
      }),
    )
  })
})
