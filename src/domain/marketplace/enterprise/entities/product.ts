import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'

import { Seller } from './seller'
import { Category } from './category'
import { ProductAttachmentList } from './product-attachments-list'

export enum ProductStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
}

export interface ProductProps {
  title: string
  description: string
  priceInCents: number
  status: ProductStatus
  onwer: Seller
  category: Category
  attachments: ProductAttachmentList
  createdAt: Date
}

export class Product extends Entity<ProductProps> {
  set title(value: string) {
    this.props.title = value
  }

  get title() {
    return this.props.title
  }

  set description(value: string) {
    this.props.description = value
  }

  get description() {
    return this.props.description
  }

  set priceInCents(value: number) {
    this.props.priceInCents = value
  }

  get priceInCents() {
    return this.props.priceInCents
  }

  set status(value: ProductStatus) {
    this.props.status = value
  }

  get status() {
    return this.props.status
  }

  set onwer(value: Seller) {
    this.props.onwer = value
  }

  get onwer() {
    return this.props.onwer
  }

  set category(value: Category) {
    this.props.category = value
  }

  get category() {
    return this.props.category
  }

  set attachments(attachments: ProductAttachmentList) {
    this.props.attachments = attachments
  }

  get attachments() {
    return this.props.attachments
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(
    props: Optional<ProductProps, 'createdAt' | 'status' | 'attachments'>,
    id?: UniqueEntityId,
  ): Product {
    const product: ProductProps = {
      ...props,
      attachments: props.attachments ?? new ProductAttachmentList(),
      status: props.status ?? ProductStatus.AVAILABLE,
      createdAt: props.createdAt ?? new Date(),
    }

    return new Product(product, id)
  }
}
