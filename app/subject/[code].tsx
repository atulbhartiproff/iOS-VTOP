import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function SubjectDetailScreen() {
  const { subject } = useLocalSearchParams();

  if (!subject) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Subject data not found.</Text>
      </View>
    );
  }

  const data = JSON.parse(subject as string);
  const details = data.details || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data.name}</Text>
      <Text style={styles.code}>{data.code}</Text>
      <Text style={styles.attendance}>{(data.classesAttended/data.classesHeld)*100}% Attendance</Text>

      {data.totalClasses && (
        <>
          <Text style={styles.info}>Total: {data.totalClasses}</Text>
          <Text style={styles.info}>Attended: {data.attendedClasses}</Text>
          <Text style={styles.info}>
            Bunkable Left: {Math.floor((data.attendedClasses - 0.75 * data.totalClasses) / 1)}
          </Text>
        </>
      )}

      <Text style={styles.sectionTitle}>Class History:</Text>

      <FlatList
        data={details}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.entry,
              {
                backgroundColor:
                  item.status === 'Present' ? '#193D2D' : '#3D1919',
              },
            ]}
          >
            <Text
              style={[
                styles.entryText,
                {
                  color: item.status === 'Present' ? '#00FF88' : '#FF4D4D',
                },
              ]}
            >
              {item.date} - {item.status}
            </Text>
          </View>
        )}
        style={{ marginTop: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E10',
    padding: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  code: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 8,
  },
  attendance: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  entry: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  entryText: {
    fontSize: 15,
    fontWeight: '500',
  },
  error: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});
