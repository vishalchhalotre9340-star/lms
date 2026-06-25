# Instructor Basic Metrics Analysis

## Scope

This analysis covers only:

- `My Courses`
- `Total Learners`

No code was changed.

## 1. Existing Frontend Pattern For Instructor-Created Courses

### Files And Functions Found

- `frontend/src/pages/Courses/Courses.vue`
  - Uses `lms.lms.utils.get_courses`
  - Applies the `created` filter when the `created` tab is selected
  - Shows the `Created` tab for `is_moderator`, `is_instructor`, and `is_evaluator`

- `frontend/src/utils/index.js`
  - `getSidebarLinks(forMobile = false)`
  - `getSidebarItems(forMobile = false)`
  - `filterStudentSidebarLinks(links)`
  - `isPureStudent()`

- `lms/lms/utils.py`
  - `get_courses(filters: dict = None, start: int = 0)`
  - `update_course_filters(filters: dict)`
  - `get_course_fields()`
  - `get_enrollment_details(courses: list)`
  - `has_course_instructor_role(member: str = None)`
  - `has_moderator_role(member: str = None)`
  - `has_evaluator_role(member: str = None)`
  - `can_modify_course(course: str) -> bool`

### Exact Pattern

The frontend course list page sets:

```js
filters.value['created'] = 1
```

when the current tab is `created`.

The backend then resolves that filter in `update_course_filters()` as:

```python
created_courses = frappe.get_all(
	"Course Instructor", {"instructor": frappe.session.user}, pluck="parent"
)
filters.update({"name": ["in", created_courses]})
```

So the course set is scoped on the server to `frappe.session.user`, not a frontend-supplied user identifier.

### Exact Returned Fields

`get_courses()` uses `get_course_fields()`, which returns:

```text
name
title
tags
image
video_link
card_gradient
short_introduction
description
published
upcoming
featured
disable_self_learning
published_on
category
status
paid_course
paid_certificate
course_price
currency
amount_usd
enable_certification
lessons
enrollments
rating
```

Then it decorates each course with:

- `instructors`
- `membership` when the current user is enrolled

### Safety

Yes, this is safely scoped to the current session user.

Reason:

- `created` is resolved on the backend from `Course Instructor.instructor = frappe.session.user`
- the frontend does not send instructor email, member ID, or course IDs for this filter

## 2. Existing Backend Data For Learner Counts

### LMS Enrollment DocType Fields

File: `lms/lms/doctype/lms_enrollment/lms_enrollment.json`

Relevant fields found:

- `member`
- `member_type`
- `role`
- `member_name`
- `course`
- `current_lesson`
- `member_username`
- `progress`
- `member_image`
- `enrollment_from_batch`
- `purchased_certificate`
- `certificate`

### Course Ownership / Creator Fields

The course model does not expose a separate `created_by` field for this use case.

Relevant fields and relations:

- `LMS Course.instructors` is a table multi-select field using `Course Instructor`
- `Course Instructor.instructor` links to `User`
- `can_modify_course(course)` checks:
  - `Course Instructor.instructor = frappe.session.user`
  - or `has_moderator_role()`

This means course ownership for these analytics flows is based on the `Course Instructor` relation, not `LMS Course.owner`.

### Existing Course Analytics / Enrollment Count APIs

Found in `lms/lms/api.py`:

- `get_chart_details()`
  - counts all `LMS Enrollment` rows globally
  - not instructor-scoped

- `get_course_progress_distribution(course: str)`
  - uses `LMS Enrollment` rows for one course
  - protected by `can_modify_course(course)`

- `get_lesson_completion_stats(course: str)`
  - uses course-specific completion data
  - protected by course-modifier roles

Found in `frontend/src/pages/Courses/CourseDashboard.vue`:

- `course.data?.enrollments` is used as the total learner count for one course
- `progressList = createListResource({ doctype: 'LMS Enrollment', filters: { course: props.course.data?.name } })`
- `chartDetails = createResource({ url: 'lms.lms.api.get_course_progress_distribution', ... })`
- `lessonProgress = createResource({ url: 'lms.lms.api.get_lesson_completion_stats', ... })`

