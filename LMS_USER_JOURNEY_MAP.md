# LMS User Journey Map

Scope: role-wise user journeys for Guest, Student, Instructor, and Moderator/Admin in the current Frappe LMS project.

Source note: `STUDENT_DASHBOARD_PLAN.md` and `INSTRUCTOR_DASHBOARD_PLAN.md` were read. `ROLE_PERMISSION_MATRIX.md` was requested but is not present in this checkout, so role/permission details were derived from `ROLE_UI_ANALYSIS.md` and the current Vue/backend source.

No source code changes were made.

## Role And Permission Basis

The frontend role flags come from:

```text
lms.lms.api.get_user_info
frontend/src/stores/user.js
```

Main flags:

- `is_student`: user is not instructor, moderator, or evaluator
- `is_instructor`: user has `Course Creator`
- `is_moderator`: user has `Moderator`
- `is_evaluator`: user has `Batch Evaluator`
- `is_system_manager`: user has `System Manager`

Most Vue routes are shared. The page components decide what to show based on these role flags and backend permissions.

## 1. Guest Journey

Guests can browse public LMS content if guest access is enabled. If guest access is disabled, the router redirects unauthenticated users to `/login`.

| Step | Route | Vue Page / Component | Backend API | Main DocTypes |
| --- | --- | --- | --- | --- |
| Landing page | `/` redirects to `/courses` for unauthenticated users | `frontend/src/pages/Home/Home.vue`, then `frontend/src/pages/Courses/Courses.vue` | `lms.lms.api.get_lms_settings`, `lms.lms.utils.get_courses` | `LMS Settings`, `LMS Course`, `Course Instructor`, `LMS Category` |
| Course browsing | `/courses` | `frontend/src/pages/Courses/Courses.vue`, `frontend/src/components/CourseCard.vue` | `lms.lms.utils.get_courses` | `LMS Course`, `Course Instructor`, `LMS Enrollment`, `LMS Category` |
| Course detail preview | `/courses/:courseName` | `frontend/src/pages/Courses/CourseDetail.vue`, `frontend/src/pages/Courses/CourseOverview.vue` | `lms.lms.utils.get_course_details`, `lms.lms.utils.get_course_outline` | `LMS Course`, `Course Chapter`, `Chapter Reference`, `Course Lesson`, `Lesson Reference`, `LMS Course Review` |
| Signup | `/login` / Frappe signup flow | Frappe auth pages outside the Vue router | `lms.lms.user.sign_up` | `User`, `Role`, `Portal Settings` |
| Login before enrollment | `/login?redirect-to=...` | Frappe login page outside the Vue router | Frappe session login, then `lms.lms.api.get_user_info` | `User`, `Role` |
| Enrollment attempt | `/courses/:courseName` or `/billing/course/:courseName` | `CourseCardOverlay.vue`, `Billing.vue` | Free course: `frappe.client.insert`; paid course: billing/order helpers and `lms.lms.utils.enroll_in_course` after payment | `LMS Enrollment`, `LMS Course`, `LMS Payment`, `LMS Coupon` |

Guest flow summary:

1. Guest lands on `/`.
2. Router sends unauthenticated Home visits to `/courses`.
3. Guest browses published courses.
4. Guest opens course overview.
5. Guest clicks enroll or restricted lesson/quiz action.
6. App redirects to `/login?redirect-to=...`.
7. After signup/login, the user continues as Student.

## 2. Student Journey

Students are the default authenticated learners. Their current home page is `StudentHome.vue`. The planned dashboard route from `STUDENT_DASHBOARD_PLAN.md` is `/student-dashboard`, but it does not exist yet.

