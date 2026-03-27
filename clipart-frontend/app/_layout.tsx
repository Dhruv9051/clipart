import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      style={{ paddingHorizontal: 12, paddingVertical: 6 }}
    >
      <Text style={{ color: Colors.primaryLight, fontSize: 16 }}>←</Text>
    </Pressable>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="generate"
          options={{
            title: 'Generating Cliparts',
            headerLeft: () => <BackButton />,
            headerBackVisible: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}