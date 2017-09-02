import React from 'react';
import ReactDOM from 'react-dom';
import 'milligram/dist/milligram.css';
import './theme.css';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();
