import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Attachment } from './attachment'

export interface UserProps {
  name: string
  email: string
  phone?: string | null
  password: string
  avatar?: Attachment | null
}

export class User extends Entity<UserProps> {
  set name(name: string) {
    this.props.name = name
  }

  get name() {
    return this.props.name
  }

  set email(email: string) {
    this.props.email = email
  }

  get email() {
    return this.props.email
  }

  set phone(phone: string | null | undefined) {
    this.props.phone = phone
  }

  get phone() {
    return this.props.phone
  }

  set password(password: string) {
    this.props.password = password
  }

  get password() {
    return this.props.password
  }

  set avatar(avatar: Attachment | null | undefined) {
    this.props.avatar = avatar
  }

  get avatar() {
    return this.props.avatar
  }

  static create(props: UserProps, id?: UniqueEntityId) {
    return new User(props, id)
  }
}
