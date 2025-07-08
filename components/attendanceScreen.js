import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Circle } from "react-native-progress";
import attendanceData from "../data/attendance.json";

const { width } = Dimensions.get("window");
const BASE_CIRCLE_SIZE = width * 0.8;

const colors = [
  "#70C1B3",
  "#F25F5C",
  "#FFE066",
  "#247BA0",
  "#50514F",
  "#9BC53D",
  "#C3423F",
  "#E55934",
  "#6A0572",
  "#3F88C5",
];

const AttendanceScreen = () => {
  const animatedValues = useRef(
    attendanceData.map(() => new Animated.Value(0))
  ).current;

  const [progressValues, setProgressValues] = useState(
    attendanceData.map(() => 0)
  );

  useEffect(() => {
    animatedValues.forEach((anim, index) => {
      anim.addListener(({ value }) => {
        setProgressValues((prev) => {
          const updated = [...prev];
          updated[index] = value;
          return updated;
        });
      });

      Animated.timing(anim, {
        toValue: attendanceData[index].attendance / 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      animatedValues.forEach((anim) => anim.removeAllListeners());
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>Attendance Info</Text>

        {/* Main ring container */}
        <View style={styles.ringContainer}>
          {/* Animated Subject Rings */}
          {progressValues.map((val, index) => (
            <View
              key={index}
              style={[
                styles.circleWrap,
                { zIndex: attendanceData.length - index },
              ]}
            >
              <Circle
                size={BASE_CIRCLE_SIZE - index * 12}
                progress={val}
                thickness={6}
                color={colors[index % colors.length]}
                unfilledColor="rgba(255, 255, 255, 0.05)"
                borderWidth={0}
                showsText={false}
              />
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendText}>
            {attendanceData.map((subject, index) => (
              <Text
                key={subject.code}
                style={{ color: colors[index % colors.length] }}
              >
                • {subject.code}{" "}
              </Text>
            ))}
          </Text>
        </View>

        {/* Cards */}
        {attendanceData.map((subject, index) => (
          <View key={subject.code} style={styles.card}>
            <Text style={styles.subjectName}>{subject.name}</Text>
            <Text style={styles.subjectCode}>{subject.code}</Text>
            <Text style={styles.attendance}>{subject.attendance}%</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0E0E10",
  },
  container: {
    padding: 16,
    flex: 1,
  },
  heading: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: BASE_CIRCLE_SIZE + 40,
    marginBottom: 20,
  },
  circleWrap: {
    position: "absolute",
  },
  legend: {
    marginVertical: 16,
    paddingHorizontal: 12,
    flexWrap: "wrap",
    flexDirection: "row",
  },
  legendText: {
    flexDirection: "row",
    flexWrap: "wrap",
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  subjectName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  subjectCode: {
    color: "#ccc",
    fontSize: 14,
    marginVertical: 4,
  },
  attendance: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default AttendanceScreen;
