# Specification

## Summary
**Goal:** Replace Internet Identity-based admin authentication on the `/admin` route with a simple hardcoded password prompt.

**Planned changes:**
- Remove Internet Identity / principal-based access control from the Admin Panel page
- Add a password prompt screen shown when navigating to `/admin` without an active admin session
- Grant access to admin panel tabs (Books and Orders) when the correct hardcoded password is entered
- Show a visible error message when an incorrect password is entered
- Persist the admin session for the duration of the browser session using sessionStorage or React state
- Leave all other parts of the application (catalog, checkout, order history, cart) unchanged

**User-visible outcome:** Visiting `/admin` shows a password prompt instead of an Internet Identity login. Entering the correct hardcoded password immediately grants access to the admin panel, and the session persists without re-prompting during the same browser session.
