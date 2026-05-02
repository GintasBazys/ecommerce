export function isChangingPage(): boolean {
    return false
}

export function _mergeTransitionProps<T>(props: T[]): T | undefined {
    return props.find(Boolean)
}

export function _wrapInTransition(_props: unknown, children: { default: () => unknown }) {
    return children
}
