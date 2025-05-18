import { UseCaseError } from '@/core/use-case-error'

export class WrongCrenditalsError extends Error implements UseCaseError {
  constructor() {
    super('Credentials are not valid.')
  }
}
