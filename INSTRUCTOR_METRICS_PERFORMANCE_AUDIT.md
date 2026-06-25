# Instructor Metrics Performance Audit

## Exact functions inspected

- `lms.lms.api.get_my_instructor_metrics`
- `lms.lms.api._get_current_user_created_courses`
- `lms.lms.api._get_instructor_course_performance`
- `lms.lms.api._get_instructor_calendar`
- `lms.lms.api._get_current_user_created_batches_for_calendar`
- `lms.lms.api._get_recent_instructor_learners`
- `lms.lms.api._get_learners_needing_attention`
- `lms.lms.api._get_instructor_notifications`
- `lms.lms.api._get_instructor_learner_growth`
- `lms.lms.api._get_last_six_months`
- `lms.lms.api._add_months`
- `lms.lms.api._get_pending_instructor_evaluations`
- `lms.lms.api._get_recent_instructor_submissions`
- `lms.lms.utils.has_course_instructor_role`
- `lms.lms.utils.has_moderator_role`

## Query inventory

The endpoint performs these database queries on the normal course-present path:

1. `Has Role`: `frappe.db.get_value`, checks whether `frappe.session.user` has `Course Creator`.
2. `Has Role`: `frappe.db.get_value`, checks whether `frappe.session.user` has `Moderator`. This is skipped when the first role check succeeds because of Python `or` short-circuiting.
3. `Course Instructor`: `frappe.get_all`, plucks course parents for `instructor = frappe.session.user`.
4. `LMS Course`: `frappe.get_all`, loads `name` and `title` for the created courses.
5. `LMS Assignment Submission`: `frappe.get_all`, loads latest 5 `Not Graded` submissions for pending evaluations.
6. `LMS Assignment Submission`: `frappe.db.count`, counts all `Not Graded` submissions for pending evaluation count.
7. `LMS Enrollment`: `frappe.get_all`, loads all enrollment rows for instructor courses with `course`, `member`, `progress`.
8. `LMS Quiz Submission`: `frappe.get_all`, loads all quiz submissions for instructor courses with `course`, `percentage`.
9. `LMS Assignment Submission`: `frappe.get_all`, loads latest 5 assignment submissions for recent submissions.
10. `LMS Quiz Submission`: `frappe.get_all`, loads latest 5 quiz submissions for recent submissions.
11. `LMS Enrollment`: `frappe.get_all`, loads all enrollments created in the last 6 calendar months for learner growth.
12. `LMS Enrollment`: `frappe.get_all`, loads latest 10 enrollments for instructor notifications.
13. `LMS Assignment Submission`: `frappe.get_all`, loads latest 10 assignment submissions for instructor notifications.
14. `LMS Quiz Submission`: `frappe.get_all`, loads latest 10 quiz submissions for instructor notifications.
15. `LMS Certificate Request`: `frappe.get_all`, loads latest 10 certificate requests for instructor notifications.
16. `LMS Enrollment`: `frappe.get_all`, loads latest 5 enrollments for recent learners.
17. `Course Instructor`: `frappe.get_all`, plucks batch parents for `instructor = frappe.session.user` and `parenttype = LMS Batch`.
18. `LMS Batch`: `frappe.get_all`, loads batch title and schedule fields for those batches.
19. `LMS Certificate Request`: `frappe.get_all`, loads up to 10 upcoming certificate evaluations for instructor courses.
20. `LMS Enrollment`: `frappe.get_all`, loads up to 5 enrollments with `progress < 50` for learners needing attention.

On the no-course path, the endpoint still calls `_get_instructor_calendar([], {})`, so it can still query:

1. `Has Role`: course creator role check.
2. `Has Role`: moderator role check when needed.
3. `Course Instructor`: created course lookup.
4. `Course Instructor`: batch parent lookup.
5. `LMS Batch`: batch schedule lookup, only if batch parents exist.

`_get_last_six_months` and `_add_months` do not query the database.

## Likely bottlenecks

- `LMS Enrollment` is queried five separate times for related dashboard features: total learners/average progress/course enrollment counts, learner growth, instructor notifications, recent learners, and learners needing attention.
- `LMS Assignment Submission` is queried four times: pending items, pending count, recent submissions, and notifications.
- `LMS Quiz Submission` is queried three times: course performance, recent submissions, and notifications.
- `LMS Certificate Request` is queried twice: notifications and upcoming schedule.
- `LMS Quiz Submission` for course performance loads every quiz submission for all instructor courses, which can become expensive with many courses or long-running courses.
- The main `LMS Enrollment` query loads every enrollment for all instructor courses. This supports current totals and course performance, but it scales linearly with enrollment volume.
- Learner growth loads all enrollment rows in the last 6 months and counts in Python. This is safe for modest data, but database aggregation would scale better.
- Notifications issue four separate latest-10 source queries, merge in Python, then slice to 10. This is reasonable for the current small limits, but each source query independently scans/filter-sorts by course and creation.
- Calendar loads all created instructor batches before filtering upcoming dates in Python. If an instructor has many historical batches, this can be slow.
- The no-course response still checks batch calendar data. That may be intentional for instructors with batches but no courses, but it is extra work for an otherwise empty dashboard response.

