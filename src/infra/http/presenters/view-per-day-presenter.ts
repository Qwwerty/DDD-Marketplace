import { ViewsPerDay } from '@/domain/marketplace/application/repositories/views-repository'

export class ViewPerDayPresenter {
  static toHTTP(view: ViewsPerDay) {
    const [date] = view.date.toISOString().split('T')

    return {
      date,
      amount: view.amount
    }
  }
}
