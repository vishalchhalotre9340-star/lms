# Frappe LMS Role UI Analysis

Scope: frontend role-wise user experience for **Student**, **Instructor**, and **Admin/Moderator** interfaces. This analysis is based on the current Vue routes, role flags returned by the LMS backend, and role checks inside frontend pages/components.

No code changes were made.

## Role Flag Source

The frontend receives role flags from `lms.lms.api.get_user_info` in `lms/lms/api.py`.

That method derives:

- `is_instructor`: user has `Course Creator`
- `is_moderator`: user has `Moderator`
- `is_evaluator`: user has `Batch Evaluator`
- `is_student`: user is not instructor, moderator, or evaluator
- `is_system_manager`: user has `System Manager`

Frontend access to these flags mainly happens through:

- `frontend/src/stores/user.js`
- injected `$user`
- `usersStore().userResource`

## 1. Student Interface

Students are treated as the default learning role. A user becomes `is_student` when they do not have instructor, moderator, or evaluator privileges.

### Main Student Experience

- Home shows `StudentHome.vue`.
- Course catalog shows public/live/new/upcoming courses and an `Enrolled` tab.
- Course detail opens the learner-facing `CourseOverview.vue`.
- Lesson pages are accessible through `/courses/:courseName/learn/:chapterNumber-:lessonNumber`.
- Batch detail shows learner dashboard if the student is enrolled in the batch.
- Profile completion banner appears in the sidebar for incomplete student profiles.
- Student can access profile, certificates, course progress, assignments embedded in lessons, quizzes, evaluations, and live classes.

### Student-Focused Files

- `frontend/src/pages/Home/Home.vue`
  - Chooses `StudentHome` when the user is not admin-like.
  - Shows streak UI only for non-admin users.
- `frontend/src/pages/Home/StudentHome.vue`
  - Shows upcoming evaluations, live classes, my courses, popular courses, my batches, and upcoming batches.
- `frontend/src/pages/Courses/Courses.vue`
  - Adds `Enrolled` tab for students.
  - Forces published course filtering for students and guests.
- `frontend/src/pages/Courses/CourseDetail.vue`
  - Non-admin users get `CourseOverview`.
  - Non-admin users are redirected away from unpublished non-upcoming courses.
- `frontend/src/pages/Courses/CourseOverview.vue`
  - Learner course detail view.
  - Shows course outline, course content, description, reviews, enrollment/action overlay.
- `frontend/src/pages/Lesson.vue`
  - Lesson player and progress flow.
  - Saves progress and handles next/previous lesson flow.
- `frontend/src/pages/Batches/Batches.vue`
  - Students get `All` and `Enrolled` batch filters.
  - Published/upcoming filtering is applied to student/non-auth views.
- `frontend/src/pages/Batches/BatchDetail.vue`
  - Enrolled students get `StudentBatchDashboard`.
- `frontend/src/components/Sidebar/AppSidebar.vue`
  - Shows profile completion prompt for `is_student`.
- `frontend/src/components/CourseCardOverlay.vue`
  - Handles learner-facing course action states such as enroll/resume/certification/payment.
- `frontend/src/components/Assignment.vue`
  - Handles assignment submission UI and role-based update/review behavior.

## 2. Instructor Interface

Instructors are users with the `Course Creator` role. The frontend also treats `Batch Evaluator` as admin-like in several navigation contexts, but pure instructor checks are mainly about course creation and course ownership.

### Main Instructor Experience

- Home shows `AdminHome.vue` because instructors are included in the local `isAdmin` computed value.
- Course catalog includes `Created` and `Unpublished` tabs.
- Instructors can create courses.
- Instructors can access course management tabs only for courses where they are listed as course instructor.
- Course detail for a course instructor shows tabs:
  - Overview
  - Dashboard
  - Course editor
  - Settings
- Instructors can create/edit course lessons and settings for their own courses.
- Instructor can access quizzes and assignments pages.
- Instructor can create batches from the batch list, though `BatchDetail.vue` admin mode is stricter and only treats Moderator/Evaluator as batch admin.

### Instructor-Focused Files

- `frontend/src/pages/Home/Home.vue`
  - Treats `is_instructor` as admin-like and shows `AdminHome`.
- `frontend/src/pages/Home/AdminHome.vue`
  - Shows created courses and upcoming batches/live classes/evals for admin-like users.
- `frontend/src/pages/Courses/Courses.vue`
  - `courseTabs` adds `Created` and `Unpublished` for instructor/moderator/evaluator.
  - `Create` dropdown is shown through `canCreateCourse()`.
