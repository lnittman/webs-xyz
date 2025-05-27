# Clerk Billing Integration

This guide explains how Webs uses Clerk's B2C billing features to create subscription plans and gate premium content.

## Enable Billing
1. Open the **Billing Settings** page in the Clerk dashboard and enable billing.
2. Choose a payment gateway. The shared development gateway works for testing, or connect your own Stripe account.

## Create Plans and Features
1. On the **Plans** page, choose **Plans for Users** and select **Add Plan**.
2. Add any number of features to each plan. These entitlements are later checked in the app.

## Pricing Page
Use Clerk's `<PricingTable />` component to render a simple pricing page:

```tsx
import { PricingTable } from '@clerk/nextjs'

export default function Page() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      <PricingTable />
    </div>
  )
}
```

You can style this page just like our custom sign-in and sign-up pages powered by Clerk Elements.

## Gating Content
Clerk exposes two ways to control access: the React `<Protect>` component and the framework-agnostic `has()` method.

### Using `<Protect>`
```tsx
export default function ProtectPage() {
  return (
    <Protect plan="bronze" fallback={<p>Only subscribers to the Bronze plan can access this content.</p>}>
      {children}
    </Protect>
  )
}
```

### Using `has()`
```ts
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { has } = await auth()
  const canView = has({ feature: 'premium_access' })
  if (!canView) return <h1>Only subscribers with the Premium Access feature can access this content.</h1>
  return <h1>Our Exclusive Content</h1>
}
```

The `has()` method checks for plans, roles, or individual features on the server and returns a boolean. It's the recommended approach when you aren't using React.

---
Webs will implement billing flows in the `app` frontend while the `api` and `ai` services remain unchanged.