| Step | Route | Vue Page / Component | Backend API | Main DocTypes |
| --- | --- | --- | --- | --- |
| Login | `/login` then `/` or redirected path | Frappe login page, then `Home.vue` | Frappe auth, `lms.lms.api.get_user_info` | `User`, `Role` |
| Current dashboard | `/` | `frontend/src/pages/Home/Home.vue`, `frontend/src/pages/Home/StudentHome.vue` | `lms.lms.api.get_my_courses`, `lms.lms.api.get_my_batches`, `lms.lms.api.get_my_live_classes`, `lms.lms.api.get_streak_info` | `LMS Enrollment`, `LMS Batch Enrollment`, `LMS Live Class`, `LMS Course Progress`, `LMS Quiz Submission`, `LMS Assignment Submission` |
| Planned dashboard | `/student-dashboard` | Planned `frontend/src/pages/Home/StudentDashboard.vue` | Reuse `lms.lms.utils.get_courses`; planned student-scoped pending assessment API | `LMS Enrollment`, `LMS Course`, `LMS Quiz`, `LMS Quiz Submission`, `LMS Assignment`, `LMS Assignment Submission`, `LMS Certificate` |
| Course browsing | `/courses` | `frontend/src/pages/Courses/Courses.vue` | `lms.lms.utils.get_courses` with student filters such as `enrolled: 1` | `LMS Course`, `LMS Enrollment`, `Course Instructor` |
| Course enrollment | `/courses/:courseName` or `/billing/course/:courseName` | `CourseOverview.vue`, `CourseCardOverlay.vue`, `Billing.vue` | Free course: `frappe.client.insert` into `LMS Enrollment`; paid course: `lms.lms.utils.enroll_in_course` after payment | `LMS Course`, `LMS Enrollment`, `LMS Payment`, `LMS Coupon` |
| Course outline | `/courses/:courseName` | `CourseOverview.vue`, `CourseOutline.vue` | `lms.lms.utils.get_course_outline` | `LMS Course`, `Course Chapter`, `Chapter Reference`, `Course Lesson`, `Lesson Reference`, `LMS Course Progress` |
| Lesson view | `/courses/:courseName/learn/:chapterNumber-:lessonNumber` | `frontend/src/pages/Lesson.vue` | `lms.lms.utils.get_lesson` | `Course Lesson`, `Course Chapter`, `LMS Course Progress`, `LMS Lesson Note`, `LMS Video Watch Duration` |
| Lesson completion | `/courses/:courseName/learn/:chapterNumber-:lessonNumber` | `Lesson.vue` | `lms.lms.doctype.course_lesson.course_lesson.save_progress`, `lms.lms.api.mark_lesson_progress`, `lms.lms.api.track_video_watch_duration` | `LMS Course Progress`, `LMS Enrollment`, `Course Lesson`, `LMS Video Watch Duration` |
| Quiz attempt | `/quiz/:quizID` or embedded in lesson | `frontend/src/pages/QuizPage.vue`, `frontend/src/components/Quiz.vue`, `QuizBlock.vue` | `lms.lms.utils.get_quiz_with_questions`, `lms.lms.doctype.lms_quiz.lms_quiz.submit_quiz` | `LMS Quiz`, `LMS Question`, `LMS Quiz Question`, `LMS Quiz Submission`, `LMS Quiz Result`, `LMS Option` |
| Assignment submission | `/assignment-submission/:assignmentID/:submissionName` or embedded in lesson | `frontend/src/pages/AssignmentSubmission.vue`, `frontend/src/components/Assignment.vue` | `frappe.client.get`, `frappe.client.insert`, document update APIs, `lms.lms.api.mark_lesson_progress` | `LMS Assignment`, `LMS Assignment Submission`, `Course Lesson`, `LMS Course Progress` |
| Certificate generation | `/courses/:courseName/certification` or course overlay | `CourseCertification.vue`, `CourseCardOverlay.vue`, `ProfileCertificates.vue` | `lms.lms.doctype.lms_certificate.lms_certificate.create_certificate`, `frappe.client.get_value`, PDF download through Frappe print format | `LMS Certificate`, `LMS Enrollment`, `LMS Course`, `LMS Certificate Request` |
| Profile certificates | `/user/:username/certificates` | `frontend/src/pages/Profile.vue`, `frontend/src/pages/ProfileCertificates.vue` | Generic `createListResource` on `LMS Certificate` | `LMS Certificate`, `User` |

Student flow summary:

1. Student logs in and reaches `/`.
2. `Home.vue` renders `StudentHome.vue`.
3. Student browses `/courses` or opens enrolled courses from home.
4. Student enrolls if needed.
5. Student opens a course and starts lessons.
6. Lesson progress is saved in `LMS Course Progress` and reflected in `LMS Enrollment.progress`.
7. Student attempts quizzes and creates `LMS Quiz Submission` records.
8. Student submits assignments through `LMS Assignment Submission`.
9. When eligibility rules pass, certificate generation creates an `LMS Certificate`.