- `frontend/src/utils/index.js`
  - `canCreateCourse()` returns true for instructor or moderator when not read-only.
  - `isAdmin()` returns true for instructor, moderator, or evaluator for sidebar assessment links.
- `frontend/src/pages/Courses/CourseDetail.vue`
  - `isInstructor()` checks whether the logged-in user is in `course.data.instructors`.
  - `isAdmin` is true for moderator or course instructor.
  - Admin/course-instructor users see management tabs.
- `frontend/src/pages/Courses/CourseEditor.vue`
  - Course editor shell for lessons, preview, and outline editing.
- `frontend/src/pages/Courses/CourseForm.vue`
  - Course settings/edit form; redirects non-moderator and non-instructor users.
- `frontend/src/pages/Courses/CourseDashboard.vue`
  - Course analytics and student progress view.
- `frontend/src/pages/LessonForm.vue`
  - Lesson create/edit form; redirects if the user is not allowed to modify the course.
- `frontend/src/pages/Quizzes.vue`
  - Redirects away unless user is moderator, instructor, or evaluator.
- `frontend/src/pages/QuizForm.vue`
  - Redirects away unless user is moderator, instructor, or evaluator.
- `frontend/src/pages/Assignments.vue`
  - Redirects away unless user is moderator or instructor.
- `frontend/src/components/Layouts/MobileLayout.vue`
  - Adds quizzes/assignments/programming exercises to mobile menu for moderator/instructor.
- `frontend/src/components/Sidebar/AppSidebar.vue`
  - Adds admin-like sidebar links and onboarding content.

## 3. Admin / Moderator Interface

Moderator is the broadest LMS UI role. System Manager has additional onboarding/Frappe Cloud/trial surfaces but is not always treated as LMS moderator for page access. In this codebase, `is_moderator` is the main admin UI flag, while `is_system_manager` controls setup/onboarding persona and Frappe Cloud banners.

### Main Moderator Experience

- Home shows `AdminHome.vue`.
- Moderator can see and manage all courses.
- Moderator can publish/unpublish courses.
- Moderator can create/import courses.
- Moderator can access course dashboard, editor, and settings.
- Moderator can create/import batches.
- Moderator can publish/unpublish batches.
- Moderator can access batch dashboard/settings.
- Moderator can make batch announcements and generate certificates.
- Moderator can access data import.
- Moderator can manage sidebar web pages.
- Moderator can access quizzes, assignments, programming exercises, submissions, and admin-oriented profile/roles views.

### System Manager-Specific UI

- `is_system_manager` is used for:
  - Persona capture redirect in `Home.vue`
  - First-course onboarding flow in `NewCourseModal.vue`
  - Frappe Cloud trial/site info surfaces in `AppSidebar.vue`

System Manager does not automatically replace all LMS moderator checks in the frontend. Many LMS management pages still check `is_moderator`, `is_instructor`, or `is_evaluator`.

### Moderator-Focused Files

- `frontend/src/pages/Home/Home.vue`
  - Moderator is included in admin-like home selection.
  - System Manager persona capture logic lives here.
- `frontend/src/pages/Home/AdminHome.vue`
  - Admin-like dashboard with created courses, upcoming batches, live classes, evaluations.
- `frontend/src/pages/Courses/Courses.vue`
  - Moderator gets `Created` and `Unpublished` tabs.
  - Moderator gets create/import menu.
  - Moderator loads total course count.
- `frontend/src/pages/Courses/CourseDetail.vue`
  - Moderator sees course management tabs.
  - Moderator sees Publish/Unpublish button.
- `frontend/src/pages/Courses/CourseDashboard.vue`
  - Student progress analytics and enrollment tools.
- `frontend/src/pages/Batches/Batches.vue`
  - Moderator gets create/import batch menu.
  - Moderator gets upcoming/archived/unpublished batch tabs.
- `frontend/src/pages/Batches/BatchDetail.vue`
  - Moderator is `isAdmin`.
  - Moderator sees Dashboard, Settings, Publish/Unpublish, menu actions.
- `frontend/src/pages/DataImport.vue`
  - Redirects non-moderators to Courses.
- `frontend/src/components/Sidebar/AppSidebar.vue`
  - Moderator can add/edit/delete custom sidebar web pages.
- `frontend/src/pages/ProfileRoles.vue`
  - Role management surface.
- `frontend/src/pages/ProfileEvaluator.vue`
  - Evaluator schedule/profile surface.
- `frontend/src/pages/QuizSubmissionList.vue`
  - Redirects away when user is not privileged.
