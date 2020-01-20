import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import StartPage from './start-page/StartPage';
import TwoPlayersPage from "./two-players/TwoPlayersPage";
import FourPlayersPage from "./four-player/FourPlayersPage";

function App() {
  return (
      <Router>
          <Switch>
              <Route exact path="/">
                  <StartPage/>
              </Route>
              <Route path="/two-players">
                  <TwoPlayersPage/>
              </Route>
              <Route path="/four-players">
                  <FourPlayersPage/>
              </Route>
          </Switch>
      </Router>
  );
}

export default App;
