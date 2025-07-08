import { Router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Circle } from 'react-native-progress';
import attendanceData from '../data/attendance.json';

const { width } = Dimensions.get('window');
const BASE_CIRCLE_SIZE = width * 0.8;

const colors = [
  '#70C1B3', '#F25F5C', '#FFE066', '#247BA0',
  '#50514F', '#9BC53D', '#C3423F', '#E55934',
  '#6A0572', '#3F88C5'
];

type AttendanceScreenProps = {
  router: Router;
};

const AttendanceScreen = ({ router }: AttendanceScreenProps) => {
  const computedAttendance = attendanceData.map(subj =>
    subj.classesHeld > 0 ? (subj.classesAttended / subj.classesHeld) * 100 : 0
  );

  const animatedValues = useRef(
    computedAttendance.map(() => new Animated.Value(0))
  ).current;

  const [progressValues, setProgressValues] = useState(
    computedAttendance.map(() => 0)
  );

  useEffect(() => {
    animatedValues.forEach((anim, index) => {
      anim.addListener(({ value }) => {
        setProgressValues(prev => {
          const updated = [...prev];
          updated[index] = value;
          return updated;
        });
      });

      Animated.timing(anim, {
        toValue: computedAttendance[index] / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      animatedValues.forEach(anim => anim.removeAllListeners());
    };
  }, []);

  const getSkipOrAttend = (held: number, attended: number): number => {
    if (held === 0) return 0;
    const currentPercentage = attended / held;
    if (currentPercentage >= 0.75) {
      let bunkable = 0;
      while ((attended / (held + bunkable)) >= 0.75) {
        bunkable++;
      }
      return bunkable - 1;
    } else {
      let needed = 0;
      while (((attended + needed) / (held + needed)) < 0.75) {
        needed++;
      }
      return -needed;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>Attendance Info</Text>

        <View style={styles.ringContainer}>
          {progressValues.map((val, index) => (
            <View key={index} style={[styles.circleWrap, { zIndex: attendanceData.length - index }]}>
              <Circle
                size={BASE_CIRCLE_SIZE - index * 12}
                progress={val}
                thickness={6}
                color={colors[index % colors.length]}
                unfilledColor="rgba(255,255,255,0.05)"
                borderWidth={0}
                showsText={false}
              />
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendText}>
            {attendanceData.map((subject, index) => (
              <Text key={subject.code} style={{ color: colors[index % colors.length] }}>
                • {subject.code}{' '}
              </Text>
            ))}
          </Text>
        </View>

        {attendanceData.map((subject, index) => {
          const attendance = computedAttendance[index].toFixed(1);
          const diff = getSkipOrAttend(subject.classesHeld, subject.classesAttended);
          const diffColor = diff > 0 ? '#00FF88' : diff < 0 ? '#FF4D4D' : '#FFFFFF';

          return (
            <TouchableOpacity
              key={subject.code}
              style={styles.card}
              onPress={() => router.push({ pathname: `/subject/${subject.code}`, params: { subject: JSON.stringify(subject) } })}
            >
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <Text style={styles.subjectCode}>{subject.code}</Text>
                  <Text style={styles.attendance}>{attendance}%</Text>
                </View>
                <View style={[styles.diffCircle, { borderColor: diffColor }]}> 
                  <Text style={{ color: diffColor, fontWeight: 'bold' }}>
                    {diff > 0 ? `+${diff}` : diff}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  container: {
    padding: 16,
    flex: 1,
  },
  heading: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: BASE_CIRCLE_SIZE + 40,
    marginBottom: 20,
  },
  circleWrap: {
    position: 'absolute',
  },
  legend: {
    marginVertical: 16,
    paddingHorizontal: 12,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  legendText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subjectCode: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 4,
  },
  attendance: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
  },
  diffCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AttendanceScreen;