- `frontend/src/pages/QuizSubmission.vue`
  - Redirects away when user is not privileged.

## Shared Routes / Pages

The Vue router does not create separate route trees by role. Most routes are shared and branch internally using user flags.

### Shared By Student, Instructor, Moderator

- `/`
  - Shared route.
  - Internally renders `StudentHome` or `AdminHome`.
- `/courses`
  - Shared route.
  - Tabs and create/import controls are role-based.
- `/courses/:courseName`
  - Shared route.
  - Student sees `CourseOverview`.
  - Course instructor/moderator sees tabbed management shell.
- `/courses/:courseName/learn/:chapterNumber-:lessonNumber`
  - Shared lesson player route.
  - Students use it for learning.
  - Instructors can use embedded preview in the course editor.
- `/courses/:courseName/certification`
  - Shared certification route.
- `/batches`
  - Shared route.
  - Tabs and create/import controls are role-based.
- `/batches/:batchName`
  - Shared route.
  - Public/non-enrolled view, student dashboard, and admin dashboard are selected inside the page.
- `/user/:username`
  - Shared profile shell.
  - Child tabs depend on user and role permissions.
- `/search`
  - Shared route.
- `/notifications`
  - Shared logged-in route.
- `/programs` and `/programs/:programName`
  - Shared, but sidebar visibility depends on admin role or available enrolled/published programs.

### Mostly Admin / Instructor / Moderator Routes

These routes exist in the shared router but redirect or are hidden for normal students:

- `/quizzes`
- `/quizzes/:quizID`
- `/quiz-submissions/:quizID`
- `/quiz-submission/:submission`
- `/assignments`
- `/assignment-submissions`
- `/data-import`
- `/data-import/doctype/:doctype`
- `/data-import/:importName`
- `/programming-exercises`
- `/programming-exercises/submissions`
- `/programming-exercises/:exerciseID/submission/:submissionID`
- `/job-opening/:jobName/edit`

### Student-Facing But Also Shared

- `/quiz/:quizID`
  - Student quiz attempt route.
  - Also reachable by admins for preview/testing depending backend permissions.
- `/assignment-submission/:assignmentID/:submissionName`
  - Student/evaluator/admin assignment submission surface.
- `/job-openings`
- `/job-openings/:job`
- `/certified-participants`

## Role-Based Buttons And Controls

### Global Sidebar

File: `frontend/src/components/Sidebar/AppSidebar.vue`

- Moderator-only:
  - Add custom web page button in More section.
  - Edit/delete controls for custom sidebar web pages.
- Student-only:
  - Complete profile banner.
- System Manager:
  - Frappe Cloud trial banner.
  - Onboarding/help flow.
- Admin-like:
  - Sidebar includes Quizzes, Assignments, Programming Exercises via `getSidebarLinks()` admin condition.

### Mobile Layout

File: `frontend/src/components/Layouts/MobileLayout.vue`

- Adds Quizzes, Assignments, Programming Exercises to menu only for moderator/instructor.
- Adds Programs for moderator/instructor or users with enrolled/published programs.

### Courses Page

File: `frontend/src/pages/Courses/Courses.vue`

- `Create` dropdown appears only when `canCreateCourse()` is true.
- Course tabs:
  - Student: Live, New, Upcoming, Enrolled.
  - Instructor/Moderator/Evaluator: Live, New, Upcoming, Created, Unpublished.
- Moderator-only count fetch for total courses.

### Course Detail

File: `frontend/src/pages/Courses/CourseDetail.vue`

- Student/non-admin:
  - Course overview only.
- Course instructor or moderator:
  - Tabs: Overview, Dashboard, Course editor, Settings.
  - Lesson save controls when editing.
  - Preview controls when previewing.
  - Course settings save/delete/export menu through `CourseForm`.
- Moderator-only:
  - Publish/Unpublish button.

### Course Dashboard

File: `frontend/src/pages/Courses/CourseDashboard.vue`

- Admin/course-instructor surface.
- Enroll button opens `CourseEnrollmentModal`.
- Student progress rows open individual progress modal.

### Batches Page

File: `frontend/src/pages/Batches/Batches.vue`

- `Create` dropdown appears when `canCreateBatch()` is true.
- Batch tabs:
  - Student: All, Enrolled.
  - Instructor/Moderator/Evaluator: All, Upcoming, Archived, Unpublished.

### Batch Detail

File: `frontend/src/pages/Batches/BatchDetail.vue`

