export type SocialProvider = "google" | "facebook"

export type SocialStage = "authenticating" | "error" | "success"

export type IdentityResponse = {
    authIdentity?: {
        user_metadata?: Record<string, unknown>
    }
}
