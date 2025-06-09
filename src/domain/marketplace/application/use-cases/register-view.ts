import { Either, left } from '@/core/either'

import { Viewer } from '../../enterprise/entities/viewer'
import { ProductsRepository } from '../repositories/products-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ViewersRepository } from '../repositories/viewers-repository'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ViewsRepository } from '../repositories/views-repository'
import { View } from '../../enterprise/entities/view'

interface RegisterViewUseCaseRequest {
  productId: string
  viewerId: string
}

type RegisterViewUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    viewer: Viewer
  }
>

export class RegisterViewUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private viewersRepository: ViewersRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    productId,
    viewerId,
  }: RegisterViewUseCaseRequest): Promise<RegisterViewUseCaseResponse> {
    const product = await this.productsRepository.findById(productId)

    if (!product) {
      return left(new ResourceNotFoundError('productId', productId))
    }

    const viewer = await this.viewersRepository.findById(viewerId)

    if (!viewer) {
      return left(new ResourceNotFoundError('viewerId', viewerId))
    }

    if (product.onwer.id.toString() === viewerId) {
      return left(new NotAllowedError())
    }

    const view = View.create({
      product,
      viewer,
    })

    const isViewed = await this.viewsRepository.isViewed(view)

    if (isViewed) {
      return left(new NotAllowedError())
    }
  }
}
