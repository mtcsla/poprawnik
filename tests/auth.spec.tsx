import { shouldRedirectOnRestricted, shouldRedirectOnUnauthenticated } from "../providers/AuthProvider";
import restricted from '../restricted.json';
import unauthenticated from '../unauthenticated.json';

jest.mock('../buildtime-deps/firebase', () => {
  return {
    auth: {}
  }
});

describe('Auth state redirect', () => {
  it('should redirect from restricted page when user is unauthenticated', () => {
    for (const restrictedItem of restricted as [string, string, '+' | '-'][]) {
      const [regExp, pathname, all] = restrictedItem;

      expect(pathname.match(RegExp(regExp))).toBeTruthy();
      expect(shouldRedirectOnRestricted(pathname)).toBe(true);

      if (all === '+') {
        for (let i = 0; i < 10; i++) {
          expect(shouldRedirectOnRestricted(`${pathname}/${Math.random().toString(36).replace(/[^a-z]+/g, '')}`)).toBe(true);
        }
      }
    }
  })
  it('should redirect from unauthenticated page when user is authenticated', () => {
    for (const restrictedItem of unauthenticated as [string, string, '+' | '-'][]) {
      const [regExp, pathname, all] = restrictedItem;

      expect(pathname.match(RegExp(regExp))).toBeTruthy();
      expect(shouldRedirectOnUnauthenticated(pathname)).toBe(true);

      if (all === '+') {
        for (let i = 0; i < 10; i++) {
          expect(shouldRedirectOnUnauthenticated(`${pathname}/${Math.random().toString(36).replace(/[^a-z]+/g, '')}`)).toBe(true);
        }
      }
    }
  })
})