import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  DarkTheme,
  NavigationContainer,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

import { colors, fonts } from '../constants/theme';
import { BunkMeterScreen } from '../screens/BunkMeterScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { PlaceholderDetailScreen } from '../screens/PlaceholderDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SubjectDetailScreen } from '../screens/SubjectDetailScreen';
import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navigationTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.lime,
    background: colors.background,
    card: colors.backgroundElevated,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
};

const tabIcons: Record<
  keyof TabParamList,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  Home: 'view-dashboard-outline',
  BunkMeter: 'speedometer',
  Calendar: 'calendar-month-outline',
  Insights: 'chart-box-outline',
  Profile: 'account-circle-outline',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.lime,
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
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
        <Stack.Screen
          name="ColorCustomization"
          component={PlaceholderDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 76,
    paddingTop: 8,
    paddingBottom: 9,
    backgroundColor: '#061322F7',
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
