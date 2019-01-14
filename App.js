import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import firebase from 'firebase';
import reducers from './src/reducers';
import LoginForm from './src/components/LoginForm'
import ReduxThunk from 'redux-thunk';
import Router from './src/Router'

const storeP = createStore(reducers, {} , applyMiddleware(ReduxThunk));

export default class App extends React.Component {
  componentWillMount(){
    console.ignoredYellowBox = [
      'Setting a timer'
    ];

    const config = {
      apiKey: "AIzaSyC920soN4PRUEoaIeornkVABcYuWkokcYM",
      authDomain: "manager-d79b5.firebaseapp.com",
      databaseURL: "https://manager-d79b5.firebaseio.com",
      projectId: "manager-d79b5",
      storageBucket: "manager-d79b5.appspot.com",
      messagingSenderId: "836779222787"
    };

    firebase.initializeApp(config);
  }
  
  render() {
    return (
      <Provider store={storeP}>
        <Router />
      </Provider>
    );
  }
}

