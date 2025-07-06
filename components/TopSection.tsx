import React from 'react';
import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

interface TopSectionProps {
  children?: React.ReactNode;  
  style?: ViewStyle;           
  heightPercentage?: number;   
}

const TopSection: React.FC<TopSectionProps> = ({ 
  children, 
  style, 
  heightPercentage = 0.25 
}) => {
  return (
    <View style={[
      styles.topSection, 
      { height: screenHeight * heightPercentage }, 
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  topSection: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopSection;
