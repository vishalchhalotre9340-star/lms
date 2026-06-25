# Instructor Dashboard Plan

This plan is based on `ROLE_UI_ANALYSIS.md` and the current Frappe LMS frontend/backend structure.

No code changes were made.

## Goal

Create a dedicated instructor dashboard that shows:

1. My created courses
2. Total enrolled students
3. Course progress summary
4. Quiz submissions
5. Assignment submissions
6. Unpublished courses

The safest approach is to add the dashboard as a separate instructor-only page first, reuse existing course and analytics components, and add one instructor-scoped backend API for aggregate totals and recent submissions.

## Route To Add

Add a new Vue route:

```js
{
  path: '/instructor-dashboard',
  name: 'InstructorDashboard',
  component: () => import('@/pages/Home/InstructorDashboard.vue'),
}
```

Recommended behavior:

- Keep `/` unchanged initially. It currently renders `AdminHome.vue` for instructors.
- Add the new route independently so it can be tested without disrupting `Home.vue`, `/courses`, course detail, lesson editing, quizzes, or assignments.
- Add a sidebar link only after the page works correctly.
- Later, optionally update `Home.vue` so pure instructors land on `InstructorDashboard` instead of `AdminHome`.

Safe access condition:

```js
user.data?.is_instructor || user.data?.is_moderator
```

For an instructor-focused dashboard, the backend should still scope course data to courses where the current user is listed in `Course Instructor`. Moderator behavior can be decided separately: either show all courses through a moderator dashboard, or show only moderator-created/instructed courses here.

## Page File To Create

Create:

```text
frontend/src/pages/Home/InstructorDashboard.vue
```

Recommended page sections:

- Header with instructor name and summary counters.
- My Created Courses.
- Total Enrolled Students.
- Course Progress Summary.
- Quiz Submissions.
- Assignment Submissions.
- Unpublished Courses.

Keep the page as a dashboard/overview. Do not move or rewrite the existing course editor, course settings, quiz builder, assignment builder, or per-course dashboard.

## Components To Reuse

### Course Cards

Reuse:

```text
frontend/src/components/CourseCard.vue
```

Use for:

- My created courses
- Unpublished courses

Current references:

```text
frontend/src/pages/Home/AdminHome.vue
frontend/src/pages/Courses/Courses.vue
```

Why:

- Existing course card styling and route behavior are already consistent.
- `AdminHome.vue` already shows instructor-created courses with `CourseCard`.

### Summary Cards And Charts

Reuse:

```text
frontend/src/components/NumberChartGraph.vue
frontend/src/components/ProgressBar.vue
```

Use for:

- Total enrolled students
- Average course progress
- Per-course progress rows
- Submission counters

Current reference:

```text
frontend/src/pages/Courses/CourseDashboard.vue
```

Why:

- `CourseDashboard.vue` already displays enrolled students, average completion rate, progress distribution, and lesson completion statistics.
- Reusing its visual components keeps the new dashboard consistent with the existing course-level analytics page.

### Submission Lists

Reuse Frappe UI list/table patterns from:

```text
frontend/src/pages/QuizSubmissionList.vue
frontend/src/pages/AssignmentSubmissionList.vue
```

Use for:

- Recent quiz submissions
- Recent assignment submissions
- Status/score columns
- Links to submission detail pages

Do not reuse these pages directly as embedded components unless they are first refactored. They are currently route-level pages and expect route-specific context.

### Empty And Layout Patterns

Reuse patterns from:

```text
frontend/src/pages/Home/AdminHome.vue
frontend/src/components/EmptyStateLayout.vue
```

Use for:

- No created courses
- No submissions yet
- No unpublished courses

## Existing APIs To Reuse

### Current User And Role Flags

Use existing:

```text
lms.lms.api.get_user_info
```

Frontend source:

```text
frontend/src/stores/user.js
```

Purpose:

- Confirm `is_instructor` or `is_moderator`.
- Read the current user's identity.
- Avoid accepting an arbitrary instructor from the client.

### My Created Courses

Existing option:

```text
lms.lms.utils.get_courses
```

Call with:

```js
{
  filters: {
    created: 1,
  },
}
```

