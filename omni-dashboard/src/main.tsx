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
          colorPrimary: '#8B5CF6', // Purple as primary for admin to differentiate from gold storefront
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorInfo: '#8B5CF6',
          fontFamily: `'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
          borderRadius: 12,
          colorBgContainer: '#ffffff',
          colorBgLayout: '#f8f9fa',
          colorBorderSecondary: '#f0f0f0',
          boxShadowSecondary: '0 4px 20px rgba(139, 92, 246, 0.08)',
        },
        components: {
          Card: {
            headerBg: 'transparent',
            borderRadiusLG: 16,
            boxShadowTertiary: '0 4px 24px rgba(139, 92, 246, 0.05)',
          },
          Button: {
            borderRadius: 10,
            controlHeight: 38,
            primaryShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
          },
          Menu: {
            itemBorderRadius: 10,
            itemActiveBg: 'rgba(139, 92, 246, 0.1)',
            itemSelectedBg: 'rgba(139, 92, 246, 0.15)',
            itemSelectedColor: '#7C3AED',
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
