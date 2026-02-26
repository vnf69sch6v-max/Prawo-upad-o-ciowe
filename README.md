# Next.js + Firebase Boilerplate

Clean Next.js 16 boilerplate with Firebase Authentication and Vercel deployment.

## Stack

- **Next.js 16** (React 19)
- **Firebase** Auth + Firestore
- **Tailwind CSS 4**
- **TypeScript**
- **Vercel** deployment

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your Firebase credentials
2. `npm install`
3. `npm run dev`

## Structure

```
src/
├── app/
│   ├── dashboard/     # Protected page
│   ├── login/         # Auth pages
│   ├── signup/
│   ├── forgot-password/
│   ├── layout.tsx
│   ├── page.tsx       # Redirects to /dashboard
│   └── providers.tsx
├── hooks/
│   └── use-auth.ts    # Firebase auth hook
├── lib/
│   ├── firebase/      # Client + Admin SDK config
│   ├── services/      # Firestore user service
│   ├── types/         # TypeScript types
│   └── utils/         # Utilities (cn)
└── middleware.ts       # Route protection
```
