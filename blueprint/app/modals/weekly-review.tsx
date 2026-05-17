import { Redirect } from 'expo-router';

// Weekly review is handled inline in stats.tsx
// Redirect to stats tab
export default function WeeklyReviewModal() {
  return <Redirect href="/(tabs)/stats" />;
}
