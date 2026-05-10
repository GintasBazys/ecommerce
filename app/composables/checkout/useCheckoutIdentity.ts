import type { ComputedRef, Ref, ShallowRef } from "vue"
import type { CheckoutAccountStepInstance, CheckoutCart, GuestErrors, LoginErrors, RegisterErrors } from "~/types/checkout"
import { checkoutEmailRules, checkoutPasswordRules, checkoutAddressRules, clearValidationErrors, runValidationRules } from "~/utils/checkoutValidation"
import type { useCustomerAuth } from "~/composables/auth/useCustomerAuth"

type CheckoutAuth = ReturnType<typeof useCustomerAuth>
type CartStore = ReturnType<typeof useCartStore>

export function useCheckoutIdentity(options: {
    auth: CheckoutAuth
    cart: Ref<CheckoutCart | null | undefined>
    cartStore: CartStore
    checkoutAccountStep: Ref<CheckoutAccountStepInstance | null>
    checkoutEmail: ComputedRef<string>
    isAuthenticated: ComputedRef<boolean>
    loadSavedAddresses: () => Promise<void>
    goToAddressStep: () => Promise<void>
    errorMessage: ShallowRef<string | null>
    isSubmitting: ShallowRef<boolean>
}) {
    const authTab = shallowRef<"login" | "register" | "guest">("login")
    const isEditingIdentity = shallowRef<boolean>(false)
    const hasExplicitGuestIdentity = shallowRef<boolean>(false)
    const guestCheckoutEmailCookie = useCookie<string | null>("checkout_guest_email", { sameSite: "lax", path: "/" })

    const loginEmail = shallowRef<string>("")
    const loginPassword = shallowRef<string>("")
    const loginTurnstileToken = shallowRef<string>("")
    const loginTurnstileResetKey = shallowRef<number>(0)
    const regFirstName = shallowRef<string>("")
    const regLastName = shallowRef<string>("")
    const regEmail = shallowRef<string>("")
    const regPassword = shallowRef<string>("")
    const registerTurnstileToken = shallowRef<string>("")
    const registerTurnstileResetKey = shallowRef<number>(0)
    const guestEmail = shallowRef<string>("")

    const loginErrors = reactive<LoginErrors>({ email: "", password: "", verification: "" })
    const registerErrors = reactive<RegisterErrors>({ first_name: "", last_name: "", email: "", password: "", verification: "" })
    const guestErrors = reactive<GuestErrors>({ email: "" })

    const hasPersistedGuestIdentity = computed<boolean>(() => Boolean(options.checkoutEmail.value && guestCheckoutEmailCookie.value === options.checkoutEmail.value))
    const isGuestIdentity = computed<boolean>(
        () =>
            !options.isAuthenticated.value &&
            (hasExplicitGuestIdentity.value || hasPersistedGuestIdentity.value || (!options.cart.value?.customer_id && !!options.checkoutEmail.value))
    )
    const identityCompleted = computed<boolean>(() => options.isAuthenticated.value || isGuestIdentity.value)
    const shouldShowIdentityReady = computed<boolean>(() => identityCompleted.value && !(isGuestIdentity.value && isEditingIdentity.value))

    function validateLoginForm(turnstileSiteKey: string): boolean {
        clearValidationErrors(loginErrors)
        loginErrors.email = runValidationRules(loginEmail.value, checkoutEmailRules)
        loginErrors.password = runValidationRules(loginPassword.value, checkoutPasswordRules)

        if (!turnstileSiteKey) {
            loginErrors.verification = "Security verification is currently unavailable. Please try again later."
        }

        return !loginErrors.email && !loginErrors.password && !loginErrors.verification
    }

    function validateRegisterForm(turnstileSiteKey: string): boolean {
        clearValidationErrors(registerErrors)
        registerErrors.first_name = runValidationRules(regFirstName.value, [checkoutAddressRules.required])
        registerErrors.last_name = runValidationRules(regLastName.value, [checkoutAddressRules.required])
        registerErrors.email = runValidationRules(regEmail.value, checkoutEmailRules)
        registerErrors.password = runValidationRules(regPassword.value, checkoutPasswordRules)

        if (!turnstileSiteKey) {
            registerErrors.verification = "Security verification is currently unavailable. Please try again later."
        }

        return !Object.values(registerErrors).some(Boolean)
    }

    function validateGuestForm(): boolean {
        clearValidationErrors(guestErrors)
        guestErrors.email = runValidationRules(guestEmail.value, checkoutEmailRules)
        return !guestErrors.email
    }

    function returnToAccountOptions(): void {
        options.errorMessage.value = null
        authTab.value = "login"
        isEditingIdentity.value = true
        hasExplicitGuestIdentity.value = false
        guestCheckoutEmailCookie.value = null
    }

    async function attachCustomerToCheckoutCart(): Promise<void> {
        if (!options.cart.value?.id) {
            return
        }

        await $fetch("/api/account/assign-customer", {
            method: "POST",
            credentials: "include",
            body: { cartId: options.cart.value.id }
        })
        await options.cartStore.loadCart()
    }

    async function handleCheckoutLogin(turnstileSiteKey: string): Promise<void> {
        if (!validateLoginForm(turnstileSiteKey)) {
            return
        }

        options.errorMessage.value = null
        options.isSubmitting.value = true

        try {
            if (!loginTurnstileToken.value && !(await executeLoginTurnstile())) {
                return
            }

            const loggedInCustomer = await options.auth.login(loginEmail.value, loginPassword.value, {
                loadCart: false,
                turnstileToken: loginTurnstileToken.value
            })

            if (!loggedInCustomer) {
                handleLoginFailure(options.auth.error.value ?? "Could not sign in. Check your email and password, then try again.")
                return
            }

            hasExplicitGuestIdentity.value = false
            guestCheckoutEmailCookie.value = null
            await attachCustomerToCheckoutCart()
            await options.loadSavedAddresses()
            await options.goToAddressStep()
        } finally {
            options.isSubmitting.value = false
        }
    }

    async function executeLoginTurnstile(): Promise<boolean> {
        try {
            loginTurnstileToken.value = await options.checkoutAccountStep.value?.executeLoginTurnstile() || ""
        } catch (error) {
            loginErrors.verification = error instanceof Error ? error.message : "Security verification failed. Please complete the challenge and try again."
            return false
        }

        if (!loginTurnstileToken.value) {
            loginErrors.verification = "Security verification failed. Please complete the challenge and try again."
            return false
        }

        return true
    }

    function handleLoginFailure(message: string): void {
        loginTurnstileToken.value = ""
        loginTurnstileResetKey.value += 1

        if (/verification|turnstile/i.test(message)) {
            loginErrors.verification = message
            return
        }

        if (/email or password|invalid credentials|incorrect/i.test(message)) {
            loginErrors.email = "Email or password is incorrect. Please check your details and try again."
            loginErrors.password = "Email or password is incorrect. Please check your details and try again."
            return
        }

        options.errorMessage.value = message
    }

    async function handleCheckoutSocialLogin(provider: "google" | "facebook"): Promise<void> {
        await options.auth.startSocialLogin(provider, "/checkout")
    }

    async function submitRegister(turnstileSiteKey: string): Promise<void> {
        if (!validateRegisterForm(turnstileSiteKey)) {
            return
        }

        options.errorMessage.value = null
        options.isSubmitting.value = true

        try {
            if (!registerTurnstileToken.value && !(await executeRegisterTurnstile())) {
                return
            }

            const registeredCustomer = await options.auth.register(
                {
                    email: regEmail.value,
                    password: regPassword.value,
                    first_name: regFirstName.value,
                    last_name: regLastName.value,
                    turnstileToken: registerTurnstileToken.value
                },
                { loadCart: false }
            )

            if (!registeredCustomer) {
                options.errorMessage.value = options.auth.error.value ?? "Registration failed"
                registerTurnstileToken.value = ""
                registerTurnstileResetKey.value += 1
                return
            }

            hasExplicitGuestIdentity.value = false
            guestCheckoutEmailCookie.value = null
            await attachCustomerToCheckoutCart()
            await options.loadSavedAddresses()
            await options.goToAddressStep()
        } finally {
            options.isSubmitting.value = false
        }
    }

    async function executeRegisterTurnstile(): Promise<boolean> {
        try {
            registerTurnstileToken.value = await options.checkoutAccountStep.value?.executeRegisterTurnstile() || ""
        } catch (error) {
            registerErrors.verification = error instanceof Error ? error.message : "Security verification failed. Please complete the challenge and try again."
            return false
        }

        if (!registerTurnstileToken.value) {
            registerErrors.verification = "Security verification failed. Please complete the challenge and try again."
            return false
        }

        return true
    }

    async function submitGuest(): Promise<void> {
        if (!validateGuestForm()) {
            return
        }

        options.errorMessage.value = null
        options.isSubmitting.value = true

        try {
            await $fetch("/api/cart/set-guest", {
                method: "POST",
                credentials: "include",
                body: { email: guestEmail.value }
            })

            await options.cartStore.loadCart()
            hasExplicitGuestIdentity.value = true
            guestCheckoutEmailCookie.value = guestEmail.value
            isEditingIdentity.value = false
            await options.goToAddressStep()
        } catch (error: unknown) {
            options.errorMessage.value = error instanceof Error ? error.message : "Could not continue as guest"
        } finally {
            options.isSubmitting.value = false
        }
    }

    function updateLoginTurnstileToken(value: string): void {
        loginTurnstileToken.value = value
        loginErrors.verification = ""
    }

    function updateRegisterTurnstileToken(value: string): void {
        registerTurnstileToken.value = value
        registerErrors.verification = ""
    }

    function handleTurnstileError(target: "login" | "register", message: string): void {
        if (target === "login") {
            loginTurnstileToken.value = ""
            loginErrors.verification = message
            return
        }

        registerTurnstileToken.value = ""
        registerErrors.verification = message
    }

    function syncGuestIdentityCookie(): void {
        if (options.isAuthenticated.value || !options.checkoutEmail.value || guestCheckoutEmailCookie.value !== options.checkoutEmail.value) {
            guestCheckoutEmailCookie.value = null
        }

        hasExplicitGuestIdentity.value = guestCheckoutEmailCookie.value === options.checkoutEmail.value
        isEditingIdentity.value = false
    }

    return {
        authTab,
        isEditingIdentity,
        hasExplicitGuestIdentity,
        guestCheckoutEmailCookie,
        loginEmail,
        loginPassword,
        loginTurnstileToken,
        loginTurnstileResetKey,
        regFirstName,
        regLastName,
        regEmail,
        regPassword,
        registerTurnstileToken,
        registerTurnstileResetKey,
        guestEmail,
        loginErrors,
        registerErrors,
        guestErrors,
        isGuestIdentity,
        identityCompleted,
        shouldShowIdentityReady,
        returnToAccountOptions,
        handleCheckoutLogin,
        handleCheckoutSocialLogin,
        submitRegister,
        submitGuest,
        updateLoginTurnstileToken,
        updateRegisterTurnstileToken,
        handleTurnstileError,
        syncGuestIdentityCookie
    }
}
