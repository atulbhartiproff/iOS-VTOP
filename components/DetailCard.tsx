import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const BottomCard = ({ children, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedMargin = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const toHeight = isExpanded ? screenHeight*0.9 : screenHeight * 0.65; //This would later become the detailed view
    const toMargin = isExpanded ? 0 : 8;

    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: toHeight,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedMargin, {
        toValue: toMargin,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Animated.View 
      style={[
        styles.card, 
        {
          height: animatedHeight,
          marginHorizontal: animatedMargin,
        },
        style
      ]}
    >
      {/* Expand/Collapse Button for now, might change */}
      <TouchableOpacity 
        style={styles.expandButton} 
        onPress={toggleExpand}
      >
        <Text style={styles.buttonText}>
          {isExpanded ? '−' : '+'}
        </Text>
      </TouchableOpacity>

      {/* Card Content */}
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  expandButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
});

export default BottomCard;
