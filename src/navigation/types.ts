import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  BunkMeter: undefined;
  Calendar: undefined;
  Insights: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  SubjectDetail: { subjectId: string };
  ColorCustomization: undefined;
};
