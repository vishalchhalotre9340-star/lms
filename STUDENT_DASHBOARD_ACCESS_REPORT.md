# Student Dashboard Access Report

## Files Changed

- `frontend/src/pages/Home/StudentDashboard.vue`
- `STUDENT_DASHBOARD_ACCESS_REPORT.md`

## Pure Student Behavior

A user can remain on `/student-dashboard` only when all of these are true:

- `is_student === true`
- `is_instructor !== true`
- `is_moderator !== true`
- `is_evaluator !== true`
- `is_system_manager !== true`

Pure students see the existing Student Dashboard data:

- enrolled courses
- progress
- certificates
- continue learning

The page shows a loading state while user role flags are loading.

## Instructor Behavior

If a user has `is_instructor === true`, the user is redirected from `/student-dashboard` to `Home`.

This applies even if the user also has student access.

## Moderator Behavior

If a user has `is_moderator === true`, the user is redirected from `/student-dashboard` to `Home`.

This applies even if the user also has student access.

## Evaluator Behavior

If a user has `is_evaluator === true`, the user is redirected from `/student-dashboard` to `Home`.

This applies even if the user also has student access.

## System Manager Behavior

If a user has `is_system_manager === true`, the user is redirected from `/student-dashboard` to `Home`.

This applies even if the user also has student access.

## Notes

- No backend permissions were changed.
- No sidebar logic was changed.
- No Vite config was changed.
- Existing dashboard data loading logic was preserved for pure students.
