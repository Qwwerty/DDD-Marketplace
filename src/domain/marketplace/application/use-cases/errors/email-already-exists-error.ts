import { UseCaseError } from '@/core/use-case-error'

export class EmailAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Email ${identifier} already exists.`)
  }
}
