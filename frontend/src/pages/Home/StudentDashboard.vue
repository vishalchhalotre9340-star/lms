<template>
	<div class="mt-10">
		<div class="mb-6">
			<h1 class="text-2xl font-semibold text-ink-gray-9">
				{{ __('Student Dashboard') }}
			</h1>
			<p class="mt-1 text-base text-ink-gray-6">
				{{ __('Your learning overview and pending work.') }}
			</p>
		</div>

		<div v-if="rolesLoading" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			<section
				v-for="index in 6"
				:key="index"
				class="min-h-36 rounded-md border bg-surface-white p-4"
			>
				<div class="h-6 w-32 animate-pulse rounded bg-surface-gray-2"></div>
				<div class="mt-5 space-y-3">
					<div class="h-8 w-24 animate-pulse rounded bg-surface-gray-2"></div>
					<div class="h-4 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
					<div class="h-4 w-1/2 animate-pulse rounded bg-surface-gray-2"></div>
				</div>
			</section>
		</div>

		<div
			v-else-if="canViewDashboard"
			class="space-y-5"
		>
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				<section
					v-for="card in cards"
					:key="card.title"
					class="min-h-36 rounded-md border bg-surface-white p-4"
				>
					<div class="flex items-center justify-between gap-3">
						<h2 class="text-lg font-semibold text-ink-gray-9">
							{{ __(card.title) }}
						</h2>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-gray-2 text-sm font-medium text-ink-gray-7"
						>
							{{ card.index }}
						</div>
					</div>

					<div v-if="isCardLoading(card)" class="mt-5 space-y-3">
						<div class="h-8 w-24 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-4 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-4 w-1/2 animate-pulse rounded bg-surface-gray-2"></div>
					</div>

					<div v-else class="mt-5">
						<template v-if="card.key === 'continue'">
							<div v-if="continueCourse" class="space-y-3">
								<div>
									<div class="break-words text-xl font-semibold text-ink-gray-9">
										{{ continueLearningTitle }}
									</div>
									<div
										v-if="hasExactContinueLesson && continueLearningCourseTitle"
										class="mt-1 break-words text-sm text-ink-gray-6"
									>
										{{ continueLearningCourseTitle }}
									</div>
									<div class="mt-1 text-sm text-ink-gray-6">
										{{ __('Progress') }}: {{ continueLearningProgress }}%
									</div>
								</div>
								<router-link :to="continueLearningRoute">
									<Button :label="continueLearningActionLabel" />
								</router-link>
							</div>
							<div
								v-else
								class="rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
							>
								{{ __('No enrolled courses yet.') }}
							</div>
						</template>

						<template v-else-if="card.key === 'courses'">
							<div class="text-3xl font-semibold text-ink-gray-9">
								{{ enrolledCourses.length }}
							</div>
							<div class="mt-1 text-sm text-ink-gray-6">
								{{ __('enrolled courses') }}
							</div>
							<div
								v-if="!enrolledCourses.length"
								class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
							>
								{{ __('No enrolled courses yet.') }}
							</div>
						</template>

						<template v-else-if="card.key === 'progress'">
							<div class="text-3xl font-semibold text-ink-gray-9">
								{{ overallProgress }}%
							</div>
							<div class="mt-3 h-2 rounded-full bg-surface-gray-2">
								<div
									class="h-2 rounded-full bg-ink-gray-8 transition-all"
									:style="{ width: `${overallProgress}%` }"
								></div>
							</div>
							<div class="mt-2 text-sm text-ink-gray-6">
								{{ __('overall progress') }}
							</div>
							<div
								v-if="!enrolledCourses.length"
								class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
							>
								{{ __('No enrolled courses yet.') }}
							</div>
						</template>

						<template v-else-if="card.key === 'certificates'">
							<div class="text-3xl font-semibold text-ink-gray-9">
								{{ certificates.data?.length || 0 }}
							</div>
							<div class="mt-1 text-sm text-ink-gray-6">
								{{ __('earned certificates') }}
							</div>
							<div
								v-if="!certificates.data?.length"
								class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
							>
								{{ __('You have not received any certificates yet.') }}
							</div>
						</template>

						<template v-else-if="card.key === 'quizzes'">
							<div class="text-3xl font-semibold text-ink-gray-9">
								{{ pendingQuizCount }}
							</div>
							<div class="mt-1 text-sm text-ink-gray-6">
								{{ __('pending quizzes') }}
							</div>
							<div
								v-if="pendingWork.error"
								class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
							>
								{{ __('Unable to load pending quizzes.') }}
							</div>
							<div v-else-if="firstPendingQuiz" class="mt-4 space-y-3">
								<div class="text-sm font-medium text-ink-gray-8">
									{{ firstPendingQuiz.title }}
								</div>
								<a :href="firstPendingQuiz.route">
									<Button :label="__('View')" />
								</a>
							</div>
							<div
								v-else
								class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
							>
								{{ __('No pending quizzes') }}
							</div>
						</template>

						<template v-else-if="card.key === 'assignments'">
							<div class="text-3xl font-semibold text-ink-gray-9">
								{{ pendingAssignmentCount }}
							</div>
							<div class="mt-1 text-sm text-ink-gray-6">
								{{ __('pending assignments') }}
							</div>
							<div
								v-if="pendingWork.error"
								class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
							>
								{{ __('Unable to load pending assignments.') }}
							</div>
							<div v-else-if="firstPendingAssignment" class="mt-4 space-y-3">
								<div class="text-sm font-medium text-ink-gray-8">
									{{ firstPendingAssignment.title }}
								</div>
								<a :href="firstPendingAssignment.route">
									<Button :label="__('View')" />
								</a>
							</div>
							<div
								v-else
								class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
							>
								{{ __('No pending assignments') }}
							</div>
						</template>

						<template v-else>
							<div class="text-3xl font-semibold text-ink-gray-9">
								{{ card.value }}
							</div>
							<div class="mt-1 text-sm text-ink-gray-6">
								{{ __(card.label) }}
							</div>
							<div
								class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
							>
								{{ __('Coming in next phase') }}
							</div>
						</template>
					</div>
				</section>
			</div>

			<section class="rounded-md border bg-surface-white p-4">
				<div>
					<h2 class="text-lg font-semibold text-ink-gray-9">
						{{ __('Pending Work') }}
					</h2>
					<p class="mt-1 text-sm text-ink-gray-6">
						{{ __('Continue your quizzes and assignments') }}
					</p>
				</div>

				<div v-if="pendingWork.loading" class="mt-5 space-y-3">
					<div
						v-for="index in 3"
						:key="index"
						class="h-16 animate-pulse rounded bg-surface-gray-2"
					></div>
				</div>
				<div
					v-else-if="!pendingWorkItems.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-4"
				>
					<div class="text-sm font-medium text-ink-gray-9">
						{{ __('You are all caught up') }}
					</div>
					<div class="mt-1 text-sm text-ink-gray-6">
						{{ __('No pending quizzes or assignments right now.') }}
					</div>
				</div>
				<div v-else class="mt-5 space-y-3">
					<div
						v-for="(item, index) in pendingWorkItems"
						:key="`${item.type}-${item.route || item.title}-${index}`"
						class="rounded border border-outline-gray-1 p-3"
					>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<span
										class="w-fit rounded bg-surface-gray-2 px-2 py-1 text-xs font-medium text-ink-gray-7"
									>
										{{ __(item.type) }}
									</span>
									<span
										v-if="item.status"
										class="w-fit rounded bg-surface-gray-2 px-2 py-1 text-xs font-medium text-ink-gray-7"
									>
										{{ __(item.status) }}
									</span>
								</div>
								<div class="mt-2 break-words text-sm font-medium text-ink-gray-9">
									{{ item.title || __('Untitled work') }}
								</div>
								<div class="mt-1 break-words text-sm text-ink-gray-6">
									{{ item.course_title || __('Course') }}
								</div>
								<div
									v-if="item.lesson_title"
									class="mt-1 break-words text-xs text-ink-gray-5"
								>
									{{ item.lesson_title }}
								</div>
							</div>
							<a
								v-if="item.route"
								:href="item.route"
								class="w-full shrink-0 sm:w-auto"
							>
								<Button class="w-full sm:w-auto" :label="__('Open')" />
							</a>
						</div>
					</div>
				</div>
			</section>

			<section class="rounded-md border bg-surface-white p-4">
				<div>
					<h2 class="text-lg font-semibold text-ink-gray-9">
						{{ __('My Course Progress') }}
					</h2>
					<p class="mt-1 text-sm text-ink-gray-6">
						{{ __('Track your progress across enrolled courses') }}
					</p>
				</div>

				<div
					v-if="!courseProgressItems.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-4"
				>
					<div class="text-sm font-medium text-ink-gray-9">
						{{ __('No enrolled courses yet') }}
					</div>
					<div class="mt-1 text-sm text-ink-gray-6">
						{{ __('Explore available courses to start learning.') }}
					</div>
				</div>
				<div v-else class="mt-5 space-y-3">
					<div
						v-for="course in courseProgressItems"
						:key="course.name"
						class="rounded border border-outline-gray-1 p-3"
					>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0 flex-1">
								<div class="break-words text-sm font-medium text-ink-gray-9">
									{{ course.title || __('Untitled course') }}
								</div>
								<div class="mt-2 flex flex-col gap-1 text-xs text-ink-gray-6 sm:flex-row sm:items-center sm:justify-between">
									<span class="font-medium text-ink-gray-8">
										{{ getSafeCourseProgress(course) }}%
									</span>
									<span>{{ getCourseProgressStatus(course) }}</span>
								</div>
								<div class="mt-2 h-2 w-full rounded-full bg-surface-gray-2">
									<div
										class="h-2 rounded-full bg-ink-gray-8 transition-all"
										:style="{ width: `${getSafeCourseProgress(course)}%` }"
									></div>
								</div>
							</div>
							<router-link
								:to="getCourseRoute(course)"
								class="w-full shrink-0 sm:w-auto"
							>
								<Button class="w-full sm:w-auto" :label="__('Open Course')" />
							</router-link>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup>
