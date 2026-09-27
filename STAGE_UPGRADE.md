# DIET stage-based learning portal

Implemented: first/last name and email registration, six-stage selection with subject preview, password confirmation, password sign-in, existing email-link sign-in, password recovery, Home / My subjects / Weekly plan / Practice room / Learning report / Study resources / My profile. Uses current ICAN catalogue of 27 subjects.

## Production activation

Applied `supabase/stage-registration.sql` to project `dxqdhsoqhjlnuftgdkxz` on 27 September 2026 after the owner instructed us to continue following the initial approval block. Verified six stages and all 27 subject rows.

The script adds the stage catalogue, preserves existing paper IDs and progress, updates legacy names, and provisions new students with their selected stage. Administrator status comes only from the existing private admin allowlist. Student metadata never grants admin rights. Existing row-level policies continue to isolate students' personal records. The paper selection function accepts only papers from the student's saved stage.

Registration checks the `student_registration_ready` RPC before creating an Auth account. The readiness function is now active. If it is unavailable during an outage, the UI safely reports registration is being connected. Password sign-in and existing email links remain available.

Email confirmation remains enabled. A working custom SMTP provider is still required for public student confirmation and recovery emails; Supabase's default sender is unsuitable for a multiuser launch. Do not disable confirmation to work around delivery.

New catalogue subjects have no fabricated lesson content. The UI explains where DIET topic plans are awaiting publication and links to ICAN materials. Existing Professional topic examples remain. Timed exams are explicitly not yet published.

## Verification

- Production Next build passed with configured public Supabase variables.
- TypeScript passed.
- Database catalogue verification passed. New-user email confirmation and end-to-end sign-in still require working email delivery.

## Sources checked 27 September 2026

- https://icanig.org/ican/assets/docs/documents/ATSWA_NEW_SYLLABUS_EFFECTIVE_SEPTEMBER_2026.pdf
- https://icanig.org/ican/assets/docs/ICAN_SYLLABUS_2026_Final_Updated_NEW.pdf
- https://supabase.com/docs/guides/auth/passwords
