export interface CheckoutOptions {
	productId: string
	referenceId: string
	units?: number
	successUrl?: string
	discountCode?: string
	customer?: { email: string }
	metadata?: Record<string, string>
}

export interface PortalOptions {
	customerId: string
}

export interface GrantAccessEvent {
	referenceId: string
	customerId: string
	customerEmail: string
	subscriptionId?: string
	productId: string
	reason: string
}

export interface RevokeAccessEvent {
	referenceId: string
	customerId: string
	reason: string
}

export interface WebhookHandlerOptions {
	onGrantAccess?: (event: GrantAccessEvent) => Promise<void>
	onRevokeAccess?: (event: RevokeAccessEvent) => Promise<void>
	onCheckoutCompleted?: (data: unknown) => Promise<void>
	onSubscriptionCanceled?: (data: unknown) => Promise<void>
	onSubscriptionUpdate?: (data: unknown) => Promise<void>
}

export interface CheckoutResult {
	url: string
}

export interface PortalResult {
	url: string
}
