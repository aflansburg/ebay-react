import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App, NameForm} from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<NameForm />, document.getElementById('search-form'));
ReactDOM.render(<p></p>, document.getElementById('results-display'));
registerServiceWorker();
