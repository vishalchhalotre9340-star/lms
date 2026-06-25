# Instructor Dashboard Regression Checklist

## Files Inspected

- `frontend/src/pages/Home/InstructorDashboard.vue`
- `lms/lms/api.py`
- `frontend/src/components/Layouts/MobileLayout.vue`

## Feature Checklist

- [x] Instructor metrics endpoint is still `lms.lms.api.get_my_instructor_metrics`.
- [x] Frontend still uses the existing `instructorMetrics` resource and does not create an extra dashboard API resource.
- [x] Backend access is still scoped from `frappe.session.user`; no frontend-provided instructor, learner, member, course, submission, or filter IDs are accepted.
- [x] Created-course ownership still flows through `_get_current_user_created_courses()`, using `Course Instructor` rows for the current session user.
- [x] Enrollment optimization is still connected: one scoped `LMS Enrollment` source query loads `course`, `member`, `member_name`, `progress`, and `creation`, then reuses those rows for metrics, learner growth, notifications, recent learners, learners needing attention, and completion breakdown.
- [x] Assignment optimization is still connected: one latest-10 scoped `LMS Assignment Submission` query is shared by Recent Submissions and Instructor Notifications.
- [x] Pending Evaluations list and count remain separate from the shared assignment source, preserving the existing Not Graded filters, limits, and count behavior.
- [x] Quiz optimization is still connected: one latest-10 scoped `LMS Quiz Submission` query is shared by Recent Submissions and Instructor Notifications.
- [x] Course Performance still uses its complete scoped quiz submission dataset for per-course average quiz score.
- [x] Course Completion Breakdown is returned as `course_completion_breakdown` and includes one item per current instructor course.
- [x] Completion Breakdown status counts are based on enrollment progress: completed `>= 100`, in progress `> 0 and < 100`, not started `<= 0` or invalid/missing.
- [x] Completion Rate bars use the frontend `getCompletionRate(course)` helper and guard against zero learners, invalid values, `NaN`, and `Infinity`.
- [x] Course Insights uses the full loaded `courseCompletionBreakdown` data source and does not depend on search filtering.
- [x] Course search checks course title and course name case-insensitively after trimming the search input.
- [x] Course sorting supports Default Order, Most Learners, Highest Completion, Lowest Completion, and Course Title A-Z without mutating the API array.
- [x] Course sorting preserves API order for ties by retaining the original index.
- [x] Course Completion CSV export uses the full loaded `courseCompletionBreakdown` data, not the filtered list.
- [x] Course Completion CSV export includes formula-injection protection and CSV escaping helpers.
- [x] Learners Needing Attention CSV export uses only the loaded `learnersNeedingAttention` computed value.
- [x] Learners Needing Attention CSV export reuses the same CSV text sanitizing, escaping, safe number, Blob, and Object URL download pattern.
- [x] Refresh button calls `refreshInstructorMetrics()`, which uses `instructorMetrics.reload()`.
- [x] Refresh button disables while `instructorMetrics.loading` and shows `Refreshing...`.
- [x] Last Updated timestamp is set only after a successful metrics reload and remains `Not yet loaded` before the first successful response.
- [x] Initial-load error state shows a top-level alert panel only when there is an error and no existing dashboard data.
- [x] Retry button uses the same `refreshInstructorMetrics()` path and shows `Retrying...` while loading.
- [x] Refresh failure with existing data keeps dashboard data visible and shows a non-blocking status message.
- [x] Mobile shared layout wrapper uses `bg-surface-gray-1`, `text-ink-gray-9`, `min-w-0`, `overflow-x-hidden`, and bottom padding to avoid the mobile navigation.
- [x] No additional frontend dashboard resource or new backend endpoint was found for these features.

## Expected Manual Browser Checks

1. Sign in as an instructor and open the Instructor Dashboard.
2. Confirm the network request uses `lms.lms.api.get_my_instructor_metrics` with no frontend-supplied course, user, learner, member, or filter IDs.
3. Confirm metrics, cards, Learner Growth, Notifications, Quick Actions, Recent Learners, Upcoming Schedule, Learners Needing Attention, Completion Breakdown, and Course Insights render from the same metrics response.
4. Click Refresh and confirm the button disables, shows `Refreshing...`, keeps existing data visible, and updates Last Updated only after success.
5. Simulate an initial metrics failure and confirm the full error panel shows `Unable to load instructor dashboard`, supporting text, and a working Retry button.
6. Simulate a refresh failure after data has loaded and confirm old data remains visible with the small non-blocking error message.
7. In Course Completion Breakdown, verify zero-learner courses show `No learners enrolled yet` and an empty progress track.
8. Verify Completion Rate percentages match `completed_count / total_learners`, rounded to a whole number.
9. Search by course title and course name, including mixed case and leading/trailing spaces.
10. Test all sort options and confirm tied values keep the original API order.
11. Confirm Course Insights still reflects all courses, even when Completion Breakdown search is active.
12. Export Course Completion CSV and confirm all loaded courses are included in API order with the expected columns.
13. Export Learners Needing Attention CSV and confirm only current attention rows are exported in dashboard order.
14. Test CSV values containing commas, quotes, line breaks, and leading `=`, `+`, `-`, or `@`.
15. On mobile dark mode, confirm the page background is not white, headings remain readable, there is no horizontal overflow, and bottom content is clear of the mobile navigation.
16. On desktop, confirm the layout still matches the existing dashboard appearance.

## Backend Restart Requirements

- Backend changes in `lms/lms/api.py` require a backend process restart or reload if the running Frappe server has not picked up the latest Python code.
- No database migration is required for the inspected Instructor Dashboard work.
- No cache layer was added, so there is no instructor metrics cache invalidation step to perform beyond any normal Frappe/server reload behavior.

## Frontend-Only Changes That Need Only Hard Refresh

- `InstructorDashboard.vue` UI behavior such as Refresh, Last Updated, error states, Completion Breakdown search/sort, Course Insights, and CSV exports only requires a frontend rebuild or browser hard refresh, depending on the development/deployment mode.
- `MobileLayout.vue` shared mobile shell styling only requires the updated frontend bundle or a hard refresh once deployed.
- These frontend-only checks do not require migrate or backend schema changes.

## Risks And Manual Test Focus

- Instructor/moderator scoping should be tested with multiple instructors to confirm only current-session created courses appear.
- Refresh failure and initial-load failure states require explicit browser/network or backend error simulation.
- CSV export should be tested with unusual course and learner text values to verify escaping and spreadsheet formula protection.
- Completion Breakdown search/sort should be tested with duplicate learner counts and duplicate completion rates to verify stable tie handling.
- Large instructor course lists should be checked for acceptable client-side search and sort responsiveness.
- Mobile dark mode should be checked on actual narrow viewports because the shell fix is shared and page content may have its own spacing constraints.
- Certificate/batch schedule rows should be manually checked where data exists because they rely on genuine schedule fields and current ownership rules.

## Recommended Git Commit Message

`Add instructor dashboard regression checklist`
