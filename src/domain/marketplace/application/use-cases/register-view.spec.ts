import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

import { InMemoryProductAttachmentsRepository } from 'test/repositories/in-memory-product-attachments-repository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemoryViewersRepository } from 'test/repositories/in-memory-viewers-repository'
import { makeProduct } from 'test/factories/make-product'
import { makeViewer } from 'test/factories/make-viewer'

import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { RegisterViewUseCase } from './register-view'
import { InMemoryViewsRepository } from 'test/repositories/in-memory-views-repository'
import { View } from '../../enterprise/entities/view'

let inMemoryProductAttachments: InMemoryProductAttachmentsRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryProductsRepository: InMemoryProductsRepository
let inMemoryViewersRepository: InMemoryViewersRepository
let inMemoryViewsRepository: InMemoryViewsRepository
let sut: RegisterViewUseCase

describe('Register View Use Case', () => {
  beforeEach(() => {
    inMemoryProductAttachments = new InMemoryProductAttachmentsRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachments,
      inMemoryAttachmentsRepository,
    )

    inMemoryViewersRepository = new InMemoryViewersRepository()
    inMemoryViewsRepository = new InMemoryViewsRepository()

    sut = new RegisterViewUseCase(
      inMemoryProductsRepository,
      inMemoryViewersRepository,
      inMemoryViewsRepository,
    )
  })

  it('should not be possible to register a view for a non-existent product', async () => {
    const result = await sut.execute({
      productId: 'product-1',
      viewerId: 'viewer-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be possible to register a view for a non-existent viewer', async () => {
    inMemoryProductsRepository.items.push(
      makeProduct({}, undefined, new UniqueEntityId('product-1')),
    )

    const result = await sut.execute({
      productId: 'product-1',
      viewerId: 'viewer-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not allow the product owner to register a view  on their own product', async () => {
    const viewer = makeViewer({}, new UniqueEntityId('viewer-1'))

    inMemoryViewersRepository.items.push(viewer)

    inMemoryProductsRepository.items.push(
      makeProduct({}, viewer, new UniqueEntityId('product-1')),
    )

    const result = await sut.execute({
      productId: 'product-1',
      viewerId: 'viewer-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be possible to register a duplicate view', async () => {
    const viewer1 = makeViewer({}, new UniqueEntityId('viewer-1'))
    const viewer2 = makeViewer({}, new UniqueEntityId('viewer-2'))

    const product = makeProduct({}, viewer1, new UniqueEntityId('product-1'))

    inMemoryViewersRepository.items.push(viewer1, viewer2)

    inMemoryProductsRepository.items.push(product)

    inMemoryViewsRepository.items.push(
      View.create({
        product,
        viewer: viewer2,
      }),
    )

    const result = await sut.execute({
      productId: 'product-1',
      viewerId: 'viewer-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should be possible to register a view', async () => {
    const viewer1 = makeViewer({}, new UniqueEntityId('viewer-1'))
    const viewer2 = makeViewer({}, new UniqueEntityId('viewer-2'))

    const product = makeProduct({}, viewer1, new UniqueEntityId('product-1'))

    inMemoryViewersRepository.items.push(viewer1, viewer2)

    inMemoryProductsRepository.items.push(product)

    await sut.execute({
      productId: 'product-1',
      viewerId: 'viewer-2',
    })

    expect(inMemoryViewsRepository.items).toHaveLength(1)
  })
})
