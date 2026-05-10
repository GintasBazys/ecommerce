type SnackbarTone = "success" | "error" | "info"

type SnackbarState = {
    visible: boolean
    message: string
    tone: SnackbarTone
}

let snackbarTimer: ReturnType<typeof setTimeout> | null = null

export function useSnackbar() {
    const snackbar = useState<SnackbarState>("app-snackbar", () => ({
        visible: false,
        message: "",
        tone: "info"
    }))

    function closeSnackbar(): void {
        snackbar.value.visible = false

        if (snackbarTimer) {
            clearTimeout(snackbarTimer)
            snackbarTimer = null
        }
    }

    function showSnackbar(message: string, tone: SnackbarTone = "info", duration = 4500): void {
        snackbar.value = {
            visible: true,
            message,
            tone
        }

        if (snackbarTimer) {
            clearTimeout(snackbarTimer)
        }

        snackbarTimer = setTimeout(() => {
            snackbar.value.visible = false
            snackbarTimer = null
        }, duration)
    }

    return {
        snackbar,
        showSnackbar,
        closeSnackbar
    }
}
