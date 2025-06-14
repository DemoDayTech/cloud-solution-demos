import 'bootstrap/dist/css/bootstrap.min.css';
import "@/styles/globals.css";
import "@/styles/customGridStyles.css"
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css'; // or any other theme


import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);


export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
