export type Role = 'ADMIN' | 'BASIC'

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: Role
}
