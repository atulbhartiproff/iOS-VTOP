import { Slot, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SIDEBAR_WIDTH = 220;

export default function AppLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [shouldRenderSidebar, setShouldRenderSidebar] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [slideAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH));

  // Open sidebar: show modal, then animate in
  const openSidebar = () => {
    setShouldRenderSidebar(true);
    setSidebarVisible(true);
  };

  // Close sidebar: animate out, then hide modal
  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setSidebarVisible(false);
      setShouldRenderSidebar(false);
    });
  };

  // Animate sidebar in/out when sidebarVisible changes
  React.useEffect(() => {
    if (sidebarVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [sidebarVisible]);

  return (
    <View style={styles.container}>
      {/* Three dots button on top left */}
      <TouchableOpacity
        style={styles.dotsButton}
        onPress={openSidebar}
      >
        <Text style={styles.dots}>⋯</Text>
      </TouchableOpacity>

      {/* Sidebar Overlay */}
      {shouldRenderSidebar && (
        <Modal
          visible={sidebarVisible}
          transparent
          animationType="none"
          onRequestClose={closeSidebar}
        >
          <View style={styles.overlay}>
            <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              <TouchableOpacity
                style={styles.sidebarButton}
                onPress={() => {
                  if (pathname !== '/(tabs)/home') {
                    router.replace('/(tabs)/home');
                  }
                  closeSidebar();
                }}
              >
                <Text style={styles.sidebarButtonText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarButton}
                onPress={() => {
                  if (pathname !== '/attendanceScreen') {
                    router.replace('/attendanceScreen');
                  }
                  closeSidebar();
                }}
              >
                <Text style={styles.sidebarButtonText}>Attendance</Text>
              </TouchableOpacity>
            </Animated.View>
            {/* Clicking outside sidebar closes it */}
            <TouchableOpacity
              style={styles.overlayRest}
              activeOpacity={1}
              onPress={closeSidebar}
            />
          </View>
        </Modal>
      )}

      {/* Render the current page */}
      <View style={styles.background}>
        <Slot />
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
  dotsButton: {
    position: 'absolute',
    top: 32,
    left: 18,
    zIndex: 10,
    padding: 8,
  },
  dots: {
    fontSize: 32,
    color: '#fff',
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#1E1E1E',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 100,
  },
  overlayRest: {
    flex: 1,
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sidebarButton: {
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#4B70F5',
  },
  sidebarButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
