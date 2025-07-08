import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'
import { Encrypter } from '../cryptography/encrypter'
import { HashComparer } from '../cryptography/hash-comparer'
import { SellersRepository } from '../repositories/sellers-repository'
import { WrongCrenditalsError } from './errors/wrong-crendentials-errors'

interface AuthenticateSellerUseCaseRequest {
  email: string
  password: string
}

type AuthenticateSellerUseCaseResponse = Either<
  WrongCrenditalsError,
  {
    accessToken: string
  }
>

@Injectable()
export class AuthenticateSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private encrypter: Encrypter,
    private hashComparer: HashComparer,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateSellerUseCaseRequest): Promise<AuthenticateSellerUseCaseResponse> {
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
