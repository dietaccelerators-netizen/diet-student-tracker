# DIET Student Tracker — Pre-deployment verification

This package was reviewed before GitHub upload.

## Checks completed

- 36 TypeScript/TSX source files parsed with zero syntax diagnostics.
- Cross-file/local import scan found zero missing local modules.
- A local semantic TypeScript pass using external-framework stubs found zero project-internal type mismatches.
- `package.json` and `tsconfig.json` parse successfully.
- All runtime imports are covered by declared dependencies.
- Required DIET icon and wordmark PNG assets are valid images and their source paths match the UI components.
- Supabase project URL and publishable key in `.env.example` were checked against the live project.
- Live Supabase functions required by the app exist: `is_admin`, `set_student_papers`, `admin_register_student`, `touch_updated_at`, and the private `handle_new_user` trigger function.
- Source SQL references were aligned with the current live backend structure.
- Stale service-role setup instructions and the unused `NEXT_PUBLIC_SITE_URL` variable were removed.
- Supabase SSR handling was updated to the current cookie/cache-header pattern used by recent `@supabase/ssr` releases.
- The unused prototype HTML bundles and unused colour-board image were removed from the GitHub upload package.

## Dependency choices

The package pins the core runtime versions to avoid accidental version drift during the first deployment:

- Next.js 16.3.6
- React / React DOM 19.2.0
- `@supabase/ssr` 0.12.7
- `@supabase/supabase-js` 2.112.1
- Tailwind CSS 4.1.10

Node.js 20.9+ is declared in `package.json`.

## Final deployment check

A full `npm install && npm run build` could not be executed in the ChatGPT container because outbound npm package installation timed out. This is an environment/network limitation, not a source diagnostic. The first Vercel deployment remains the definitive framework build test; if Vercel reports any build error, use its build log before exposing the site to students.

## Vercel build-log verification — 26 Sep 2026

A real Vercel build installed all 63 packages, detected Next.js 16.3.6, and completed the optimized production compilation successfully. The build then stopped at TypeScript checking with one reported error in `components/ManagePapers.tsx`: the `student` value was considered possibly null inside the `cancel()` closure.

Version 0.2.1 fixes that exact error by capturing `student.paperIds` only after the non-null guard and using the non-null value inside closures. The same pass also makes the auth redirect guards explicitly null-safe so they do not depend on framework control-flow inference.

The Tailwind `allowScripts` output in the Vercel log was a warning, not the build failure; compilation continued past it successfully.

## Vercel dependency-resolution correction (v0.2.2)

Vercel reported an npm ERESOLVE conflict because `@supabase/ssr@0.12.7` requires `@supabase/supabase-js@^2.114.0`, while v0.2.1 pinned `2.112.1`.

Corrected in v0.2.2:
- `@supabase/ssr`: `0.12.7`
- `@supabase/supabase-js`: `2.116.0`

`2.116.0` satisfies the required `^2.114.0` peer range. The Vercel Node engine warning and Tailwind install-scripts message are warnings, not the cause of the failed install.
