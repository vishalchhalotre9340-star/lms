<template>
	<div class="mt-10 min-w-0">
		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div class="min-w-0">
				<h1 class="break-words text-2xl font-semibold text-ink-gray-9">
					{{ __('Moderator/Admin Dashboard') }}
				</h1>
				<p class="mt-1 text-base text-ink-gray-6">
					{{ __('Platform activity, enrollment overview, and review queues.') }}
				</p>
				<p v-if="lastUpdated" class="mt-2 text-sm text-ink-gray-5">
					{{ __('Last updated') }}: {{ lastUpdated }}
				</p>
			</div>
			<Button
				:label="metrics.loading ? __('Refreshing') : __('Refresh')"
				:loading="metrics.loading"
				@click="refresh"
			/>
		</div>

		<div v-if="isInitialLoading" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			<section
				v-for="index in 6"
				:key="index"
				class="min-h-36 rounded-md border bg-surface-white p-4"
			>
				<div class="h-5 w-32 animate-pulse rounded bg-surface-gray-2"></div>
				<div class="mt-5 h-9 w-20 animate-pulse rounded bg-surface-gray-2"></div>
				<div class="mt-3 h-4 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
			</section>
		</div>

		<section
			v-else-if="isInitialError"
			role="alert"
			class="rounded-md border bg-surface-white p-5"
		>
			<h2 class="text-lg font-semibold text-ink-gray-9">
				{{ __('Unable to load dashboard') }}
			</h2>
			<p class="mt-1 text-sm text-ink-gray-6">
				{{ __('Please try again. No dashboard data was displayed.') }}
			</p>
			<Button class="mt-4" :label="__('Retry')" @click="refresh" />
		</section>

		<div v-else class="space-y-5">
			<div
				v-if="hasRefreshError"
				role="status"
				class="rounded border border-dashed border-outline-gray-2 bg-surface-white p-3 text-sm text-ink-gray-6"
			>
				{{ __('Unable to refresh dashboard. Existing data is still shown.') }}
			</div>

			<section class="rounded-md border bg-surface-white p-4">
				<div>
					<h2 class="text-lg font-semibold text-ink-gray-9">
						{{ __('Platform Overview') }}
					</h2>
					<p class="mt-1 text-sm text-ink-gray-6">
						{{ __('Course publishing and moderation status.') }}
					</p>
				</div>

				<div
					v-if="!platformCards.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-4"
				>
					<div class="text-sm font-medium text-ink-gray-9">
						{{ __('No platform overview returned') }}
					</div>
					<div class="mt-1 text-sm text-ink-gray-6">
						{{ __('The dashboard response did not include platform overview metrics.') }}
					</div>
				</div>

				<div v-else class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
					<section
						v-for="card in platformCards"
						:key="card.label"
						class="min-h-28 rounded-md border bg-surface-white p-4"
					>
						<div class="text-sm font-medium text-ink-gray-6">
							{{ __(card.label) }}
						</div>
						<div class="mt-4 text-3xl font-semibold text-ink-gray-9">
							{{ formatNumber(card.value) }}
						</div>
					</section>
				</div>
			</section>

			<section class="rounded-md border bg-surface-white p-4">
				<div>
					<h2 class="text-lg font-semibold text-ink-gray-9">
						{{ __('Course and Enrollment Activity') }}
					</h2>
					<p class="mt-1 text-sm text-ink-gray-6">
						{{ __('Learner, certificate, and batch totals returned by the endpoint.') }}
					</p>
				</div>

				<div
					v-if="!activityCards.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-4"
				>
					<div class="text-sm font-medium text-ink-gray-9">
						{{ __('No activity metrics returned') }}
					</div>
					<div class="mt-1 text-sm text-ink-gray-6">
						{{ __('The dashboard response did not include activity metrics.') }}
					</div>
				</div>

				<div v-else class="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
					<section
						v-for="card in activityCards"
						:key="card.label"
						class="min-h-28 rounded-md border bg-surface-white p-4"
					>
						<div class="text-sm font-medium text-ink-gray-6">
							{{ __(card.label) }}
						</div>
						<div class="mt-4 text-3xl font-semibold text-ink-gray-9">
							{{ formatNumber(card.value) }}
						</div>
						<div class="mt-2 text-sm text-ink-gray-6">
							{{ __(card.group) }}
						</div>
					</section>
				</div>
			</section>

			<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
				<section class="rounded-md border bg-surface-white p-4">
					<div>
						<h2 class="text-lg font-semibold text-ink-gray-9">
							{{ __('Pending Review') }}
						</h2>
						<p class="mt-1 text-sm text-ink-gray-6">
							{{ __('Courses returned by the moderation review queue.') }}
						</p>
					</div>

					<div
						v-if="!reviewQueue.length"
						class="mt-5 rounded border border-dashed border-outline-gray-2 p-4"
					>
						<div class="text-sm font-medium text-ink-gray-9">
							{{ __('No review items') }}
						</div>
						<div class="mt-1 text-sm text-ink-gray-6">
							{{ __('There are no courses in the returned review queue.') }}
						</div>
					</div>

					<div v-else class="mt-5 space-y-3">
						<div
							v-for="(item, index) in reviewQueue"
							:key="`${item.title || 'course'}-${item.modified || index}`"
							class="rounded border border-outline-gray-1 p-3"
						>
							<div class="break-words text-sm font-medium text-ink-gray-9">
								{{ item.title || __('Untitled course') }}
							</div>
							<div class="mt-2 flex flex-wrap gap-2 text-xs text-ink-gray-6">
								<span class="rounded bg-surface-gray-2 px-2 py-1">
									{{ item.status || __('Status unavailable') }}
								</span>
								<span v-if="item.modified" class="rounded bg-surface-gray-2 px-2 py-1">
									{{ formatDateTime(item.modified) }}
								</span>
							</div>
						</div>
					</div>
				</section>

				<section class="rounded-md border bg-surface-white p-4">
					<div>
						<h2 class="text-lg font-semibold text-ink-gray-9">
							{{ __('Upcoming Reviews and Schedule') }}
						</h2>
						<p class="mt-1 text-sm text-ink-gray-6">
							{{ __('Upcoming batches and certificate requests returned by the API.') }}
						</p>
					</div>

					<div
						v-if="!upcomingSchedule.length"
						class="mt-5 rounded border border-dashed border-outline-gray-2 p-4"
					>
						<div class="text-sm font-medium text-ink-gray-9">
							{{ __('No upcoming items') }}
						</div>
						<div class="mt-1 text-sm text-ink-gray-6">
							{{ __('There are no upcoming schedule items in the response.') }}
						</div>
					</div>

					<div v-else class="mt-5 space-y-3">
						<div
							v-for="(item, index) in upcomingSchedule"
							:key="`${item.kind || 'item'}-${item.title || index}-${item.date || ''}-${item.start_time || ''}`"
							class="rounded border border-outline-gray-1 p-3"
						>
							<div class="break-words text-sm font-medium text-ink-gray-9">
								{{ item.title || __('Untitled item') }}
							</div>
							<div class="mt-2 flex flex-wrap gap-2 text-xs text-ink-gray-6">
								<span v-if="item.kind" class="rounded bg-surface-gray-2 px-2 py-1">
									{{ formatKind(item.kind) }}
								</span>
								<span v-if="item.date" class="rounded bg-surface-gray-2 px-2 py-1">
									{{ formatDate(item.date) }}
								</span>
								<span
									v-if="item.start_time || item.end_time"
									class="rounded bg-surface-gray-2 px-2 py-1"
								>
									{{ formatTimeRange(item) }}
								</span>
								<span v-if="item.status" class="rounded bg-surface-gray-2 px-2 py-1">
									{{ item.status }}
								</span>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Button, createResource } from 'frappe-ui'