import { Button, createListResource, createResource } from 'frappe-ui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usersStore } from '@/stores/user'

const { userResource } = usersStore()
const router = useRouter()
const rolesLoading = ref(true)
const canViewDashboard = ref(false)

const cards = [
	{
		index: 1,
		key: 'continue',
		title: 'Continue Learning',
		value: '--',
		label: 'No course selected',
	},
	{
		index: 2,
		key: 'courses',
		title: 'My Courses',
		value: '0',
		label: 'enrolled courses',
	},
	{
		index: 3,
		key: 'progress',
		title: 'Progress %',
		value: '0%',
		label: 'overall progress',
	},
	{
		index: 4,
		key: 'quizzes',
		title: 'Pending Quizzes',
		value: '--',
		label: 'Coming in next phase',
	},
	{
		index: 5,
		key: 'assignments',
		title: 'Pending Assignments',
		value: '--',
		label: 'Coming in next phase',
	},
	{
		index: 6,
		key: 'certificates',
		title: 'Certificates',
		value: '0',
		label: 'earned certificates',
	},
]

const courses = createListResource({
	doctype: 'LMS Course',
	url: 'lms.lms.utils.get_courses',
	cache: ['student_dashboard_courses'],
	pageLength: 30,
	filters: {
		enrolled: 1,
	},
})

