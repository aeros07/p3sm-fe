import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import "./api/axiosConfig"; 

// Buat komponen wrapper
const ScreenSizeWrapper = ({ children }) => {
  const [screenSize, setScreenSize] = React.useState('desktop')

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      
      if (width <= 1100) {
        setScreenSize('mobile')
      } else {
        setScreenSize('desktop')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)

    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  React.useEffect(() => {
    const htmlElement = document.documentElement
    
    switch(screenSize) {
      case 'mobile':
        htmlElement.setAttribute('data-sidenav-size', 'full')
        break 
      case 'desktop':
        htmlElement.setAttribute('data-sidenav-size', 'sm-hover-active')
        break
      default:
        break
    }
  }, [screenSize])

  return children
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScreenSizeWrapper>
        <SettingsProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SettingsProvider>
      </ScreenSizeWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
