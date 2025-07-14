import { Injectable } from '@nestjs/common'

import { Seller } from '../../enterprise/entities/seller'
import { UserAttachment } from '../../enterprise/entities/user-attachment'
import { SellerDetails } from '../../enterprise/entities/value-objects/seller-details'
import { HashGenerator } from '../cryptography/hash-generator'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

type Avatar = {
  id: UniqueEntityId
  path: string
}

interface RegisterSellerUseCaseProps {
  name: string
  phone: string
  email: string
  password: string
  avatarId?: string | null
}

type RegisterSellerUseCaseResponse = Either<
  EmailAlreadyExistsError | PhoneAlreadyExistsError,
  {
    seller: SellerDetails
  }
>

@Injectable()
export class RegisterSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private hashGenerator: HashGenerator,
    private attachmentsRepository: AttachmentsRepository,
  ) {}

  async execute({
    name,
    phone,
    email,
    password,
    avatarId,
  }: RegisterSellerUseCaseProps): Promise<RegisterSellerUseCaseResponse> {
    const sellerWithSameEmail = await this.sellersRepository.findByEmail(email)

    if (sellerWithSameEmail) {
      return left(new EmailAlreadyExistsError(email))
    }

    const sellerWithSamePhone = await this.sellersRepository.findByPhone(phone)

    if (sellerWithSamePhone) {
      return left(new PhoneAlreadyExistsError(phone))
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const seller = Seller.create({
      name,
      phone,
      email,
      password: hashedPassword,
    })

    let avatar: Avatar | null = null

    if (avatarId) {
      const avatarResult = await this.attachAvatarToSeller(seller, avatarId)

      if (avatarResult.isLeft()) {
        return left(avatarResult.value)
      }

      avatar = avatarResult.value
    }

    const sellerDetails = SellerDetails.create({
      userId: seller.id,
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      avatar,
    })

    await this.sellersRepository.create(seller)

    return right({
      seller: sellerDetails,
    })
  }

  private async attachAvatarToSeller(
    seller: Seller,
    avatarId: string,
  ): Promise<Either<ResourceNotFoundError, Avatar>> {
    const avatar = await this.attachmentsRepository.findById(avatarId)

    if (!avatar) {
      return left(new ResourceNotFoundError('avatarId', avatarId))
    }

    const userAttachment = UserAttachment.create({
      userId: seller.id,
      attachmentId: new UniqueEntityId(avatarId),
    })

    seller.avatar = userAttachment

    return right({ id: avatar.id, path: avatar.path })
  }
}
