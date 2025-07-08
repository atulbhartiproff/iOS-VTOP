import { useRouter } from 'expo-router';
import AttendanceScreen from '../components/attendanceScreen';

export default function Index() {
  const router = useRouter();
  return <AttendanceScreen router={router} />;
}
