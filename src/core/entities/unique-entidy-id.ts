import { randomUUID } from 'node:crypto'

export class UniqueEntityId {
  private readonly value: string

  toString() {
    return this.value
  }

  toValue() {
    return this.value
  }

  constructor(value?: string) {
    this.value = value ?? randomUUID()
  }

  public equals(id: UniqueEntityId) {
    return id.toValue() === this.value
  }
}
