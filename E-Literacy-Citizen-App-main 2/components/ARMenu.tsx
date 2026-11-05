import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';

const { width, height } = Dimensions.get('window');

interface ARMenuItem {
  id: string;
  title: string;
  icon: string;
  action: () => void;
  gradient: string[];
}

interface ARMenuProps {
  visible: boolean;
  onClose: () => void;
  menuItems: ARMenuItem[];
}

const ARMenu: React.FC<ARMenuProps> = ({ visible, onClose, menuItems }) => {
  const { colors } = useTheme();
  const [animation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const renderMenuItem = (item: ARMenuItem, index: number) => {
    const delay = index * 100;
    const itemAnimation = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.menuItem,
          {
            transform: [{ translateY: itemAnimation }],
            opacity: animation,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: colors.card }]}
          onPress={() => {
            item.action();
            onClose();
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={item.gradient}
            style={styles.iconGradient}
          >
            <FontAwesome6 name={item.icon} size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.menuText, { color: colors.text }]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.menuContainer,
            {
              backgroundColor: colors.background,
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: animation,
            },
          ]}
        >
          <View style={styles.header}>
            <FontAwesome6 name="cube" size={24} color="#E67012" />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              AR Menu
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={20} color="#E67012" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuGrid}>
            {menuItems.map(renderMenuItem)}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContainer: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    marginBottom: 15,
  },
  menuButton: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ARMenu;