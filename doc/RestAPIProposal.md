# API Routes & Server Actions Documentation

This document outlines all **API Routes** and **Server Actions** required for the Keep PH - Digital Mailbox application.

## Architecture Decision Guidelines

- **Server Actions**: Used for mutations (POST, PUT, DELETE), form submissions, and server-side operations that don't need to be called from external sources
- **API Routes**: Used for GET requests from client components, external integrations, webhooks, and endpoints that need to be publicly accessible

---

## API Routes (GET/POST endpoints)

| Method   | Endpoint                             | Description                                                                                                                                                         | File Path                                        |
| -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| GET      | `/api/kyc/status`                    | Get current user's KYC verification status                                                                                                                          | `app/api/kyc/status/route.ts`                    |
| GET      | `/api/kyb/status`                    | Get current business's KYB verification status                                                                                                                      | `app/api/kyb/status/route.ts`                    |
| GET      | `/api/billing/invoice/[id]`          | Download user invoice PDF                                                                                                                                           | `app/api/billing/invoice/[id]/route.ts`          |
| GET      | `/api/business/billing/invoice/[id]` | Download business invoice PDF                                                                                                                                       | `app/api/business/billing/invoice/[id]/route.ts` |
| GET      | `/api/mail/[id]/envelope`            | Download envelope scan image                                                                                                                                        | `app/api/mail/[id]/envelope/route.ts`            |
| GET      | `/api/mail/[id]/scan`                | Download full document scan PDF                                                                                                                                     | `app/api/mail/[id]/scan/route.ts`                |
| GET      | `/api/notifications`                 | Get user notifications                                                                                                                                              | `app/api/notifications/route.ts`                 |
| POST     | `/api/webhooks/payment`              | Payment provider webhook (Stripe/PayPal). Handles: payment_intent.succeeded/failed, customer.subscription.created/updated/deleted, invoice.payment_succeeded/failed | `app/api/webhooks/payment/route.ts`              |
| POST     | `/api/webhooks/email`                | Email service webhook                                                                                                                                               | `app/api/webhooks/email/route.ts`                |
| GET/POST | `/api/integrations/*`                | Third-party integrations                                                                                                                                            | `app/api/integrations/*/route.ts`                |

---

## Server Actions (Function calls)

### Authentication

| Function Name | Endpoint/Function | Description       | File Path             |
| ------------- | ----------------- | ----------------- | --------------------- |
| `login()`     | `login()`         | User login        | `app/actions/auth.ts` |
| `signup()`    | `signup()`        | User registration | `app/actions/auth.ts` |
| `signOut()`   | `signOut()`       | User logout       | `app/actions/auth.ts` |

### User - KYC

| Function Name | Endpoint/Function | Description             | File Path            |
| ------------- | ----------------- | ----------------------- | -------------------- |
| `submitKYC()` | `submitKYC()`     | Submit KYC verification | `app/actions/kyc.ts` |

### User - Mail

| Function Name          | Endpoint/Function      | Description                | File Path             |
| ---------------------- | ---------------------- | -------------------------- | --------------------- |
| `requestMailAction()`  | `requestMailAction()`  | Request scan/forward/shred | `app/actions/mail.ts` |
| `uploadMailFile()`     | `uploadMailFile()`     | Upload envelope/scan file  | `app/actions/mail.ts` |
| `assignMailToMember()` | `assignMailToMember()` | Assign mail to team member | `app/actions/mail.ts` |

### User - Settings

| Function Name      | Endpoint/Function  | Description          | File Path                 |
| ------------------ | ------------------ | -------------------- | ------------------------- |
| `updateSettings()` | `updateSettings()` | Update user settings | `app/actions/settings.ts` |

### User - Billing

| Function Name           | Endpoint/Function       | Description           | File Path                |
| ----------------------- | ----------------------- | --------------------- | ------------------------ |
| `updatePaymentMethod()` | `updatePaymentMethod()` | Update payment method | `app/actions/billing.ts` |

### User - Tags

| Function Name | Endpoint/Function | Description         | File Path             |
| ------------- | ----------------- | ------------------- | --------------------- |
| `createTag()` | `createTag()`     | Create new tag      | `app/actions/tags.ts` |
| `updateTag()` | `updateTag()`     | Update existing tag | `app/actions/tags.ts` |
| `deleteTag()` | `deleteTag()`     | Delete tag          | `app/actions/tags.ts` |

### Business - KYB

| Function Name | Endpoint/Function | Description             | File Path            |
| ------------- | ----------------- | ----------------------- | -------------------- |
| `submitKYB()` | `submitKYB()`     | Submit KYB verification | `app/actions/kyb.ts` |

### Business - Team

| Function Name        | Endpoint/Function    | Description                | File Path             |
| -------------------- | -------------------- | -------------------------- | --------------------- |
| `inviteTeamMember()` | `inviteTeamMember()` | Invite team member         | `app/actions/team.ts` |
| `updateTeamMember()` | `updateTeamMember()` | Update team member details | `app/actions/team.ts` |
| `removeTeamMember()` | `removeTeamMember()` | Remove team member         | `app/actions/team.ts` |
| `resendInvitation()` | `resendInvitation()` | Resend invitation email    | `app/actions/team.ts` |

### Business - Settings

| Function Name              | Endpoint/Function          | Description              | File Path                          |
| -------------------------- | -------------------------- | ------------------------ | ---------------------------------- |
| `updateBusinessSettings()` | `updateBusinessSettings()` | Update business settings | `app/actions/business-settings.ts` |

### Business - Billing

| Function Name             | Endpoint/Function         | Description             | File Path                         |
| ------------------------- | ------------------------- | ----------------------- | --------------------------------- |
| `updateBusinessPayment()` | `updateBusinessPayment()` | Update business payment | `app/actions/business-billing.ts` |

### Operator - Actions

| Function Name             | Endpoint/Function         | Description                  | File Path                 |
| ------------------------- | ------------------------- | ---------------------------- | ------------------------- |
| `updateRequestStatus()`   | `updateRequestStatus()`   | Update action request status | `app/actions/operator.ts` |
| `uploadScannedDocument()` | `uploadScannedDocument()` | Upload scanned document      | `app/actions/operator.ts` |
| `completeScanRequest()`   | `completeScanRequest()`   | Complete scan request        | `app/actions/operator.ts` |
| `processForwardRequest()` | `processForwardRequest()` | Process forward request      | `app/actions/operator.ts` |
| `addTrackingNumber()`     | `addTrackingNumber()`     | Add tracking number          | `app/actions/operator.ts` |
| `processShredRequest()`   | `processShredRequest()`   | Process shred request        | `app/actions/operator.ts` |

### Operator - Approvals

| Function Name           | Endpoint/Function       | Description     | File Path                  |
| ----------------------- | ----------------------- | --------------- | -------------------------- |
| `approveVerification()` | `approveVerification()` | Approve KYC/KYB | `app/actions/approvals.ts` |
| `rejectVerification()`  | `rejectVerification()`  | Reject KYC/KYB  | `app/actions/approvals.ts` |

### Notifications

| Function Name            | Endpoint/Function        | Description               | File Path                      |
| ------------------------ | ------------------------ | ------------------------- | ------------------------------ |
| `markNotificationRead()` | `markNotificationRead()` | Mark notification as read | `app/actions/notifications.ts` |
