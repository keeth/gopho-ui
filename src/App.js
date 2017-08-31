import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import fetch from 'fetch-hoc';
import R from 'ramda';
import {handleError, spinnerWhileLoading} from "./util/hoc";
import {getContext, withProps} from "recompose";
import PropTypes from 'prop-types';
import {
  Card, CardImg, CardImgOverlay, CardBlock,
  CardTitle, CardSubtitle, CardDeck
} from 'reactstrap';

const currentPath = R.path(['route', 'location', 'pathname']);

const isRoot = path => ['/', '/p'].indexOf(path) !== -1;

function parentPath(path) {
  const parts = path.split(/\//);
  parts.pop();
  return parts.join('/');
}

function apiPath(path) {
  const parts = path.split(/\//);
  parts.splice(1, 1);
  return parts.join('/');
}

const Nav = R.compose(
  getContext({router: PropTypes.object}),
  withProps(({router}) => ({
    path: currentPath(router)
  })),
)(({data, path}) =>
  <nav>
    <ul>
      {
        !isRoot(path) && <li key=".."><Link to={parentPath(path)}>Back</Link></li>
      }
      {data.filter(R.prop('isDir')).map(item => <li key={item.path}><Link to={'/p' + item.path}>{item.name}</Link></li>)}
    </ul>
  </nav>);

const Thumb = R.compose(
  fetch(({item}) => `http://localhost:3333/thumb?path=${encodeURIComponent(item.path)}`),
  spinnerWhileLoading(R.prop('loading')),
  handleError(R.prop('error')),
)(({data, item}) =>
  <div style={{
    width: 300,
    height: 250,
    backgroundImage: `url(http://localhost:3333/download?path=${encodeURIComponent(data.thumb.path)})`,
    backgroundSize: 'cover',
    margin: 10,
  }}/>);

const Thumbs = ({data}) => <main>
  <div style={{
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  }}>
    {data.filter(R.prop('isImage')).map(item => <Thumb key={item.path} item={item}/>)}
  </div>
</main>;

const Browser = R.compose(
  getContext({router: PropTypes.object}),
  withProps(({router}) => ({
    path: currentPath(router)
  })),
  fetch(({path}) => `http://localhost:3333/ls?path=${encodeURIComponent(apiPath(path))}`),
  spinnerWhileLoading(R.prop('loading')),
  handleError(R.prop('error')),
)(
  ({data}) => <div>
    <Nav data={data}/>
    <Thumbs data={data}/>
  </div>
);

const App = ({data}) => (
  <Router>
    <div>
      <Route path="/" component={Browser}/>
    </div>
  </Router>
);

export default App;
