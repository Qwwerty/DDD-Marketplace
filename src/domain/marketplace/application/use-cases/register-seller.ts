import { Seller } from '../../enterprise/entities/seller'
import { SellersRepository } from '../repositories/sellers-repository'
import { Either, left, right } from '@/core/either'
import { EmailAlreadyExistsError } from './errors/email-already-exists-error'
import { PhoneAlreadyExistsError } from './errors/phone-already-exists-error'
import { HashGenerator } from '../cryptography/hash-generator'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface RegisterSellerUseCaseProps {
  name: string
  phone: string
  email: string
  password: string
  avatarId?: string
}

type RegisterSellerUseCaseResponse = Either<
  EmailAlreadyExistsError | PhoneAlreadyExistsError,
  {
    seller: Seller
  }
>

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

    if (avatarId) {
      const avatar = await this.attachmentsRepository.findById(avatarId)

      if (!avatar) {
        return left(new ResourceNotFoundError('avatarId', avatarId))
      }

      seller.avatar = avatar
    }

    await this.sellersRepository.create(seller)

    return right({
      seller,
    })
  }
}
