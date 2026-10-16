/**
 * Start.ng integration boundary.
 *
 * The game will use Start.ng's documented connection mechanism for identity
 * and character appearance. Do not add a separate login flow here.
 *
 * Platform message handling will be implemented after the core game shell.
 */

export function createGuestPlayer() {
  return {
    authenticated: false,
    displayName: 'Guest',
    characterStyle: null,
  }
}
