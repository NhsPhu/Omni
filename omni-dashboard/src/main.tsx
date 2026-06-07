import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#1C1917', // Charcoal as primary for a sleek, premium admin
          colorSuccess: '#10B981',
          colorWarning: '#EAB308',
          colorError: '#EF4444',
          colorInfo: '#1C1917',
          fontFamily: `'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
          borderRadius: 12,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#FAFAF9',
          colorBorderSecondary: '#e7e5e4',
          boxShadowSecondary: '0 8px 32px rgba(0, 0, 0, 0.04)',
        },
        components: {
          Card: {
            headerBg: 'transparent',
            borderRadiusLG: 16,
            boxShadowTertiary: '0 8px 32px rgba(0, 0, 0, 0.04)',
          },
          Button: {
            borderRadius: 10,
            controlHeight: 38,
            primaryShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
          },
          Menu: {
            itemBorderRadius: 10,
            itemActiveBg: 'rgba(0, 0, 0, 0.04)',
            itemSelectedBg: 'rgba(202, 138, 4, 0.1)',
            itemSelectedColor: '#CA8A04',
          },
          Layout: {
            headerBg: 'rgba(255, 255, 255, 0.8)',
            siderBg: '#ffffff',
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
