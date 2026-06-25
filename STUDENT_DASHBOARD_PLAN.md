# Student Dashboard Plan

This plan is based on `ROLE_UI_ANALYSIS.md` and the existing Frappe LMS frontend/backend structure.

No code changes were made.

## Goal

Create a dedicated student dashboard that shows:

1. My enrolled courses
2. Continue learning
3. Course progress
4. Pending quizzes
5. Pending assignments
6. Certificates

The safest approach is to reuse current learner APIs/components where they already fit, and add one small student-scoped backend API for pending assessments.

## Route To Add

Add a new Vue route:

```js
{
  path: '/student-dashboard',
  name: 'StudentDashboard',
  component: () => import('@/pages/Home/StudentDashboard.vue'),
}
```

Recommended behavior:

- Keep `/` unchanged initially to avoid breaking the existing Home route.
- In `Home.vue`, optionally route students to `StudentDashboard` later after the page is stable.
- Add a sidebar link only for `userResource.data?.is_student`.

Why this route is safe:

- It does not disturb `/courses`, `/batches`, lesson routes, enrollment, or certificates.
- It lets the new dashboard be tested independently.
- Existing `StudentHome.vue` can remain as a fallback while this dashboard is built.

## Page File To Create

Create:

```text
frontend/src/pages/Home/StudentDashboard.vue
```

Recommended structure:

- Header: greeting and small summary counters.
- Section: Continue Learning.
- Section: My Enrolled Courses.
- Section: Course Progress.
- Section: Pending Quizzes.
- Section: Pending Assignments.
- Section: Certificates.

Keep it page-level and simple. Avoid changing business logic in existing course, lesson, quiz, assignment, or certificate pages.

## Components To Reuse

### Course Cards

Reuse:

```text
frontend/src/components/CourseCard.vue
```

Use for:

- My enrolled courses
- Continue learning cards

Why:

- Already displays the existing course card format.
- Already used in `StudentHome.vue` and course lists.

### Progress Bars

Reuse:

```text
frontend/src/components/ProgressBar.vue
```

Use for:

- Course progress rows/cards.
- Continue learning card progress.

Why:

- Already used in course progress surfaces.
- Keeps visual consistency with `StudentCourseProgress.vue` and course dashboards.

### Existing Student Home Patterns

Reference:

```text
frontend/src/pages/Home/StudentHome.vue
```

Reuse patterns for:

- `createResource`
- `CourseCard`
- routing to `CourseDetail`
- responsive course card grids

Do not copy all of `StudentHome`; use it as the current baseline for enrolled course/batch sections.

### Certificates UI Pattern

Reference:

```text
frontend/src/pages/ProfileCertificates.vue
frontend/src/pages/Courses/CourseCertification.vue
```

Reuse pattern for:

- Loading certificates through `createListResource`.
- Showing course/batch title and issue date.
- Opening certificate PDF through:

```text
/api/method/frappe.utils.print_format.download_pdf
```

Potential future cleanup:

- Extract a reusable `CertificateCard.vue` if certificate cards appear in more than one place.

### Evaluation/Upcoming UI

Optional reuse:

```text
frontend/src/components/UpcomingEvaluations.vue
```

Not required by the requested dashboard list, but useful if certification/evaluation status is shown near Certificates.

### Do Not Reuse Directly

Avoid directly reusing:

```text
frontend/src/pages/Courses/StudentCourseProgress.vue
```

Reason:

- It is currently an instructor/admin modal for inspecting a selected student.
- It calls `lms.lms.api.get_course_assessment_progress`, which currently requires `can_modify_course(course)`.
- That permission shape is not student-dashboard-safe.

You can reuse its layout ideas, status badges, and `ProgressBar`, but not the component as-is.

## Existing APIs To Reuse

### Current User

Use existing:

```text
lms.lms.api.get_user_info
```

Frontend source:

```text
frontend/src/stores/user.js
```

Purpose:

