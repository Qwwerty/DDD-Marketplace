export abstract class CacheRepository {
  abstract set(key: string, value: string, seconds?: number): Promise<void>
  abstract get(key: string): Promise<string | null>
  abstract delete(key: string): Promise<void>
}
