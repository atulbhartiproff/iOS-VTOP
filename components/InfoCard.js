import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoCardProps {
  percentage: number;
  label: string;
  message: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ percentage, label, message }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      {/* Circular Counter */}
      <View style={styles.circle}>
        <Text style={styles.percentText}>{percentage}%</Text>
      </View>
      {/* Centered Message */}
      <View style={styles.info}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#4B70F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F5F8FF',
  },
  percentText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B70F5',
  },
  circleLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
  },
});

export default InfoCard;