# Sidebar Role Test Report

## Role Precedence

The student-only sidebar applies only when all of these are true:

- `is_student === true`
- `is_instructor !== true`
- `is_moderator !== true`
- `is_evaluator !== true`
- `is_system_manager !== true`

Any elevated role preserves the existing sidebar behavior.

## Expected Links

### Student only

- Dashboard
- Courses
- Batches, when enabled by sidebar settings

Hidden for student-only users:

- Statistics
- Jobs
- Certifications
- Quizzes
- Assignments
- Programming Exercises
- Other instructor/admin-only links

### Student + Instructor

Existing instructor sidebar is preserved. The student-only filter does not apply.

Expected existing links include the normal learning/sidebar items available to instructors, including instructor/admin assessment links where existing conditions allow them.

### Student + Moderator

Existing moderator sidebar is preserved. The student-only filter does not apply.

Expected existing links include the normal learning/sidebar items available to moderators, including moderator/admin assessment links where existing conditions allow them.

### Student + Evaluator

Existing evaluator sidebar is preserved. The student-only filter does not apply.

Expected existing links include the normal learning/sidebar items available to evaluators, including evaluator assessment links where existing conditions allow them.

### System Manager

Existing system manager sidebar is preserved. The student-only filter does not apply, even if the user also has student access.

Expected existing links include the normal system manager/sidebar items available through current settings and existing conditions.