const certificates = createListResource({
	doctype: 'LMS Certificate',
	fields: ['name', 'course_title', 'batch_title', 'issue_date', 'template'],
	cache: ['student_dashboard_certificates'],
})

const pendingWork = createResource({
	url: 'lms.lms.api.get_my_pending_work',
	cache: ['student_dashboard_pending_work'],
})

const continueLearning = createResource({
	url: 'lms.lms.api.get_my_continue_learning',
	cache: ['student_dashboard_continue_learning'],
})

const enrolledCourses = computed(() => courses.data || [])

const pendingQuizCount = computed(() => {
	return pendingWork.data?.pending_quiz_count || 0
})

const pendingAssignmentCount = computed(() => {
	return pendingWork.data?.pending_assignment_count || 0
})

const firstPendingQuiz = computed(() => {
	return pendingWork.data?.quizzes?.[0] || null
})

const firstPendingAssignment = computed(() => {
	return pendingWork.data?.assignments?.[0] || null
})

const pendingWorkItems = computed(() => {
	const quizzes = (pendingWork.data?.quizzes || []).map((quiz) => ({
		...quiz,
		type: 'Quiz',
	}))
	const assignments = (pendingWork.data?.assignments || []).map((assignment) => ({
		...assignment,
		type: 'Assignment',
	}))
	return [...quizzes, ...assignments].slice(0, 5)
})

