import "@/styles/globals.css";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);


export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
