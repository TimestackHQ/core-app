import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
// import * as Sentry from "@sentry/react-native";

import App from './App';

// Sentry.init({
//     dsn: 'https://1a5468bb32c043b89c9b3b4380c6ce1f@o4505059624484864.ingest.sentry.io/4505059630186496',
//     enableInExpoDevelopment: true,
//     debug: true,
//   });

registerRootComponent(App);
