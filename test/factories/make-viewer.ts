import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import {
  Viewer,
  ViewerProps,
} from '@/domain/marketplace/enterprise/entities/viewer'

export function makeViewer(
  override: Partial<ViewerProps> = {},
  id?: UniqueEntityId,
) {
  return Viewer.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )
}