- Confirm the current user is a student.
- Get `user.data.name`, `user.data.username`, `user.data.full_name`, and role flags.

### My Enrolled Courses

Preferred existing API:

```text
lms.lms.utils.get_courses
```

Call through `createListResource` with:

```js
{
  filters: {
    enrolled: 1,
  },
}
```

Why this is better than `get_my_courses()`:

- `lms.lms.api.get_my_courses()` returns only the latest 3 courses and falls back to featured/popular courses when the student has no enrollments.
- A dashboard section named "My enrolled courses" should not show popular fallback courses.
- `get_courses` already supports the `enrolled` filter and attaches `membership` with:
  - enrollment name
  - course
  - current lesson
  - progress
  - member

Relevant backend:

```text
lms/lms/utils.py
```

Functions:

- `get_courses`
- `update_course_filters`
- `get_enrollment_details`

### Continue Learning

Reuse enrolled courses data from:

```text
lms.lms.utils.get_courses
```

Use courses where:

```js
course.membership?.progress < 100
```

and sort locally by available membership/progress data.

For the lesson URL, there are two options:

Option A, no new backend:

- Link to the course detail route:

```js
{ name: 'CourseDetail', params: { courseName: course.name } }
```

This is safe and uses the existing course detail/overlay behavior.

Option B, better UX with a small backend addition:

- Add current lesson index/URL to a student dashboard API.
- This avoids per-course `get_course_details()` calls just to compute `current_lesson` route information.

Existing helper that can be reused server-side:

```text
lms.lms.utils.get_lesson_index
```

### Course Progress

Use existing enrollment membership fields from `get_courses(enrolled=1)`:

```text
course.membership.progress
```

For a progress-only list, an alternative existing generic resource is:

```text
DocType: LMS Enrollment
```

with filters:

```js
{
  member: user.data?.name,
}
```

Fields:

- `name`
- `course`
- `progress`
- `current_lesson`
- `modified`

Recommended first implementation:

- Use the `membership.progress` already attached to enrolled course cards.
- Avoid a second enrollment list request unless the dashboard needs a separate table.

### Certificates

Use existing generic list resource:

```text
DocType: LMS Certificate
```

Filters:

```js
{
  member: user.data?.name,
}
```

Fields:

- `name`
- `course_title`
- `batch_title`
- `issue_date`
- `template`

Reference implementation:

```text
frontend/src/pages/ProfileCertificates.vue
```

This is already suitable for the Certificates dashboard section.

### Existing But Not Directly Student-Safe: Assessment Progress

Existing API:

```text
lms.lms.api.get_course_assessment_progress(course, member)
```

It returns:

- quizzes
- assignments
- programming exercises

But it currently checks:

```python
if not can_modify_course(course):
    frappe.throw(...)
```

That makes it instructor/moderator-oriented, not safe to call from a student dashboard.

Do not loosen this method directly unless every existing caller is audited. A student dashboard should get a separate method scoped to `frappe.session.user`.

## Backend API Needed

Add one new student-scoped API:

```text
lms.lms.api.get_student_dashboard
```

or, if keeping it narrower:

```text
lms.lms.api.get_student_pending_assessments
```

Recommended: `get_student_dashboard`

Reason:

- It can return one compact payload for all dashboard cards.
- It avoids N+1 frontend calls for every enrolled course.
- It keeps student permissions explicit.

### Suggested Response Shape

