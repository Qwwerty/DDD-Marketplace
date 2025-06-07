import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { makeProduct } from 'test/factories/make-product'
import { makeSeller } from 'test/factories/make-seller'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'

import { ListAllSellerProductsUseCase } from './list-all-seller-products'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductStatus } from '../../enterprise/entities/product'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryAttachemntsRepository: InMemoryAttachmentsRepository
let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: ListAllSellerProductsUseCase

describe('List All Seller Products Use Case', () => {
  beforeEach(() => {
    inMemoryAttachemntsRepository = new InMemoryAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryAttachemntsRepository,
    )

    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    sut = new ListAllSellerProductsUseCase(
      inMemorySellersRepository,
      inMemoryProductsRepository,
    )
  })

  it('should not allow listing products for a non-existent seller', async () => {
    inMemoryProductsRepository.items.push(makeProduct({}))

    const result = await sut.execute({ sellerId: 'seller-1' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should filter products by status', async () => {
    const seller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(seller)

    inMemoryProductsRepository.items.push(
      makeProduct({
        status: ProductStatus.AVAILABLE,
      }),
      makeProduct(
        {
          title: 'product 1',
          status: ProductStatus.SOLD,
        },
        seller,
      ),
      makeProduct(
        {
          title: 'product 2',
          status: ProductStatus.SOLD,
        },
        seller,
      ),
    )

    const result = await sut.execute({ sellerId: 'seller-1' })

    expect(result.value).toStrictEqual(
      expect.objectContaining({
        products: expect.arrayContaining([
          expect.objectContaining({ title: 'product 1' }),
          expect.objectContaining({ title: 'product 2' }),
        ]),
      }),
    )
  })

  it('should search products by title or description', async () => {
    const seller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(seller)

    inMemoryProductsRepository.items.push(
      makeProduct(
        { title: 'Title Test' },
        seller,
        new UniqueEntityId('product-1'),
      ),
      makeProduct(
        { description: 'Description Test' },
        seller,
        new UniqueEntityId('product-2'),
      ),
      makeProduct({}),
    )

    const result = await sut.execute({ sellerId: 'seller-1', search: 'test' })

    expect(result.value).toEqual(
      expect.objectContaining({
        products: expect.arrayContaining([
          expect.objectContaining({ title: 'Title Test' }),
          expect.objectContaining({ description: 'Description Test' }),
        ]),
      }),
    )
  })

  it('should be able to list all product of a user', async () => {
    const seller = makeSeller({}, new UniqueEntityId('seller-1'))

    inMemorySellersRepository.items.push(seller)

    inMemoryProductsRepository.items.push(
      makeProduct({}, seller),
      makeProduct({}, seller),
      makeProduct({}, seller),
    )

    const result = await sut.execute({ sellerId: 'seller-1' })

    // @ts-ignore
    expect(result.value.products).toHaveLength(3)
  })
})