import { computed, ref } from 'vue'

const lastUpdated = ref('')

const metrics = createResource({
	url: 'lms.lms.api.get_moderator_admin_dashboard_metrics',
	auto: true,
	onSuccess() {
		lastUpdated.value = new Date().toLocaleString()
	},
})

const isInitialLoading = computed(() => metrics.loading && !metrics.data)
const isInitialError = computed(() => Boolean(metrics.error && !metrics.data))
const hasRefreshError = computed(() => Boolean(metrics.error && metrics.data))

const platformCards = computed(() => {
	const platform = metrics.data?.platform_overview || {}
	const cards = []

	addMetricCard(cards, platform, 'total_courses', 'Total Courses')
	addMetricCard(cards, platform, 'published_courses', 'Published Courses')
	addMetricCard(cards, platform, 'unpublished_courses', 'Unpublished Courses')
	addMetricCard(cards, platform, 'under_review_courses', 'Under Review Courses')

	return cards
})

const activityCards = computed(() => {
	const data = metrics.data || {}
	const learners = data.learner_overview || {}
	const certificates = data.certificate_overview || {}
	const batches = data.batch_overview || {}
	const cards = []

	addMetricCard(cards, learners, 'distinct_learners', 'Distinct Learners', 'Learner Activity')
	addMetricCard(cards, learners, 'enrollment_count', 'Enrollments', 'Learner Activity')
	addMetricCard(cards, certificates, 'issued_certificates', 'Issued Certificates', 'Certificates')
	addMetricCard(cards, batches, 'total_batches', 'Total Batches', 'Batches')

	return cards
})

const reviewQueue = computed(() => metrics.data?.review_queue || [])
const upcomingSchedule = computed(() => metrics.data?.upcoming_schedule || [])

const refresh = () => {
	metrics.reload()
}

const addMetricCard = (cards, source, key, label, group = '') => {
	if (!Object.prototype.hasOwnProperty.call(source, key)) {
		return
	}
	cards.push({
		label,
		value: source[key],
		group,
	})
}

const formatNumber = (value) => {
	const number = Number(value)
	if (!Number.isFinite(number)) {
		return 0
	}
	return number.toLocaleString()
}

const formatKind = (kind) => {
	return String(kind)
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ')
}

const formatDate = (value) => {
	if (!value) {
		return ''
	}

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return value
	}

	return date.toLocaleDateString([], {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

const formatDateTime = (value) => {
	if (!value) {
		return ''
	}

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return value
	}

	return date.toLocaleString([], {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	})
}

const formatTime = (value) => {
	if (!value) {
		return ''
	}

	const [hour, minute] = String(value).split(':')
	const date = new Date()
	date.setHours(Number(hour) || 0, Number(minute) || 0, 0, 0)
	return date.toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit',
	})
}

const formatTimeRange = (item) => {
	const start = formatTime(item.start_time)
	const end = formatTime(item.end_time)
	if (start && end) {
		return `${start} - ${end}`
	}
	return start || end
}
</script>
