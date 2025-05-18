import { Either, left, right } from '@/core/either'
import { SellersRepository } from '../repositories/sellers-repository'
import { Encrypter } from '../cryptography/encrypter'
import { WrongCrenditalsError } from './errors/wrong-crendentials-errors'
import { HashComparer } from '../cryptography/hash-comparer'

interface AuthenticateStudentUseCaseRequest {
  email: string
  password: string
}

type AuthenticateSellerUseCaseResponse = Either<
  WrongCrenditalsError,
  {
    accessToken: string
  }
>

export class AuthenticateSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private encrypter: Encrypter,
    private hashComparer: HashComparer,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateStudentUseCaseRequest): Promise<AuthenticateSellerUseCaseResponse> {
    const seller = await this.sellersRepository.findByEmail(email)

    if (!seller) {
      return left(new WrongCrenditalsError())
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      seller.password,
    )

    if (!isPasswordValid) {
      return left(new WrongCrenditalsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: seller?.id.toString(),
    })

    return right({
      accessToken,
    })
  }
}
