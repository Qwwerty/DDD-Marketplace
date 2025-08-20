import { makeProduct } from 'test/factories/make-product'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'

import { ListAllProductsUseCase } from './list-all-products'
import { ProductStatus } from '../../enterprise/entities/product'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let sut: ListAllProductsUseCase

describe('List All Products Use Case', () => {
  beforeEach(() => {
    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()

    sut = new ListAllProductsUseCase(inMemoryProductsRepository)
  })

  it('should list all products ordered by creation date (newest first)', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct(
        { createdAt: new Date(2025, 0, 20) },
        undefined,
        new UniqueEntityId('1'),
      ),
      makeProduct(
        { createdAt: new Date(2025, 0, 18) },
        undefined,
        new UniqueEntityId('2'),
      ),
      makeProduct(
        { createdAt: new Date(2025, 0, 23) },
        undefined,
        new UniqueEntityId('3'),
      ),
    )

    const result = await sut.execute({ page: 1 })

    expect(result.value?.products).toEqual([
      expect.objectContaining({ productId: new UniqueEntityId('3') }),
      expect.objectContaining({ productId: new UniqueEntityId('1') }),
      expect.objectContaining({ productId: new UniqueEntityId('2') }),
    ])
  })

  it('should be able to list all products paginated recent products', async () => {
    for (let i = 1; i <= 22; i++) {
      inMemoryProductsRepository.items.push(
        makeProduct({ createdAt: new Date(2025, 0, 20) }),
      )
    }

    const result = await sut.execute({ page: 2 })

    expect(result.value?.products).toHaveLength(2)
  })

  it('should filter products by status', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct(
        {
          createdAt: new Date(2025, 0, 20),
          status: ProductStatus.available,
        },
        undefined,
        new UniqueEntityId('1'),
      ),
      makeProduct(
        {
          createdAt: new Date(2025, 0, 18),
          status: ProductStatus.sold,
        },
        undefined,
        new UniqueEntityId('2'),
      ),
      makeProduct(
        {
          createdAt: new Date(2025, 0, 23),
          status: ProductStatus.sold,
        },
        undefined,
        new UniqueEntityId('3'),
      ),
    )

    const result = await sut.execute({ page: 1, status: ProductStatus.sold })

    expect(result.value?.products).toEqual([
      expect.objectContaining({
        productId: new UniqueEntityId('3'),
      }),
      expect.objectContaining({
        productId: new UniqueEntityId('2'),
      }),
    ])
  })

  it('should search products by title or description', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct({ title: 'Title Test' }, undefined),
      makeProduct({ description: 'Description Test' }, undefined),
      makeProduct({ title: 'nothing', description: 'nothing' }, undefined),
    )

    const result = await sut.execute({ page: 1, search: 'test' })

    expect(result.value?.products).toHaveLength(2)
  })
})