```python
{
    "enrolled_courses": [
        {
            "name": "...",
            "title": "...",
            "image": "...",
            "card_gradient": "...",
            "progress": 45,
            "current_lesson": "...",
            "current_lesson_index": "1-3",
            "current_lesson_title": "...",
        }
    ],
    "continue_learning": [
        {
            "course": "...",
            "course_title": "...",
            "progress": 45,
            "current_lesson": "...",
            "current_lesson_index": "1-3",
            "current_lesson_title": "...",
            "route": "/courses/course-name/learn/1-3",
        }
    ],
    "pending_quizzes": [
        {
            "course": "...",
            "course_title": "...",
            "lesson": "...",
            "lesson_title": "...",
            "quiz": "...",
            "quiz_title": "...",
            "route": "/quiz/quiz-id",
        }
    ],
    "pending_assignments": [
        {
            "course": "...",
            "course_title": "...",
            "lesson": "...",
            "lesson_title": "...",
            "assignment": "...",
            "assignment_title": "...",
            "status": "Not Submitted",
            "route": "/assignment-submission/assignment-id/submission-name",
        }
    ],
    "certificates": [
        {
            "name": "...",
            "course_title": "...",
            "batch_title": "...",
            "issue_date": "...",
            "template": "...",
        }
    ],
}
```

### Permission Rules For New API

The new API should:

- Require logged-in user.
- Use `frappe.session.user` as the member.
- Never accept arbitrary `member` from the frontend.
- Only include courses where an `LMS Enrollment` exists for the current user.
- Only include certificates where `LMS Certificate.member == frappe.session.user`.
- Only include quizzes/assignments attached to enrolled courses.

### Server-Side Helpers To Reuse

Existing helpers:

- `get_course_details(course)`
- `get_course_outline(course, progress=True)`
- `get_lesson_index(lesson)`
- `get_assessment_from_lesson(course, assessment_type)`
- `get_course_quiz_progress(course, member)`
- `get_course_assignment_progress(course, member)`

Important caveat:

- `get_course_quiz_progress` and `get_course_assignment_progress` are currently helper functions under the admin-facing `get_course_assessment_progress` flow. They can be reused inside a new student-scoped API if the API first proves the current user is enrolled in the course.

## Widget Plan

### 1. My Enrolled Courses

Frontend:

- Use `CourseCard.vue`.
- Data from either:
  - `get_courses({ enrolled: 1 })`
  - or `get_student_dashboard.enrolled_courses`

Behavior:

- Show all enrolled courses or the first 4-6 with a "See all" link to `/courses?tab=enrolled` if query support is added later.
- Card click goes to `CourseDetail`.

### 2. Continue Learning

Frontend:

- Use `CourseCard.vue` plus `ProgressBar.vue`, or a compact list row.

Data:

- Use course membership:
  - `membership.progress`
  - `membership.current_lesson`

Best route:

```js
{ name: 'Lesson', params: { courseName, chapterNumber, lessonNumber } }
```

If lesson index is not available yet, link to:

```js
{ name: 'CourseDetail', params: { courseName } }
```

### 3. Course Progress

Frontend:

- Use `ProgressBar.vue`.
- Show progress per enrolled course.

Data:

- `course.membership.progress`
- or `LMS Enrollment.progress`

No backend change required if using `get_courses(enrolled=1)`.

### 4. Pending Quizzes

Frontend:

- Create simple dashboard list/cards in `StudentDashboard.vue`.
- Reuse badge/status styles from `StudentCourseProgress.vue`.

Data:

- Needs new student-scoped API.

Pending logic:

- Quiz is pending if:
  - quiz is attached to a lesson in an enrolled course, and
  - there is no latest `LMS Quiz Submission` for `frappe.session.user`, or
  - latest score/percentage is below passing percentage.

Avoid:

- Calling `get_course_assessment_progress` directly from the student dashboard because it currently requires course modification permission.

### 5. Pending Assignments

Frontend:

- Create simple dashboard list/cards in `StudentDashboard.vue`.
- Link to assignment submission flow where possible.

Data:

- Needs new student-scoped API.

Pending logic:

- Assignment is pending if:
  - assignment is attached to a lesson in an enrolled course, and
  - there is no `LMS Assignment Submission` for current user, or
  - submission status is not a completed/pass state if the app uses status as completion indicator.

Existing helper:

- `get_course_assignment_progress(course, member)` already returns `Not Submitted` when no submission exists.

### 6. Certificates

Frontend:

