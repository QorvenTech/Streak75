import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  DefaultTheme,
  DarkTheme,
  NavigationContainer,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

import { fonts, ThemeColors } from '../constants/theme';
import { BunkMeterScreen } from '../screens/BunkMeterScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { ColorCustomizationScreen } from '../screens/ColorCustomizationScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SubjectDetailScreen } from '../screens/SubjectDetailScreen';
import { useAppTheme } from '../theme/ThemeProvider';
import { useThemedStyles } from '../theme/useThemedStyles';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const tabIcons: Record<
  keyof TabParamList,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  Home: 'view-dashboard-outline',
  BunkMeter: 'speedometer',
  Calendar: 'calendar-month-outline',
  Insights: 'chart-box-outline',
  Profile: 'cog-outline',
};

function MainTabs() {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ color, size, focused }) => (
          <MaterialCommunityIcons
            name={tabIcons[route.name]}
            color={color}
            size={focused ? size + 2 : size}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="BunkMeter"
        component={BunkMeterScreen}
        options={{ title: 'Bunk Meter' }}
      />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { theme } = useAppTheme();
  const baseTheme = theme.dark ? DarkTheme : DefaultTheme;
  const navigationTheme: NavigationTheme = {
    ...baseTheme,
    dark: theme.dark,
    colors: {
      ...baseTheme.colors,
      primary: theme.colors.blue,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
        <Stack.Screen
          name="ColorCustomization"
          component={ColorCustomizationScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 72,
    paddingTop: 7,
    paddingBottom: 8,
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: 2,
  },
});
