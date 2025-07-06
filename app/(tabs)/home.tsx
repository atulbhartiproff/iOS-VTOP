import React from 'react';
import { StyleSheet, View } from 'react-native';
import BottomCard from '../../components/DetailCard';
import TopSection from '../../components/TopSection';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <TopSection>
          {/* Top section content goes here (header, profile, etc.) */}
        </TopSection>
        <BottomCard>
          {/* Card content goes here */}
        </BottomCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
