# Instructor Learner Growth Report

## Files Modified

- `lms/lms/api.py`
- `frontend/src/pages/Home/InstructorDashboard.vue`
- `INSTRUCTOR_LEARNER_GROWTH_REPORT.md`

## Enrollment Date Field Used

- `LMS Enrollment.creation`
- `LMS Enrollment` has no custom enrollment date field in its DocType fields. The standard DocType `creation` timestamp is used to represent enrollment row creation.

## Response Shape

`lms.lms.api.get_my_instructor_metrics` now includes:

```json
{
  "learner_growth": [
    {
      "label": "Jan",
      "count": 0
    }
  ]
}
```

Existing response fields remain unchanged:

- `my_course_count`
- `total_unique_learners`
- `average_course_progress`
- `pending_evaluations_count`
- `pending_evaluations`
- `recent_submissions`
- `course_performance`
- `courses`

## Six-Month Calculation Rule

- The backend returns the last 6 calendar months, including the current month.
- Month windows start at the first day of the month.
- Enrollment rows are counted when `LMS Enrollment.creation` is greater than or equal to the first returned month and earlier than the month after the final returned month.
- Every returned month is included, even when the count is zero.
- Counts are enrollment activity counts. Each valid `LMS Enrollment` row counts once; learners are not deduplicated.
- Course scope is derived only from `_get_current_user_created_courses()`, which uses `frappe.session.user` through the `Course Instructor` child table.

## Chart Implementation Approach

- `frontend/src/pages/Home/InstructorDashboard.vue` adds a compact HTML/CSS bar chart below the existing six dashboard cards.
- No chart package or dependency was added.
- The chart uses the existing `lms.lms.api.get_my_instructor_metrics` resource and reads `response.learner_growth`.
- No frontend input controls or API parameters were added.

## Loading, Empty, and Error Behavior

- Loading: six skeleton bar placeholders.
- Empty or all-zero data: `No enrollment activity yet`.
- Error: `Unable to load learner growth`.
- With data: each bar shows the month label and enrollment count.

## Verification Result

- Confirmed `learner_growth` is built only from `LMS Enrollment` rows where `course` is in the current session user's created-course list.
- Confirmed the no-course branch still returns exactly 6 month objects with zero counts.
- Confirmed the frontend adds no input controls and passes no API parameters.
- Confirmed no package dependencies or chart libraries were added.
- Confirmed only these files were changed for this task:
  - `lms/lms/api.py`
  - `frontend/src/pages/Home/InstructorDashboard.vue`
  - `INSTRUCTOR_LEARNER_GROWTH_REPORT.md`
