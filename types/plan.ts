export interface Plan {
  id: string
  company: string
  plan: string
  seats: number
  status: 'active' | 'expired' | string
  renewsOn: string
  monthly: string
}