These are per-course analytics, not aggregate instructor-dashboard metrics.

## 3. Safest Implementation Approach

### My Courses

Use the existing server-scoped `created` course filter.

Behavior:

- show only courses where the current session user is in `Course Instructor`
- do not accept instructor email or user ID from the frontend

### Total Learners

Count unique `LMS Enrollment.member` values across only the current user’s created courses.

Why this cannot be safely derived from existing frontend patterns alone:

- `course.data.enrollments` is per-course, not unique across multiple courses
- summing course enrollment totals would double-count learners enrolled in more than one course
- no existing endpoint returns a unique learner count across the entire created-course set

### Security Boundary

The frontend must not send:

- instructor email
- member ID
- arbitrary course IDs

The backend must derive all scope from `frappe.session.user`.

## 4. Moderator Behavior

Existing product behavior: moderators see the same `Created` tab as instructors and evaluators in `frontend/src/pages/Courses/Courses.vue`, and that tab still uses the session-scoped `created` filter.

So the current behavior is:

- moderators see only their own created courses
- they do not automatically see all courses in the `created` view

This is the behavior already present in the app and should be preserved unless the product explicitly changes the rule.

## 5. Safe API Options

### Safe To Reuse

- `lms.lms.utils.get_courses(filters={"created": 1})`
  - safe for `My Courses`
  - server-scoped to `frappe.session.user`

- `lms.lms.utils.get_course_fields()`
  - defines the exact course fields returned by `get_courses()`

- `lms.lms.utils.get_course_details(course)`
  - safe for a single course when the course ID is already known and access rules permit it

- `lms.lms.api.get_course_progress_distribution(course)`
  - safe for course owners / moderators
  - per-course only

- `lms.lms.api.get_lesson_completion_stats(course)`
  - safe for course owners / moderators
  - per-course only

### Not Sufficient For The Dashboard Total

- `lms.lms.api.get_chart_details()`
  - global, not instructor-scoped

- `frontend/src/pages/Courses/CourseDashboard.vue` per-course enrollment views
  - require a course ID
  - cannot produce a unique total across the instructor’s whole created-course set

## 6. Proposed Response JSON

One server-scoped endpoint is still required for `Total Learners`.

Suggested response:

```json
{
  "my_courses_count": 3,
  "total_learners": 42,
  "courses": [
    {
      "name": "COURSE-0001",
      "title": "Intro to Frappe",
      "enrollments": 12
    },
    {
      "name": "COURSE-0002",
      "title": "Advanced LMS",
      "enrollments": 30
    }
  ]
}
```

Notes:

- `my_courses_count` is the count of session-user created courses
- `total_learners` must be a unique count of `LMS Enrollment.member` across those courses
- `courses` is optional but useful if the dashboard needs to show a course list later

## 7. Security Risks

- Using `LMS Course.owner` instead of `Course Instructor.instructor` would not match the current product behavior for created courses.
- Accepting frontend-supplied course IDs would allow probing unrelated courses.
- Summing per-course `enrollments` would overcount learners who enrolled in more than one created course.
- Using `get_course_progress_distribution(course)` or `get_lesson_completion_stats(course)` directly for dashboard totals would still require per-course iteration and would not solve the uniqueness problem.

## 8. Exact Files Needed For Implementation

Backend:

- `lms/lms/api.py`
  - add a server-scoped instructor metrics endpoint

Frontend:

- `frontend/src/pages/Home/InstructorDashboard.vue`
  - consume the endpoint for `My Courses` and `Total Learners`

No router or sidebar file changes should be required for the metrics work if those routes and links already exist.

## 9. Test Cases

### Instructor

- sees only courses created by the current instructor
- `total_learners` counts unique learners across those courses
- no learner data from unrelated courses is exposed

### Moderator

- sees only their own created courses in the existing `created` flow
- `total_learners` is scoped to those created courses only
- no global course analytics leak in

### Pure Student

- does not see instructor-created metrics
- dashboard access should remain blocked by the existing role rules

