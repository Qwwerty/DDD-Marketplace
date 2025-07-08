import { User, UserProps } from './user'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

export interface ViewerProps extends UserProps {}

export class Viewer extends User {
  static create(props: UserProps, id?: UniqueEntityId): Viewer {
    return new Viewer(props, id)
  }
}
