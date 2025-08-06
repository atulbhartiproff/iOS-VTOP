import React from 'react';
import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import InfoCard from './InfoCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TopSectionProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  heightPercentage?: number;
}

const TopSection: React.FC<TopSectionProps> = ({
  children,
  style,
  heightPercentage = 0.25,
}) => {
  return (
    <View
      style={[
        styles.topSection,
        { height: screenHeight * heightPercentage },
        style,
      ]}
    >
      <View style={styles.cardsContainer}>
        <InfoCard
          percentage={95}
          message="Attendance"
        />
        <InfoCard
          percentage={80}
          message="Credits maybe?"
        />
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  topSection: {
    backgroundColor: '#000000',
    justifyContent: 'flex-start',
  },
  cardsContainer: {
    width: screenWidth * 0.97,      // Span 90% of screen width
    alignSelf: 'center',
    marginTop: 90,                 // Push cards lower below the sidebar button
  },
});

export default TopSection;
