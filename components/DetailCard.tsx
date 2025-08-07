import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import attendanceData from '../data/timetable.json'; // Import the attendance data
import RoundedCard from './timetableCard'; // Import the RoundedCard component

const { height: screenHeight } = Dimensions.get('window');

const BottomCard = ({ children, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedMargin = useRef(new Animated.Value(8)).current;
  const [todaySubjects, setTodaySubjects] = useState([]);

  // Get today's date and filter subjects
  const getTodaySubjects = () => {
    const today = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const currentDay = days[today.getDay()]; // Get current day (e.g., "MON")

    // Filter subjects for the current day
    const filteredSubjects = attendanceData.filter(
      (subject) => subject.day === currentDay
    );

    return filteredSubjects;
  };

  // Determine the status of the class based on the current time
  const getClassStatus = (start, end) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    const startTime = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]); // Start time in minutes
    const endTime = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]); // End time in minutes

    if (currentTime < startTime) {
      return { status: 'Upcoming', color: '#4B70F5' }; // Blue for upcoming
    } else if (currentTime >= startTime && currentTime <= endTime) {
      return { status: 'Ongoing', color: '#800080' }; // Purple for ongoing
    } else {
      return { status: 'Completed', color: '#008000' }; // Green for completed
    }
  };

  // Update subjects when the day changes
  useEffect(() => {
    setTodaySubjects(getTodaySubjects());
  }, []);

  // Expand/Collapse animation
  useEffect(() => {
    const toHeight = isExpanded ? screenHeight * 0.9 : screenHeight * 0.65;
    const toMargin = isExpanded ? 0 : 8;

    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: toHeight,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedMargin, {
        toValue: toMargin,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getTodayDate = () => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const dayName = days[today.getDay()];
    const monthName = months[today.getMonth()];
    const date = today.getDate();
    const year = today.getFullYear();

    return `${dayName}, ${monthName} ${date} ${year}`;
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          height: animatedHeight,
          marginHorizontal: animatedMargin,
        },
        style,
      ]}
    >
      {/* Time Table heading */}
      <Text style={styles.timetableHeading}>Time Table</Text>

      {/* Expand/Collapse Button */}
      <TouchableOpacity style={styles.dateButton} onPress={toggleExpand}>
        <MaterialIcons
          name="calendar-month"
          size={14}
          color="#ECDFCC"
          style={styles.calendarIcon}
        />
        <Text style={styles.buttonText}>{getTodayDate()}</Text>
      </TouchableOpacity>

      {/* Card Content */}
      <View style={styles.content}>
        {todaySubjects.map((subject, index) => {
          const { status, color } = getClassStatus(
            subject.timing.start,
            subject.timing.end
          );

          return (
            <RoundedCard
              key={index}
              letter={subject.course_name.charAt(0)} // First letter of course code
              title={subject.course_name}
              subtitle={subject.teacher}
              timing={`${subject.timing.start} - ${subject.timing.end}`}
              status={status} // Dynamic status
              statusColor={color} // Dynamic color
              leftColor={color} // Match left bar color with status
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  dateButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    backgroundColor: '#4B70F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: '#ECDFCC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
  timetableHeading: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    marginTop: 4,
  },
});

export default BottomCard;
