import { makeAttachment } from 'test/factories/make-attachement'
import { makeSeller } from 'test/factories/make-seller'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemorySellersRepository } from 'test/repositories/in-memory-sellers-repository'
import { InMemoryUserAttachmentsRepository } from 'test/repositories/in-memory-user-attachments-repository'

import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { GetSellerProfileUseCase } from './get-seller-profile'
import { UserAttachment } from '../../enterprise/entities/user-attachment'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

let inMemorySellersRepository: InMemorySellersRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryUserAttachment: InMemoryUserAttachmentsRepository
let sut: GetSellerProfileUseCase

describe('Get Seller Profile Use Case', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryUserAttachment = new InMemoryUserAttachmentsRepository()
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachment,
      inMemoryAttachmentsRepository,
    )

    sut = new GetSellerProfileUseCase(inMemorySellersRepository)
  })

  it('should not allow retrieving a nonexistent seller profile', async () => {
    const result = await sut.execute({ sellerId: 'seller-1' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not expose the user password', async () => {
    const seller = makeSeller(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

    const result = await sut.execute({ sellerId: 'seller-1' })

    if (result.isRight()) {
      expect(result.value.seller).not.toHaveProperty('password')
    } else {
      throw new Error('Expected result to be Right but got Left')
    }
  })

  it('should retrieve the seller profile', async () => {
    inMemoryAttachmentsRepository.items.push(
      makeAttachment(
        { title: 'test title', path: 'test/path' },
        new UniqueEntityId('1'),
      ),
    )

    const seller = makeSeller(
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
        avatar: UserAttachment.create({
          attachmentId: new UniqueEntityId('1'),
          userId: new UniqueEntityId('seller-1'),
        }),
      },
      new UniqueEntityId('seller-1'),
    )

    inMemorySellersRepository.items.push(seller)

    const result = await sut.execute({ sellerId: 'seller-1' })

    expect(result.value).toStrictEqual(
      expect.objectContaining({
        seller: expect.objectContaining({
          name: 'John Doe',
          email: 'johndoe@example.com',
          avatar: {
            id: new UniqueEntityId('1'),
            path: 'test/path',
          },
        }),
      }),
    )
  })
})
