import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface BottomCardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const BottomCard: React.FC<BottomCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#CFFFE2',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginHorizontal: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default BottomCard;
