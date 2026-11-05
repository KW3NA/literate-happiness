import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons'; // Ensure this import is correct
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import TranslatedText from './TranslatedText';
import { useTheme } from './ThemeContext';

type BottomTabRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;
type BottomTabNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Screens that should show the tab bar with a given tab highlighted.
// Maps screen route name -> index of the active tab.
const TAB_ROUTES: Array<{ icon: string; label: string; route: keyof RootStackParamList }> = [
  { icon: "house", label: "Home", route: "Home Screen" },
  { icon: "book", label: "Learn", route: "Learn" },
  { icon: "file-lines", label: "CV", route: "CVBuilder" },
  { icon: "user", label: "Profile", route: "Profile" },
];

// Alias routes that belong under a main tab (e.g. Notifications lives under Home)
const TAB_ALIASES: Record<string, number> = {
  Notifications: 0,
  TakeAssessmentsMenu: 0,
  Tools: 0,
};

const BottomTabBar = () => {
  const navigation = useNavigation<BottomTabNavigationProp>();
  const route = useRoute<BottomTabRouteProp>();
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomNav = TAB_ROUTES;

  const handleNavigation = (target: keyof RootStackParamList) => {
    if (route.name === target) return; // already on this tab – avoid stacking duplicates
    navigation.navigate(target as any);
  };

  const activeIndex = (() => {
    const idx = bottomNav.findIndex((t) => t.route === route.name);
    if (idx !== -1) return idx;
    return TAB_ALIASES[route.name] ?? -1;
  })();

  const isActive = (itemRoute: keyof RootStackParamList) => {
    return bottomNav.findIndex((t) => t.route === itemRoute) === activeIndex;
  };

  const inactiveDarkColor = '#a0a0a0ff'; // light shade of the primary orange for dark mode
  const inactiveColor = isDark ? inactiveDarkColor : '#666';
  const barBg = isDark ? '#313131ff' : '#fff';

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: barBg,
        borderTopColor: isDark ? '#3b3b3b' : '#f0f0f0',
        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
      }
    ]}>
      <View style={styles.content}>
        {bottomNav.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={() => handleNavigation(item.route)}
          >
            <Text>
              <FontAwesome6 // Changed from FontAwesome5 to FontAwesome6
                name={item.icon}
                size={20}
                color={isActive(item.route) ? colors.primary : inactiveColor}
              />
            </Text>
            <TranslatedText style={[
              styles.label,
              { color: isActive(item.route) ? colors.primary : inactiveColor }
            ]}>
              {item.label}
            </TranslatedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minWidth: 64,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  }
});

export default BottomTabBar;
