# Specification

## Summary
**Goal:** Auto-grant admin access to the deployer's Internet Identity principal on canister initialization, and ensure the frontend reflects admin status immediately after login without a page refresh.

**Planned changes:**
- On canister initialization, automatically assign the caller's principal as the admin if no admin is already set
- Update the frontend so that after Internet Identity login completes, the admin status is re-fetched automatically
- Admin navigation links and the admin panel become accessible immediately after login without requiring a page reload

**User-visible outcome:** After deploying the canister and logging in with Internet Identity, the logged-in account automatically has admin access and can access the admin panel without any manual refresh or additional setup steps.
