"use client";
// Lazily loaded tabs and chart cards: each is downloaded the first time it is shown.
import dynamic from "next/dynamic";

/* ---------- lazily loaded tabs: each is downloaded the first time it is opened ---------- */
export const TabLoading = () => <div className="card muted">Loading…</div>;
export const Fitness = dynamic(() => import("@/components/Fitness"), { ssr: false, loading: TabLoading });
export const WeeklyReview = dynamic(() => import("@/components/features/WeeklyReview"), { ssr: false, loading: TabLoading });
export const ReminderCenter = dynamic(() => import("@/components/features/ReminderCenter"), { ssr: false, loading: TabLoading });
export const DataControls = dynamic(() => import("@/components/features/DataControls"), { ssr: false, loading: TabLoading });
export const StudyDashboard = dynamic(() => import("@/components/features/study/StudyDashboard"), { ssr: false, loading: TabLoading });
export const ExerciseWorkspace = dynamic(() => import("@/components/features/exercise/ExerciseWorkspace"), { ssr: false, loading: TabLoading });
export const NutritionWorkspace = dynamic(() => import("@/components/features/nutrition/NutritionWorkspace"), { ssr: false, loading: TabLoading });
export const EnglishWorkspace = dynamic(() => import("@/components/features/english/EnglishWorkspace"), { ssr: false, loading: TabLoading });
export const GmailWorkspace = dynamic(() => import("@/components/features/gmail/GmailWorkspace"), { ssr: false, loading: TabLoading });
export const ChartLoading = () => <div className="card muted" style={{ height: 262 }}>Loading chart…</div>;
export const PieCard = dynamic(() => import("@/components/charts").then(m => m.PieCard), { ssr: false, loading: ChartLoading });
export const BarCard = dynamic(() => import("@/components/charts").then(m => m.BarCard), { ssr: false, loading: ChartLoading });
export const LineCard = dynamic(() => import("@/components/charts").then(m => m.LineCard), { ssr: false, loading: ChartLoading });
