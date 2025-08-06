import { useRouter } from 'expo-router';
import App from './(tabs)/home';

export default function Index() {
  const router = useRouter();
  // return <AttendanceScreen router={router} />;
  return <App />; // Render the main app component
}
