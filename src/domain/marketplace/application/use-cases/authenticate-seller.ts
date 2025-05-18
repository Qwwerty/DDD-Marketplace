import { SellersRepository } from '../repositories/sellers-repository'

interface AuthenticateStudentUseCaseRequest {
  email: string
  password: string
}

export class AuthenticateSellerUseCase {
  constructor(private sellersRepository: SellersRepository) {}

  async execute({ email, password }: AuthenticateStudentUseCaseRequest) {}
}