## N+1 findings

No direct N+1 database pattern was found inside `get_my_instructor_metrics` or the helpers it calls. The helpers do not execute database queries inside per-row loops. Course title lookups are served from the already loaded `course_titles` dictionary.

The main inefficiency is repeated bulk queries against the same DocTypes rather than N+1 row-by-row loading.

## Data fetched but not required

- `_get_current_user_created_batches_for_calendar` fetches `timezone`, but `_get_instructor_calendar` does not return or use it.
- `_get_recent_instructor_submissions` fetches `name` for assignment and quiz submissions and returns it in `recent_submissions`. If the dashboard does not need internal submission names, this is a privacy and payload concern, but changing it would alter the current response shape.
- `_get_instructor_course_performance` reconstructs `course_names` from `courses` even though `get_my_instructor_metrics` already computed `course_names`.
- `LMS Certificate Request.course_title` is fetched for calendar fallback even though `course_titles` should contain titles for scoped instructor courses. It is useful only as a fallback.

## Duplicate loading and repeated DocTypes

- Course names and titles are loaded once by `_get_current_user_created_courses`, then reused broadly. That part is mostly efficient.
- `course_names` is recomputed inside `_get_instructor_course_performance`.
- `LMS Enrollment` is repeatedly queried for overlapping data:
  - all rows for totals/progress,
  - last 6 months for growth,
  - latest 10 for notifications,
  - latest 5 for recent learners,
  - lowest 5 below 50 for attention.
- `LMS Assignment Submission` is repeatedly queried for pending evaluations, recent submissions, and notifications.
- `LMS Quiz Submission` is repeatedly queried for course performance, recent submissions, and notifications.

## Low-risk optimizations

- Pass `course_names` into `_get_instructor_course_performance` instead of rebuilding it from `courses`.
- Reuse the already fetched all-enrollment rows for small/medium datasets to derive `recent_learners`, `learners_needing_attention`, and possibly learner growth, while preserving the current JSON response shape.
- For larger datasets, prefer targeted aggregate queries instead of loading all rows:
  - count distinct learners per course or total with SQL/query builder,
  - average progress per course,
  - enrollment counts grouped by calendar month,
  - quiz average percentage grouped by course.
- Keep the current limited recent-source queries for notifications, but consider fetching only the fields needed for the response and preserving each source limit before merging.
- Add date filters to batch calendar source queries so historical batches are not loaded only to be discarded in Python.
- Combine pending evaluation list/count carefully. If Frappe supports count metadata cheaply, use one query pattern; otherwise keep the count query because the dashboard needs both total count and latest 5 rows.
- Remove unused `timezone` from the batch calendar field list unless a later UI uses it.
- Preserve response keys exactly while moving expensive calculations into grouped database queries.

## Caching considerations

Caching is not recommended as the first optimization because the response is session-scoped and includes fast-changing activity such as submissions, enrollments, notifications, and schedule items.

If caching is later considered:

- Cache key must include `frappe.session.user`, for example `instructor_metrics:{site}:{user}`.
- Cache invalidation would need to account for changes to `LMS Enrollment`, `LMS Assignment Submission`, `LMS Quiz Submission`, `LMS Certificate Request`, `LMS Batch`, `Course Instructor`, and `LMS Course`.
- A shared or role-only cache key must not be used, because it could expose one instructor's course activity to another instructor.
- Short TTL caching may reduce load but can show stale dashboard activity; this should be an explicit product tradeoff.

## Security considerations

- The current endpoint does not accept frontend-provided instructor IDs, learner IDs, member IDs, or course IDs.
- Course scoping is derived from `_get_current_user_created_courses`, which uses `frappe.session.user`.
- Batch calendar scoping is derived from `_get_current_user_created_batches_for_calendar`, which also uses `frappe.session.user`.
- Safe optimizations should preserve session-scoped ownership and should not introduce frontend filters for user, member, course, batch, request, or submission identifiers.
- Any aggregation query must keep the same `course in current_user_course_names` or current-session batch ownership filter.

## Estimated files for a later implementation chunk

- `lms/lms/api.py`: consolidate/rewrite backend query patterns while preserving the endpoint response shape.
- Optional backend tests if the project has an established test location for API methods and dashboard scoping.

No frontend files should be required for a performance-only backend optimization if the JSON response shape remains unchanged.

