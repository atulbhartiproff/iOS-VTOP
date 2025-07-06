import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { height: screenHeight } = Dimensions.get('window');

const BottomCard = ({ children, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedMargin = useRef(new Animated.Value(8)).current;
  const getTodayDate = () => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[today.getDay()];
    const monthName = months[today.getMonth()];
    const date = today.getDate();
    const year = today.getFullYear();
    
    return `  ${dayName}, ${monthName} ${date} ${year}`;
  };

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
      {/* Expand/Collapse Button for now, might change later */}
      <TouchableOpacity 
        style={styles.dateButton} 
        onPress={toggleExpand}
      >
        <MaterialIcons name="calendar-month" size={14} color="#ECDFCC" style={styles.calendarIcon} />
        <Text style={styles.buttonText}>
          {/* {isExpanded ? '−' : '+'} */}
          {getTodayDate()}
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
  dateButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    backgroundColor: '#4B70F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: '#ECDFCC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
});

export default BottomCard;
