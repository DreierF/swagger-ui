export function hasRequireContext(code) {
    return /require\.context/g.test(code)
}