Backend behavior:

```text
lms/lms/utils.py
```

`update_course_filters()` converts `created: 1` into a course filter based on `Course Instructor.instructor == frappe.session.user`.

Why this is preferred:

- It supports instructor-owned courses.
- It returns course-card-ready data.
- It is already used by `Courses.vue`.

### Unpublished Courses

Reuse:

```text
lms.lms.utils.get_courses
```

Call with:

```js
{
  filters: {
    created: 1,
    published: 0,
  },
}
```

Important note:

- `Courses.vue` currently sets only `published: 0` for the Unpublished tab, so moderators can see unpublished courses broadly.
- For the instructor dashboard, include `created: 1` to keep the section scoped to the current instructor.

### Per-Course Progress

Reuse:

```text
lms.lms.api.get_course_progress_distribution
```

Current reference:

```text
frontend/src/pages/Courses/CourseDashboard.vue
```

Purpose:

- Average progress for a course.
- Progress distribution buckets for a course.

Limitation:

- This API works per course. Calling it for every created course from the frontend can create many requests.
- It is acceptable for a first version with a small limit, but an aggregate instructor dashboard API is better for production.

### Per-Course Enrollment List

Existing pattern:

```text
createListResource({
  doctype: 'LMS Enrollment',
  filters: { course },
})
```

Current reference:

```text
frontend/src/pages/Courses/CourseDashboard.vue
```

Limitation:

- This is useful inside one course dashboard.
- It is not ideal for total enrolled students across all instructor-created courses because the frontend would need one query per course or broad list permissions.

## Backend API Needed

Add one instructor-scoped backend method:

```text
lms.lms.api.get_instructor_dashboard
```

Recommended response shape:

```py
{
    "created_courses": [],
    "unpublished_courses": [],
    "total_enrolled_students": 0,
    "unique_enrolled_students": 0,
    "course_progress_summary": [],
    "quiz_submissions": [],
    "assignment_submissions": [],
    "summary": {
        "created_courses": 0,
        "published_courses": 0,
        "unpublished_courses": 0,
        "quiz_submissions": 0,
        "assignment_submissions": 0,
    },
}
```

Recommended backend rules:

- Use `frappe.session.user`; do not accept an instructor email/name from the frontend.
- Require `Course Creator` or `Moderator`.
- Build the course list from `Course Instructor` where `instructor == frappe.session.user`.
- For every returned course, confirm access with the existing permission helper where practical, such as `can_modify_course(course)`.
- Keep moderator-wide analytics out of this API unless the route is intentionally made moderator-wide.
- Return only fields needed by the dashboard.
- Apply limits to submissions, for example latest 10 quiz submissions and latest 10 assignment submissions.

### Total Enrolled Students

Use:

```text
LMS Enrollment
```

Recommended fields:

- `course`
- `member`
- `progress`

Recommended metrics:

- `total_enrolled_students`: count enrollment rows for instructor-created courses.
- `unique_enrolled_students`: distinct member count across instructor-created courses.

Use both if possible because one student can be enrolled in multiple courses.

### Course Progress Summary

Use:

```text
LMS Enrollment.progress
```

Recommended per-course fields:

- `course`
- `title`
- `enrollments`
- `average_progress`
- `not_started`
- `in_progress`
- `completed`

This can reuse the logic from:

```text
lms.lms.api.get_course_progress_distribution
```

Do not call the whitelisted method recursively for each course. Extract shared internal logic only if implementation later needs to avoid duplication.

### Quiz Submissions

Use:

```text
LMS Quiz Submission
```

Recommended fields:

- `name`
- `quiz`
- `quiz_title`
- `course`
- `member`
- `member_name`
- `score`
- `percentage`
- `creation`

Scope rule:

- Include submissions only where the submission course, quiz course, or lesson-derived course belongs to the current instructor's created courses.

Existing references:

```text
frontend/src/pages/QuizSubmissionList.vue
lms/lms/api.py:get_course_assessment_progress
```

### Assignment Submissions

Use:

```text
LMS Assignment Submission
```

Recommended fields:

- `name`
- `assignment`
- `assignment_title`
- `course`
- `member`
- `member_name`
- `status`
- `creation`

