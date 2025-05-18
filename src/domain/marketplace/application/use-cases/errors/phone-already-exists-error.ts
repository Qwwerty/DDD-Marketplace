import { UseCaseError } from '@/core/use-case-error'

export class PhoneAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Phone ${identifier} already exists.`)
  }
}