## 3. Instructor Journey

Instructors have the `Course Creator` role. The current home page for instructors is `AdminHome.vue`. The planned dashboard route from `INSTRUCTOR_DASHBOARD_PLAN.md` is `/instructor-dashboard`, but it does not exist yet.

| Step | Route | Vue Page / Component | Backend API | Main DocTypes |
| --- | --- | --- | --- | --- |
| Login | `/login` then `/` | Frappe login page, then `Home.vue` | Frappe auth, `lms.lms.api.get_user_info` | `User`, `Role` |
| Current dashboard | `/` | `frontend/src/pages/Home/Home.vue`, `frontend/src/pages/Home/AdminHome.vue` | `lms.lms.api.get_created_courses`, `lms.lms.api.get_created_batches`, `lms.lms.api.get_admin_live_classes`, `lms.lms.api.get_admin_evals` | `LMS Course`, `Course Instructor`, `LMS Batch`, `LMS Live Class`, `LMS Certificate Request` |
| Planned dashboard | `/instructor-dashboard` | Planned `frontend/src/pages/Home/InstructorDashboard.vue` | Reuse `lms.lms.utils.get_courses`; planned `lms.lms.api.get_instructor_dashboard` | `LMS Course`, `Course Instructor`, `LMS Enrollment`, `LMS Quiz Submission`, `LMS Assignment Submission` |
| Course creation | `/courses?newCourse=1` | `Courses.vue`, `NewCourseModal.vue` | `frappe.client.insert`, `lms.lms.api.search_users_by_role` | `LMS Course`, `Course Instructor`, `User`, `Role` |
| Course settings/editing | `/courses/:courseName` Settings tab | `CourseDetail.vue`, `CourseForm.vue` | `createDocumentResource` on `LMS Course`, `frappe.client.set_value`, `lms.lms.api.delete_course` | `LMS Course`, `Course Instructor`, `Related Courses`, `LMS Category` |
| Course publishing | `/courses/:courseName` | `CourseDetail.vue`, `CoursePublishSettings.vue`, `CourseForm.vue` | Frappe document save/set value on `LMS Course.published`; validation in `lms_course.py` | `LMS Course`, `Course Instructor`, `LMS Course Interest` |
| Course outline editing | `/courses/:courseName` Course editor tab | `CourseDetail.vue`, `CourseEditor.vue`, `CourseOutline.vue` | `lms.lms.utils.get_course_outline`, `lms.lms.api.upsert_chapter`, `lms.lms.api.update_chapter_index`, `lms.lms.api.delete_chapter` | `LMS Course`, `Course Chapter`, `Chapter Reference`, `Course Lesson`, `Lesson Reference` |
| Lesson creation | Course editor lesson form route/action | `frontend/src/pages/LessonForm.vue` | `lms.lms.utils.get_lesson_creation_details`, `frappe.client.insert`, `frappe.client.set_value` | `Course Lesson`, `Course Chapter`, `Lesson Reference`, `File`, `LMS Quiz`, `LMS Assignment` |
| Quiz creation | `/quizzes` and `/quizzes/:quizID` | `frontend/src/pages/Quizzes.vue`, `frontend/src/pages/QuizForm.vue` | `createDocumentResource` on `LMS Quiz`, `frappe.client.insert/update`, `lms.lms.api.delete_documents` | `LMS Quiz`, `LMS Question`, `LMS Quiz Question`, `LMS Option`, `LMS Quiz Submission` |
| Assignment creation | `/assignments` | `frontend/src/pages/Assignments.vue` | Generic list/document APIs on `LMS Assignment` | `LMS Assignment`, `LMS Assignment Submission` |
| Student monitoring | `/courses/:courseName` Dashboard tab | `CourseDetail.vue`, `CourseDashboard.vue`, `StudentCourseProgress.vue` | `lms.lms.api.get_course_progress_distribution`, `lms.lms.api.get_lesson_completion_stats`, `lms.lms.api.get_course_assessment_progress`, list resource on `LMS Enrollment` | `LMS Enrollment`, `LMS Course Progress`, `LMS Quiz Submission`, `LMS Assignment Submission`, `Course Lesson` |
| Quiz submissions | `/quiz-submissions/:quizID`, `/quiz-submission/:submission` | `QuizSubmissionList.vue`, `QuizSubmission.vue` | Generic list/document resources on `LMS Quiz Submission` | `LMS Quiz`, `LMS Quiz Submission`, `LMS Quiz Result`, `User` |
| Assignment submissions | `/assignment-submissions`, `/assignment-submission/:assignmentID/:submissionName` | `AssignmentSubmissionList.vue`, `AssignmentSubmission.vue`, `Assignment.vue` | Generic list/document resources on `LMS Assignment Submission` | `LMS Assignment`, `LMS Assignment Submission`, `User` |

