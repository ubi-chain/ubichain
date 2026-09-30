# UBICHAIN

## Email magic-link login

The application uses [Magic](https://magic.link) for passwordless email login. Create a Magic application, then configure these environment variables for Production, Preview, and Development:

- `NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY`
- `MAGIC_SECRET_KEY`
- `AUTH_SESSION_SECRET` (a unique random value)

After configuration, `/login` sends a magic link and `/mypage` requires a verified session. The existing public visualisation is available at `/legacy/`.
