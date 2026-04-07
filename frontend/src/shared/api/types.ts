export type UserRole = 'ADMIN' | 'WRITER' | 'USER' | 'POLICE'

export type AuthTokens = {
  accessToken: string
}

export type AuthUser = {
  id: string
  fullName: string
  dpi: string
  email: string
  phoneNumber: string | null
  role: UserRole
}

export type NewsStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED'

export type NewsPost = {
  id: string
  slug: string
  title: string
  summary: string
  coverImageUrl: string
  content: Record<string, unknown>
  status: NewsStatus
  publishedAt: string | null
  authorId: string
  createdAt: string
  updatedAt: string
}

export type DashboardSummary = {
  publishedNewsCount: number
  successfulPaymentsTodayCount: number
  activeUsersCount: number
  pendingPaymentsCount: number
  recentActivity: DashboardActivity[]
}

export type DashboardActivity = {
  id: string
  type: 'PAYMENT' | 'NEWS' | 'USER'
  title: string
  description: string
  timestamp: string
}

export type TrafficFine = {
  id: string
  plateType: 'M' | 'P' | 'C'
  plateNumber: string
  issuedAt: string
  reason: string
  evidenceNotes: string | null
  evidencePhotoUrl: string | null
  amount: string
  status: 'PENDING' | 'PAID' | 'CANCELLED'
}

export type WaterBill = {
  id: string
  waterAccountId: string
  billingPeriod: string
  dueDate: string
  amount: string
  status: 'PENDING' | 'PAID'
}

export type OrnatoTicket = {
  id: string
  name: string
  dpi: string
  amount: string
  status: 'PENDING' | 'PAID'
}

export type OrnatoReceiptPreview = {
  municipality: string
  jurisdictionCode: string
  comptroller: string
  formTitle: string
  receiptLabel: string
  receiptNumber: string
  issuedDate: string
  issuedTime: string
  vin: string
  nit: string
  payerName: string
  domicile: string
  concept: string
  accountEntries: Array<{
    label: string
    amount: string
  }>
  total: string
  totalInWords: string
  paymentMethod: string
  cashierFooter: string
  legalReference: string
}

export type OrnatoReceiptDocument = {
  fileName: string
  pdfBase64: string
  preview: OrnatoReceiptPreview
}

export type OrnatoPaymentResult = {
  ticket: OrnatoTicket
  receipt: OrnatoReceiptDocument
}