Instructor flow summary:

1. Instructor logs in and lands on the admin-like home.
2. Instructor creates a course from `/courses`.
3. Instructor adds course metadata, instructors, pricing/certification settings, and publishing settings.
4. Instructor builds chapters and lessons in the course editor.
5. Instructor creates quizzes and assignments, then links them to lessons where needed.
6. Instructor publishes the course when validation passes.
7. Instructor monitors enrollments, progress, lesson completion, quiz submissions, and assignment submissions through the course dashboard and submission pages.

## 4. Moderator / Admin Journey

Moderator is the main LMS admin role in the frontend. System Manager is used for setup/persona/trial surfaces, but LMS management pages mostly check `is_moderator`, `is_instructor`, or `is_evaluator`.

| Step | Route | Vue Page / Component | Backend API | Main DocTypes |
| --- | --- | --- | --- | --- |
| Login | `/login` then `/` | Frappe login page, then `Home.vue` | Frappe auth, `lms.lms.api.get_user_info` | `User`, `Role` |
| Admin home | `/` | `Home.vue`, `AdminHome.vue` | `lms.lms.api.get_created_courses`, `lms.lms.api.get_created_batches`, `lms.lms.api.get_admin_live_classes`, `lms.lms.api.get_admin_evals` | `LMS Course`, `LMS Batch`, `LMS Live Class`, `LMS Certificate Request` |
| Course approval/publishing | `/courses`, `/courses/:courseName` | `Courses.vue`, `CourseDetail.vue`, `CourseForm.vue`, `CoursePublishSettings.vue` | `lms.lms.utils.get_courses`, Frappe document update/save on `LMS Course`, validation in `lms_course.py` | `LMS Course`, `Course Instructor`, `Course Chapter`, `Course Lesson` |
| Course import/export | `/courses`, `/data-import`, `/data-import/:importName` | `Courses.vue`, `CourseImportModal.vue`, `DataImport.vue` | `lms.lms.api.import_course_from_zip`, `lms.lms.api.export_course_as_zip`, Frappe Data Import APIs | `LMS Course`, `Course Chapter`, `Course Lesson`, `Data Import`, `File` |
| User management | `/user/:username/roles` | `Profile.vue`, `ProfileRoles.vue` | `lms.lms.utils.get_roles`, `lms.lms.api.save_role`, `lms.lms.api.get_all_users`, `lms.lms.api.search_users_by_role` | `User`, `Role`, `Has Role` |
| Certificate management | `/certified-participants`, `/user/:username/certificates`, evaluator schedule pages | `CertifiedParticipants.vue`, `ProfileCertificates.vue`, `ProfileEvaluationSchedule.vue`, `UpcomingEvaluations.vue` | `lms.lms.api.get_certified_participants`, `lms.lms.api.get_count_of_certified_members`, `lms.lms.api.get_certification_categories`, `lms.lms.api.save_certificate_details`, `lms.lms.api.cancel_evaluation` | `LMS Certificate`, `LMS Certificate Request`, `LMS Certificate Evaluation`, `Certification`, `User` |
| Batch management | `/batches`, `/batches/:batchName` | `Batches.vue`, `BatchDetail.vue`, batch dashboard/settings components | `lms.lms.utils.get_batches`, `lms.lms.utils.get_batch_details`, `lms.lms.utils.get_batch_chart_data`, `lms.lms.utils.get_batch_student_progress`, `frappe.client.set_value` on `LMS Batch.published` | `LMS Batch`, `LMS Batch Enrollment`, `Batch Course`, `LMS Batch Timetable`, `LMS Live Class`, `LMS Certificate` |
| Batch enrollment | `/batches/:batchName` or `/billing/batch/:batchName` | `BatchDetail.vue`, `Billing.vue` | `lms.lms.utils.enroll_in_batch`, `lms.lms.utils.create_enrollment` | `LMS Batch`, `LMS Batch Enrollment`, `LMS Payment` |
| Analytics | `/statistics` | `frontend/src/pages/Statistics.vue` | `lms.lms.api.get_chart_details`, `lms.lms.utils.get_chart_data`, `lms.lms.utils.get_course_completion_data` | `LMS Course`, `LMS Enrollment`, `LMS Certificate`, `User` |
| Quiz oversight | `/quizzes`, `/quiz-submissions/:quizID`, `/quiz-submission/:submission` | `Quizzes.vue`, `QuizSubmissionList.vue`, `QuizSubmission.vue` | Generic list/document resources; `lms.lms.doctype.lms_quiz.lms_quiz.submit_quiz` for attempts | `LMS Quiz`, `LMS Quiz Submission`, `LMS Quiz Result`, `LMS Question` |
| Assignment oversight | `/assignments`, `/assignment-submissions`, `/assignment-submission/:assignmentID/:submissionName` | `Assignments.vue`, `AssignmentSubmissionList.vue`, `AssignmentSubmission.vue` | Generic list/document resources on assignment doctypes | `LMS Assignment`, `LMS Assignment Submission` |
| Sidebar/content settings | Sidebar actions | `AppSidebar.vue` | `lms.lms.api.get_sidebar_settings`, `lms.lms.api.update_sidebar_item`, `lms.lms.api.delete_sidebar_item` | `LMS Sidebar Item`, `Web Page` |

