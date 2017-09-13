import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import fetch from 'fetch-hoc';
import R from 'ramda';
import { handleError, spinnerWhileLoading, handleErrorWith } from './util/hoc';
import { getContext, withProps } from 'recompose';
import PropTypes from 'prop-types';
import MdFolderOpen from 'react-icons/lib/md/folder-open';
import FaArrowUp from 'react-icons/lib/fa/arrow-up';
import MdFileDownload from 'react-icons/lib/md/file-download';
import MdOpenInNew from 'react-icons/lib/md/open-in-new';
import ReactModal from 'react-modal';
import { connect, Provider } from 'react-redux';
import store, { selectedImage, selectImage, dismissModal } from './util/redux';
import windowSize from 'react-window-size';

const currentPath = R.path(['route', 'location', 'pathname']);

const isRoot = path => ['/', '/p'].indexOf(path) !== -1;

const api = process.env.NODE_ENV === 'production'
  ? ''
  : 'http://localhost:3333';

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
  getContext({ router: PropTypes.object }),
  withProps(({ router }) => ({
    path: currentPath(router),
  }))
)(({ data, path, style }) =>
  <nav style={style}>
    <ul style={{ listStyle: 'none' }}>
      {!isRoot(path) &&
        <li key="..">
          <Link to={parentPath(path)}><FaArrowUp /> Up one level</Link>
        </li>}
      {data.filter(R.prop('isDir')).map(item =>
        <li key={item.path}>
          <Link to={'/p' + item.path}>
            <MdFolderOpen style={{ fontSize: 'larger' }} /> {item.name}
          </Link>
        </li>
      )}
    </ul>
  </nav>
);

const BrokenImage = () =>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    viewBox="0 0 30 37.5"
    width="100%"
    height="100%"
    style={{ width: 300, height: 300 }}
  >
    <g transform="translate(-570 -80)">
      <g xmlns="http://www.w3.org/2000/svg">
        <circle cx="579" cy="92" r="2" />
        <polygon points="590.908,86 590.315,88 595,88 595,103 585.871,103 585.278,105 597,105 597,86   " />
        <path d="M586.167,102H588h6v-2.857c-1.997-2.776-2.954-6.657-4.883-7.098L586.167,102z" />
        <path d="M588.041,81.716L586.771,86H573v19h8.143l-1.102,3.716l1.918,0.568l8-27L588.041,81.716z M583.31,97.682    c-0.668-0.861-1.34-1.396-2.06-1.396c-1.955,0-2.674,4.157-5.25,4.999V102h2.25h3.781l-0.296,1H575V88h11.18L583.31,97.682z" />
      </g>
    </g>
  </svg>;

const Thumb = R.compose(
  connect(null, { selectImage }),
  fetch(({ item }) => `${api}/thumb?path=${encodeURIComponent(item.path)}`),
  spinnerWhileLoading(R.prop('loading')),
  handleErrorWith(props => !!props.error, BrokenImage)
)(({ data, item, selectImage }) =>
  <div
    style={{
      width: 300,
      height: 250,
      backgroundImage: `url(${api}/get?path=${encodeURIComponent(
        data.thumb.path
      )})`,
      backgroundSize: 'cover',
      margin: 10,
      cursor: 'pointer',
    }}
    onClick={() => selectImage(data)}
  />
);

const FullSizeImage = windowSize(props => {
  const { windowWidth, windowHeight, src } = props;
  return (
    <div
      style={{
        width: windowWidth - 100,
        height: windowHeight - 150,
        backgroundImage: `url(${src})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    />
  );
});

const Thumbs = connect(R.applySpec({ selectedImage }), {
  dismissModal,
})(({ data, style, selectedImage, dismissModal }) =>
  <main style={style}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
    >
      {data
        .filter(R.prop('isImage'))
        .map(item => <Thumb key={item.path} item={item} />)}
    </div>
    <ReactModal
      isOpen={!!selectedImage}
      contentLabel="Original image"
      onRequestClose={dismissModal}
      style={{
        content: {
          padding: 0,
        },
      }}
    >
      {selectedImage &&
        <div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ flex: 1, textAlign: 'left', paddingTop: 7 }}>
              <span style={{ marginLeft: 20, display: 'inline-block' }}>
                {selectedImage.name} ({selectedImage.original.width} x
                {' '}{selectedImage.original.height})
              </span>
              <a
                style={{
                  marginLeft: 5,
                  fontWeight: 'bold',
                  fontSize: 'larger',
                }}
                href={`${api}/get?path=${encodeURIComponent(
                  selectedImage.original.path
                )}`}
                target="_blank"
                title="Open in new tab"
              >
                <MdOpenInNew />
              </a>
              <a
                style={{
                  marginLeft: 5,
                  fontWeight: 'bold',
                  fontSize: 'larger',
                }}
                href={`${api}/download?path=${encodeURIComponent(
                  selectedImage.original.path
                )}`}
                title="Download"
              >
                <MdFileDownload />
              </a>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <button
                className="close"
                style={{
                  marginRight: 10,
                  marginBottom: 0,
                  fontSize: '3rem',
                }}
                onClick={dismissModal}
              >
                ×
              </button>
            </div>
          </div>
          <div style={{ padding: '0 20px 20px 20px' }}>
            <FullSizeImage
              src={`${api}/get?path=${encodeURIComponent(
                selectedImage.original.path
              ).replace(/'/g, '%27')}`}
              alt={selectedImage.name}
              fit="contain"
            />
          </div>
        </div>}
    </ReactModal>
  </main>
);

const Browser = R.compose(
  getContext({ router: PropTypes.object }),
  withProps(({ router }) => ({
    path: currentPath(router),
  })),
  fetch(
    ({ path }) => `${api}/ls?path=${encodeURIComponent(apiPath(path) || '/')}`
  ),
  spinnerWhileLoading(R.prop('loading')),
  handleError(R.path(['error', 'message']))
)(({ data }) =>
  <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
    <Nav
      data={data}
      style={{
        width: 300,
        padding: 10,
        borderRight: '1px #ccc solid',
        overflowY: 'auto',
      }}
    />
    <Thumbs data={data} style={{ flex: 1, overflowY: 'auto' }} />
  </div>
);

const App = ({ data }) =>
  <Provider store={store}>
    <Router>
      <div>
        <Route path="/" component={Browser} />
      </div>
    </Router>
  </Provider>;

export default App;
