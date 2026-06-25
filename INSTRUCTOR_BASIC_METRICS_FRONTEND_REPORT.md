# Instructor Basic Metrics Frontend Report

## Changed file
- `frontend/src/pages/Home/InstructorDashboard.vue`

## API used
- `lms.lms.api.get_my_instructor_metrics`

## Behavior implemented
- `My Courses` now displays `response.my_course_count`
- `Total Learners` now displays `response.total_unique_learners`
- While the resource is loading, both cards show `...`
- If the resource fails, both cards show `—`
- The other four cards remain static placeholders

## Loaded-state helper text
- `My Courses`: `Created courses in your workspace`
- `Total Learners`: `Unique learners across your courses`

## Verification result
- `http://127.0.0.1:8080/lms/instructor-dashboard` responded with `200`
- The updated Vue SFC parsed successfully with `@vue/compiler-sfc`
- No frontend files other than `frontend/src/pages/Home/InstructorDashboard.vue` were changed for this task
