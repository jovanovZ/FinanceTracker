import { useState, useEffect } from 'react';
import './App.css';
 
import Login from './screens/Login';

import { MoonIcon, SunIcon } from './assets/icons/ThemeIcons';


const App = () => {
  const [screen, setScreen] = useState('login');
  const [theme,  setTheme]  = useState('light');
 
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
 
  const nav = (id) => setScreen(id);
 
  const screens = {
    login:  <Login nav={nav} />
  };
 
  return (
    <>
      {screens[screen] ?? <Login nav={nav} />}
 
      <button
        className="theme-toggle"
        onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </>
  );
};

export default App