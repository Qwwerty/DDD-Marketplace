import { UseCaseError } from '@/core/errors/use-case-error'

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor(resource: string, identifier: string) {
    super(`${resource}: ${identifier} not found.`)
  }
}
