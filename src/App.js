import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Main from './views/main';
import Login from './views/login';

import './App.scss';

const PATHS = {
  MAIN: '/',
  LOGIN: '/login',
};

function App() {
  return (
      <Router>
        <div className="App">
            <Route exact path={PATHS.MAIN} component={Main} />
            <Route exact path={PATHS.LOGIN} component={Login} />
        </div>
      </Router>
  );
}

export default App;
