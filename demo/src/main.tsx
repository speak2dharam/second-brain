import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DemoProvider } from './lib/store';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* No className here: Fluent copies the provider's classes onto pop-up layers (menus, dropdowns). */}
    <FluentProvider theme={webLightTheme}>
      <DemoProvider>
        <App />
      </DemoProvider>
    </FluentProvider>
  </StrictMode>,
);