- Reuse `ProfileCertificates.vue` pattern.
- Consider extracting `CertificateCard.vue` later.

Data:

- Existing `createListResource` for `LMS Certificate`.

No backend change required.

## Safe Implementation Steps

### Step 1: Add Route Only

Add `StudentDashboard` route to:

```text
frontend/src/router.js
```

Route:

```text
/student-dashboard
```

Do not redirect `/` yet.

### Step 2: Create Page Shell

Create:

```text
frontend/src/pages/Home/StudentDashboard.vue
```

Initial shell:

- Load `$user`.
- Redirect non-students to `Home` or `Courses`.
- Render empty section containers.
- Add page metadata through `usePageMeta`.

### Step 3: Reuse Existing Enrolled Course Data

Add `createListResource` for:

```text
lms.lms.utils.get_courses
```

with:

```js
filters: { enrolled: 1 }
```

Render:

- My enrolled courses
- Course progress
- Basic continue learning linking to course detail

This step requires no backend change.

### Step 4: Add Certificates Section

Add `createListResource` for:

```text
LMS Certificate
```

with:

```js
filters: { member: user.data?.name }
```

Render certificate cards using the existing `ProfileCertificates.vue` behavior.

This step requires no backend change.

### Step 5: Add Student-Scoped Backend API For Pending Assessments

Add:

```text
lms.lms.api.get_student_dashboard
```

or:

```text
lms.lms.api.get_student_pending_assessments
```

Recommended first version:

```text
get_student_pending_assessments
```

Return:

- `pending_quizzes`
- `pending_assignments`

Keep enrollment checks inside the method.

Do not modify `get_course_assessment_progress` because it is currently admin/instructor scoped.

### Step 6: Wire Pending Widgets

In `StudentDashboard.vue`:

- Use `createResource` for the new pending-assessments API.
- Show loading/empty states.
- Link quiz rows to `/quiz/:quizID`.
- Link assignment rows to the safest existing assignment route available for that assignment/submission state.

### Step 7: Add Navigation

Add a sidebar link for students only.

Best place:

```text
frontend/src/utils/index.js
```

Inside `getSidebarLinks()`, add a student-only dashboard item, or update existing Home label/target for students.

Safer first option:

- Add a "Dashboard" sidebar item conditionally for `is_student`.
- Keep existing Home route unchanged.

### Step 8: Optional Home Integration

After testing:

- `Home.vue` can render `StudentDashboard` instead of `StudentHome`.
- Or `/` can redirect students to `/student-dashboard`.

Recommended:

- Render `StudentDashboard` inside `Home.vue` first.
- Avoid hard redirects until bookmarks/sidebar behavior is confirmed.

### Step 9: Test Cases

Test with:

- Student with no enrollments.
- Student with one enrolled course, 0% progress.
- Student with partially completed course and `current_lesson`.
- Student with completed course.
- Student with pending quiz.
- Student with failed quiz below passing percentage.
- Student with submitted assignment.
- Student with no certificates.
- Student with one or more certificates.
- Instructor/moderator visiting `/student-dashboard`.

Expected behavior:

- Student sees dashboard.
- Non-student is redirected or sees an access message.
- No admin-only API is called from the student dashboard.
- No route or business logic changes affect existing `/courses`, `/batches`, `/quiz`, or lesson pages.

## Summary

The safest student dashboard plan is:

- Add route: `/student-dashboard`
- Add page: `frontend/src/pages/Home/StudentDashboard.vue`
- Reuse:
  - `CourseCard.vue`
  - `ProgressBar.vue`
  - `ProfileCertificates.vue` certificate loading pattern
  - `StudentHome.vue` enrolled course layout patterns
  - `lms.lms.utils.get_courses` with `enrolled: 1`
  - `LMS Certificate` list resource
- Add one new student-scoped backend API for pending quizzes and assignments.

This keeps the implementation mostly frontend-compositional while adding backend logic only where the current APIs are not safe for student use.
