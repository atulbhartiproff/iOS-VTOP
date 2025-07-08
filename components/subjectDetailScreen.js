import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const SubjectDetailScreen = ({ route }) => {
  const { subject } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subject.name}</Text>
      <Text style={styles.code}>{subject.code}</Text>
      <Text style={styles.attendance}>{subject.attendance}% Attendance</Text>

      {/* Example extras (if added in your JSON): */}
      {subject.totalClasses && (
        <>
          <Text style={styles.info}>Total Classes: {subject.totalClasses}</Text>
          <Text style={styles.info}>Attended: {subject.attendedClasses}</Text>
          <Text style={styles.info}>
            Bunkable Left: {Math.floor((subject.attendedClasses - 0.75 * subject.totalClasses) / 1)}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0E0E10',
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  code: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 20,
  },
  attendance: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '600',
  },
  info: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 10,
  },
});

export default SubjectDetailScreen;