Moderator/Admin flow summary:

1. Moderator logs in and reaches `AdminHome.vue`.
2. Moderator reviews courses from `/courses`, including unpublished courses.
3. Moderator approves/publishes courses by updating `LMS Course.published`.
4. Moderator manages users and role assignments from profile role pages.
5. Moderator manages certificates and certificate requests through certificate/evaluation pages.
6. Moderator creates and manages batches, batch courses, timetables, enrollments, and publishing status.
7. Moderator reviews platform analytics from `/statistics`.
8. Moderator oversees quizzes, assignments, and submissions across the LMS.

## Shared Route Notes

| Route | Shared By | Runtime Behavior |
| --- | --- | --- |
| `/` | Student, Instructor, Moderator | `Home.vue` renders `StudentHome.vue` for students and `AdminHome.vue` for admin-like roles. |
| `/courses` | Guest, Student, Instructor, Moderator | Tabs and create/import controls are role-based. Guests/students see published courses; instructors get Created/Unpublished tabs; moderators get broader management controls. |
| `/courses/:courseName` | Guest, Student, Instructor, Moderator | Learners see `CourseOverview.vue`; course instructors and moderators see management tabs. |
| `/courses/:courseName/learn/:chapterNumber-:lessonNumber` | Student, Instructor preview | Students learn and save progress; instructors use lesson/editor preview paths. |
| `/quizzes` and `/assignments` | Instructor, Moderator, Evaluator where allowed | Normal students are redirected away from management lists. |
| `/batches` and `/batches/:batchName` | Guest, Student, Instructor, Moderator | Published batches are visible publicly; enrolled students get learner dashboard; moderators/evaluators get admin batch tools. |
| `/user/:username` | Student, Instructor, Moderator | Profile child tabs depend on current user and role permissions. |

## Planned Dashboard Placement

Student dashboard plan:

```text
Route: /student-dashboard
Page: frontend/src/pages/Home/StudentDashboard.vue
Main reused APIs: lms.lms.utils.get_courses, lms.lms.api.get_user_info
Main DocTypes: LMS Enrollment, LMS Course, LMS Quiz Submission, LMS Assignment Submission, LMS Certificate
```

Instructor dashboard plan:

```text
Route: /instructor-dashboard
Page: frontend/src/pages/Home/InstructorDashboard.vue
Main reused APIs: lms.lms.utils.get_courses, lms.lms.api.get_course_progress_distribution
Recommended new API: lms.lms.api.get_instructor_dashboard
Main DocTypes: LMS Course, Course Instructor, LMS Enrollment, LMS Quiz Submission, LMS Assignment Submission
```

Safe integration order:

1. Keep existing `/` behavior unchanged.
2. Add independent dashboard routes.
3. Verify each dashboard with matching role users.
4. Add sidebar links by role.
5. Only then consider making `/` redirect/render the new role-specific dashboards.