- Moderator/Evaluator:
  - Dashboard tab.
  - Settings tab.
  - Publish/Unpublish button.
  - Menu actions for Generate Certificates and Make an Announcement.
- Enrolled student:
  - Student batch dashboard.
- Public/non-enrolled:
  - Batch overview.

### Quizzes

Files:

- `frontend/src/pages/Quizzes.vue`
- `frontend/src/pages/QuizForm.vue`
- `frontend/src/pages/QuizSubmissionList.vue`
- `frontend/src/pages/QuizSubmission.vue`

Role behavior:

- Quizzes list/form redirect students away.
- Create Quiz button appears if not read-only after page access passes.
- Submission list/detail pages redirect students away.

### Assignments

File: `frontend/src/pages/Assignments.vue`

- Redirects users who are not moderator or instructor.
- Create Assignment button appears if not read-only after page access passes.
- Delete action exists in selected-row toolbar.

### Data Import

File: `frontend/src/pages/DataImport.vue`

- Redirects non-moderator users to Courses.
- Used by course and batch import menus.

### Home

File: `frontend/src/pages/Home/Home.vue`

- Student:
  - StudentHome.
  - Streak chip.
  - Resume-focused subtitle.
- Instructor/Moderator/Evaluator:
  - AdminHome.
  - No streak chip.
  - Management-focused subtitle.
- System Manager:
  - Persona capture redirect for setup.

## Files That Check Role Flags

### Backend Role Flag Creation

- `lms/lms/api.py`
  - `get_user_info()`
  - Creates `is_student`, `is_instructor`, `is_moderator`, `is_evaluator`, `is_system_manager`.

### Backend Role Helper / Permission Functions

- `lms/lms/utils.py`
  - `has_course_instructor_role()`
  - `has_moderator_role()`
  - `has_evaluator_role()`
  - `can_modify_course()`
  - `has_lms_role()`

### Frontend Stores

- `frontend/src/stores/user.js`
  - Loads user info and exposes role flags through `userResource`.
- `frontend/src/stores/session.js`
  - Session/login state and branding, not role-specific but used by layout/sidebar.

### Frontend Layout / Navigation

- `frontend/src/router.js`
  - Login/guest route guard, not role-specific.
- `frontend/src/components/Sidebar/AppSidebar.vue`
  - Sidebar role branching, student profile prompt, moderator web pages, system manager onboarding/trial UI.
- `frontend/src/components/Layouts/MobileLayout.vue`
  - Mobile navigation role branching.
- `frontend/src/utils/index.js`
  - `getSidebarLinks()`
  - `isAdmin()`
  - `checkIfCanAddProgram()`
  - `canCreateCourse()`

### Frontend Pages

- `frontend/src/pages/Home/Home.vue`
- `frontend/src/pages/Home/StudentHome.vue`
- `frontend/src/pages/Home/AdminHome.vue`
- `frontend/src/pages/Courses/Courses.vue`
- `frontend/src/pages/Courses/CourseDetail.vue`
- `frontend/src/pages/Courses/CourseOverview.vue`
- `frontend/src/pages/Courses/CourseDashboard.vue`
- `frontend/src/pages/Courses/CourseForm.vue`
- `frontend/src/pages/Courses/CourseEditor.vue`
- `frontend/src/pages/Courses/NewCourseModal.vue`
- `frontend/src/pages/Batches/Batches.vue`
- `frontend/src/pages/Batches/BatchDetail.vue`
- `frontend/src/pages/Quizzes.vue`
- `frontend/src/pages/QuizForm.vue`
- `frontend/src/pages/QuizSubmissionList.vue`
- `frontend/src/pages/QuizSubmission.vue`
- `frontend/src/pages/Assignments.vue`
- `frontend/src/pages/AssignmentSubmission.vue`
- `frontend/src/pages/AssignmentSubmissionList.vue`
- `frontend/src/pages/DataImport.vue`
- `frontend/src/pages/Lesson.vue`
- `frontend/src/pages/LessonForm.vue`
- `frontend/src/pages/Profile.vue`
- `frontend/src/pages/ProfileRoles.vue`
- `frontend/src/pages/ProfileEvaluator.vue`
- `frontend/src/pages/ProfileEvaluationSchedule.vue`
- `frontend/src/pages/ProgrammingExercises/ProgrammingExercises.vue`
- `frontend/src/pages/ProgrammingExercises/ProgrammingExerciseSubmissions.vue`
- `frontend/src/pages/ProgrammingExercises/ProgrammingExerciseSubmission.vue`

### Frontend Components