Scope rule:

- Include submissions only where the assignment belongs to a lesson/course owned by the current instructor.

Existing references:

```text
frontend/src/pages/AssignmentSubmissionList.vue
lms/lms/api.py:get_course_assessment_progress
```

## Safe Implementation Steps

1. Add the `/instructor-dashboard` route only.
2. Create `frontend/src/pages/Home/InstructorDashboard.vue` with a minimal shell and role guard.
3. Load created courses using `lms.lms.utils.get_courses` with `created: 1`.
4. Load unpublished courses using `lms.lms.utils.get_courses` with `created: 1` and `published: 0`.
5. Add `lms.lms.api.get_instructor_dashboard` for aggregate totals, progress summaries, and recent submissions.
6. Render summary counters with `NumberChartGraph`.
7. Render course progress rows with `ProgressBar` and link each row to the existing `CourseDetail` dashboard tab.
8. Render quiz submissions using the table pattern from `QuizSubmissionList.vue`.
9. Render assignment submissions using the table pattern from `AssignmentSubmissionList.vue`.
10. Add empty states for no courses, no unpublished courses, and no submissions.
11. Add the sidebar link for `is_instructor || is_moderator` only after the page loads correctly.
12. Optionally update `Home.vue` later so pure instructors see `InstructorDashboard` instead of `AdminHome`.

## Recommended Route Links

Course card/details:

```js
{ name: 'CourseDetail', params: { courseName: course.name } }
```

Quiz submission detail:

```js
{ name: 'QuizSubmission', params: { submission: submission.name } }
```

Assignment submission detail:

```js
{
  name: 'AssignmentSubmission',
  params: {
    assignmentID: submission.assignment,
    submissionName: submission.name,
  },
}
```

## Permission And Safety Notes

- Do not trust course names or instructor names sent by the client.
- Do not expose submissions for courses outside the instructor's created course list.
- Do not loosen existing quiz, assignment, course, or enrollment permissions.
- Do not replace `CourseDashboard.vue`; the instructor dashboard should link into it for course-specific detail.
- Do not mix moderator-wide reporting into this page unless a moderator dashboard is intentionally merged with the instructor dashboard.
- Keep first implementation read-only. Creation, publishing, enrollment management, grading, and review actions should continue to live in existing pages.

## Test Plan

Test with these users/data states:

- Instructor with no created courses.
- Instructor with created published courses.
- Instructor with unpublished courses.
- Instructor with enrolled students across multiple courses.
- Instructor with quiz submissions.
- Instructor with assignment submissions.
- Instructor opening a course they do not instruct.
- Student attempting to open `/instructor-dashboard`.
- Moderator opening `/instructor-dashboard`.

Expected results:

- Students are redirected away or shown an access-safe empty state.
- Instructors see only their own created courses and related analytics.
- Unpublished courses are limited to the instructor's own courses.
- Submission lists do not include submissions from unrelated courses.
- Existing `/`, `/courses`, course detail, quiz, and assignment routes continue to work unchanged.

## Important Files To Study First

Start with:

```text
ROLE_UI_ANALYSIS.md
frontend/src/pages/Home/Home.vue
frontend/src/pages/Home/AdminHome.vue
frontend/src/pages/Courses/Courses.vue
frontend/src/pages/Courses/CourseDashboard.vue
frontend/src/pages/Courses/CourseDetail.vue
frontend/src/pages/QuizSubmissionList.vue
frontend/src/pages/AssignmentSubmissionList.vue
frontend/src/router.js
frontend/src/utils/index.js
frontend/src/stores/user.js
lms/lms/api.py
lms/lms/utils.py
```

Most useful existing backend functions:

```text
lms.lms.api.get_user_info
lms.lms.api.get_created_courses
lms.lms.api.get_course_progress_distribution
lms.lms.api.get_lesson_completion_stats
lms.lms.api.get_course_assessment_progress
lms.lms.utils.get_courses
```

Most useful existing frontend components:

```text
frontend/src/components/CourseCard.vue
frontend/src/components/NumberChartGraph.vue
frontend/src/components/ProgressBar.vue
frontend/src/components/EmptyStateLayout.vue
```