const courseProgressItems = computed(() => {
	return enrolledCourses.value.slice(0, 5)
})

const continueCourse = computed(() => {
	return (
		enrolledCourses.value.find((course) => getCourseProgress(course) < 100) ||
		enrolledCourses.value[0] ||
		null
	)
})

const hasExactContinueLesson = computed(() => {
	return Boolean(
		!continueLearning.loading &&
			!continueLearning.error &&
			continueLearning.data?.is_exact_lesson &&
			continueLearning.data?.lesson_route
	)
})

const continueLearningTitle = computed(() => {
	if (hasExactContinueLesson.value && continueLearning.data?.current_lesson_title) {
		return continueLearning.data.current_lesson_title
	}
	return continueCourse.value?.title || __('Course')
})

const continueLearningCourseTitle = computed(() => {
	return continueLearning.data?.course_title || continueCourse.value?.title || ''
})

const continueLearningProgress = computed(() => {
	if (!continueLearning.loading && !continueLearning.error && continueLearning.data?.course_name) {
		const progress = Number(continueLearning.data.progress)
		if (Number.isFinite(progress)) {
			return Math.min(Math.max(Math.ceil(progress), 0), 100)
		}
	}
	return getCourseProgress(continueCourse.value)
})

const continueLearningRoute = computed(() => {
	if (hasExactContinueLesson.value) {
		return continueLearning.data.lesson_route
	}
	return continueLearning.data?.fallback_route || getCourseRoute(continueCourse.value)
})

const continueLearningActionLabel = computed(() => {
	return hasExactContinueLesson.value ? __('Resume Lesson') : __('Open Course')
})

const overallProgress = computed(() => {
	if (!enrolledCourses.value.length) return 0
	const total = enrolledCourses.value.reduce((sum, course) => {
		return sum + getCourseProgress(course)
	}, 0)
	return Math.round(total / enrolledCourses.value.length)
})

const isLoading = computed(() => courses.list.loading || certificates.list.loading)

const isCardLoading = (card) => {
	if (card.key === 'quizzes' || card.key === 'assignments') {
		return pendingWork.loading
	}
	return isLoading.value
}

onMounted(async () => {
	try {
		await userResource.promise
		if (!isPureStudent()) {
			router.replace({ name: 'Home' })
			return
		}

		if (!userResource.data?.name) return
		canViewDashboard.value = true

		courses.update({
			filters: {
				enrolled: 1,
			},
		})

		certificates.update({
			filters: {
				member: userResource.data.name,
			},
			cache: ['student_dashboard_certificates', userResource.data.name],
		})

		rolesLoading.value = false
		await Promise.all([
			courses.reload(),
			certificates.reload(),
			pendingWork.reload().catch(() => null),
			continueLearning.reload().catch(() => null),
		])
	} finally {
		rolesLoading.value = false
	}
})

const isPureStudent = () => {
	return (
		userResource?.data?.is_student &&
		!userResource?.data?.is_instructor &&
		!userResource?.data?.is_moderator &&
		!userResource?.data?.is_evaluator &&
		!userResource?.data?.is_system_manager
	)
}

const getCourseProgress = (course) => {
	return Math.min(Math.ceil(Number(course?.membership?.progress) || 0), 100)
}

const getSafeCourseProgress = (course) => {
	const progress = Number(course?.membership?.progress)
	if (!Number.isFinite(progress)) {
		return 0
	}
	return Math.min(Math.max(Math.ceil(progress), 0), 100)
}

const getCourseProgressStatus = (course) => {
	const progress = getSafeCourseProgress(course)
	if (progress <= 0) {
		return __('Not started')
	}
	if (progress >= 100) {
		return __('Completed')
	}
	return __('In progress')
}

const getCourseRoute = (course) => {
	return {
		name: 'CourseDetail',
		params: {
			courseName: course.name,
		},
	}
}
</script>
