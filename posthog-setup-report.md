<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into this Nuxt 4 ecommerce project. The `nuxt-posthog` module was installed and configured. A `usePostHog()` composable was created to expose the PostHog client throughout the app. Twelve events were instrumented across nine files — covering the full customer journey from registration and sign-in through product discovery, cart management, checkout, and order completion. Server-side events are correlated to client sessions via `x-posthog-session-id` and `x-posthog-distinct-id` headers. User identification is called on login and registration so individual journeys are trackable across sessions.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User logs in with email/password or social provider | `app/pages/signin.vue` |
| `user_registered` | New user creates an account | `app/pages/register/index.vue` |
| `product_added_to_cart` | User adds a product variant to the cart | `app/pages/product/[id].vue` |
| `product_review_submitted` | Logged-in user submits a product review | `app/pages/product/[id].vue` |
| `cart_item_removed` | User removes a line item from the cart drawer | `app/components/Cart/CartDrawer.vue` |
| `checkout_started` | User begins the checkout flow | `app/pages/checkout.vue` |
| `order_completed` | Order confirmation page loads with a valid order | `app/pages/order-completed.vue` |
| `newsletter_subscribed` | User successfully subscribes to the newsletter | `app/components/Newsletter/NewsletterComponent.vue` |
| `contact_form_submitted` | User submits the contact form | `app/components/Forms/ContactForm.vue` |
| `server_cart_completed` | Server: cart completed and order created | `server/api/cart/complete-cart.ts` |
| `server_user_registered` | Server: new customer account created | `server/api/account/register.ts` |
| `server_user_signed_in` | Server: customer login authenticated | `server/api/account/login.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/67892/dashboard/631149
- **Purchase Conversion Funnel** (add to cart → checkout → order): https://eu.posthog.com/project/67892/insights/zrrmViqW
- **New User Registrations**: https://eu.posthog.com/project/67892/insights/QbWj5foe
- **Orders Completed**: https://eu.posthog.com/project/67892/insights/szcZMJVa
- **Newsletter Subscriptions**: https://eu.posthog.com/project/67892/insights/FIYpCY3a
- **Cart Activity: Add vs Remove**: https://eu.posthog.com/project/67892/insights/IrIlt7SJ

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