- `frontend/src/components/CourseCardOverlay.vue`
- `frontend/src/components/CourseOutline.vue`
- `frontend/src/components/Assignment.vue`
- `frontend/src/components/CertificationLinks.vue`
- `frontend/src/components/DiscussionReplies.vue`
- `frontend/src/components/UpcomingEvaluations.vue`
- `frontend/src/components/Sidebar/SidebarLink.vue`
- `frontend/src/components/Sidebar/UserDropdown.vue`

## Where Dashboard Separation Can Be Added Safely

### Best Safe Location: Home Route

File: `frontend/src/pages/Home/Home.vue`

This is already the main role split:

- `StudentHome.vue`
- `AdminHome.vue`

Safe improvement:

- Replace the current binary split with explicit role dashboards:
  - `StudentDashboard`
  - `InstructorDashboard`
  - `ModeratorDashboard`
- Keep `/` route unchanged.
- Use existing `user.data` flags to choose the component.
- Avoid changing backend APIs initially; compose existing resources differently per role.

Why safe:

- This keeps routing stable.
- It does not affect course, lesson, enrollment, or certificate business logic.
- Existing `StudentHome` and `AdminHome` can be retained and refactored later.

### Good Safe Location: Course Detail

File: `frontend/src/pages/Courses/CourseDetail.vue`

Current split:

- Non-admin: `CourseOverview`
- Admin/course-instructor: tabbed management shell

Safe improvement:

- Keep route `/courses/:courseName`.
- Extract role-specific tab definitions:
  - Student tabs: Overview, Progress, Reviews, Certificate
  - Instructor tabs: Overview, Dashboard, Editor, Settings
  - Moderator tabs: Overview, Dashboard, Editor, Settings, Audit/Publishing if needed
- Keep permission checks backed by existing `isInstructor()` and `is_moderator`.

Why safe:

- The component already branches on role.
- Course-level instructor ownership check already exists.
- Student course browsing and admin course editing are already isolated by component choice.

### Good Safe Location: Batch Detail

File: `frontend/src/pages/Batches/BatchDetail.vue`

Current split:

- Public/non-enrolled: `BatchOverview`
- Enrolled student: `StudentBatchDashboard`
- Moderator/evaluator: `AdminBatchDashboard` plus settings/actions

Safe improvement:

- Make the tabs array role-specific in a single computed structure instead of appending tabs imperatively.
- Keep existing components.

Why safe:

- Existing role separation is already explicit.
- Batch student membership check is already present through `batch.data.students`.

### Good Safe Location: Sidebar Link Composition

Files:

- `frontend/src/utils/index.js`
- `frontend/src/components/Sidebar/AppSidebar.vue`
- `frontend/src/components/Layouts/MobileLayout.vue`

Safe improvement:

- Centralize navigation policy into one helper such as `getRoleNavigation(user, settings)`.
- Avoid duplicating desktop/mobile role checks.
- Keep existing routes and components.

Why safe:

- Sidebar visibility is UI-only.
- Backend permissions still protect data and mutations.
- This reduces mismatch risk between desktop and mobile navigation.

### Moderate-Risk Location: Courses/Batches List Filters

Files:

- `frontend/src/pages/Courses/Courses.vue`
- `frontend/src/pages/Batches/Batches.vue`

Possible improvement:

- Extract tab/filter definitions into role-specific config functions.

Risk:

- These filters affect data shown to users.
- Must preserve current semantics:
  - Students should see published/live/upcoming/enrolled.
  - Admin-like users should see created/unpublished.
  - Guests should only see published content when guest access is allowed.

### Avoid As First Step

Do not start dashboard separation by changing:

- `lms/lms/api.py`
- `lms/lms/utils.py`
- DocType permission logic
- enrollment/progress/certificate flows

Reason:

- The requested separation is UI-oriented.
- Backend role helpers and permissions already exist and should remain the source of truth.
- Changing backend role semantics could break course access, enrollment, publishing, and analytics.

## Summary

Frappe LMS currently uses a **shared route tree** with **role-based rendering inside pages**. The strongest existing UI splits are:

- `Home.vue`: student home vs admin-like home.
- `CourseDetail.vue`: learner overview vs instructor/moderator management tabs.
- `BatchDetail.vue`: public overview vs student dashboard vs moderator/evaluator dashboard.
- Sidebar utilities: role-based navigation visibility.

The safest place to add clearer role-wise dashboard separation is `frontend/src/pages/Home/Home.vue`, followed by `CourseDetail.vue`, `BatchDetail.vue`, and centralized sidebar navigation helpers.
