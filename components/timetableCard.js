import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RoundedCardProps {
  letter: string; // Letter to display (e.g., "L" or "P")
  title: string; // Title text
  subtitle: string; // Subtitle text
  timing: string; // Timing text
  status: string; // Status text (e.g., "Ongoing", "Upcoming", "Completed")
  statusColor: string; // Color for the status badge
  leftColor: string; // Color for the left-side bar
}

const RoundedCard: React.FC<RoundedCardProps> = ({
  letter,
  title,
  subtitle,
  timing,
  status,
  statusColor,
  leftColor,
}) => (
  <View style={styles.cardContainer}>
    {/* Left-side colored bar */}
    <View style={[styles.leftBar, { backgroundColor: leftColor }]} />

    {/* Card */}
    <View style={styles.card}>
      {/* Letter Circle */}
      <View style={[styles.circle, { backgroundColor: statusColor }]}>
        <Text style={styles.circleText}>{letter}</Text>
      </View>

      {/* Info Section */}
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.timing}>{timing}</Text>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    width: '95%', // Make the container take 95% of the screen width
    alignSelf: 'center', // Center the container horizontally
    marginVertical: 8,
  },
  leftBar: {
    position: 'absolute',
    left: -4,
    top: 4,
    bottom: 5,
    width: 12, // Slightly wider for better visibility
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 16,
    zIndex: 1, // Ensure the bar is behind the card
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 2, // Ensure the card is above the left bar
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  circleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timing: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default RoundedCard;