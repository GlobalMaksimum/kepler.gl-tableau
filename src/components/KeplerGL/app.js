// Copyright (c) 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component} from 'react';
import {connect} from 'react-redux';

// Kepler.gl actions
import {addDataToMap} from 'kepler.gl/actions';
import {
  SidebarFactory,
  AddDataButtonFactory,
  PanelHeaderFactory,
  injectComponents
} from 'kepler.gl/components';

import CustomPanelHeaderFactory from './components/panel-header';
import CustomSidebarFactory from './components/side-bar';

// Kepler.gl Schema APIs
import KeplerGlSchema from 'kepler.gl/schemas';

// Component and helpers
import Button from './button';
import downloadJsonFile from "./file-download";

const CustomAddDataButtonFactory = () => () => (
  <div/>
)
// CustomComponents
const KeplerGl = injectComponents([
  [AddDataButtonFactory, CustomAddDataButtonFactory],
  [SidebarFactory, CustomSidebarFactory],
  [PanelHeaderFactory, CustomPanelHeaderFactory]
]);


function getHoverInfo(info) {
  const objectHovered = info ? info.object : null;
  if (!objectHovered) {
    // if nothing hovered
    return null;
  }

  return objectHovered.data ?
  // if hovered is a single object
  objectHovered.data :
  // if hovered is a hexbbin, or grid, kepler.gl can return all the points inside that hexagon / grid
  objectHovered.points;
}

class App extends Component {
  preValue = null;
  componentDidMount() {
    // Use processCsvData helper to convert csv file into kepler.gl structure {fields, rows}
    const data = this.props.data;
    console.log('checking data on mount', data, this.props);
    // Create dataset structure
    const dataset = {
      data,
      info: {
        // this is used to match the dataId defined in nyc-config.json. For more details see API documentation.
        // It is paramount that this id matches your configuration otherwise the configuration file will be ignored.
        id: 'my_data'
      }
    };
    // addDataToMap action to inject dataset into kepler.gl instance
    // this.props.dispatch(addDataToMap({datasets: dataset, config: keplerConfig}));
    this.props.dispatch(addDataToMap({
      datasets: dataset,
      options: {readOnly: this.props.readOnly},
      config: this.props.keplerConfig ? JSON.parse(this.props.keplerConfig) : undefined}));
  }

  /**
   * Listen on state change to update serialized map config
   */
  componentDidUpdate(prevProps) {
    this.handleConfigChange();
    this.handleInteractionEvent(prevProps);
  }

  handleInteractionEvent(prevProps) {
    const {keplerGl} = this.props;
    if (!keplerGl || !keplerGl.map || !prevProps.keplerGl || !prevProps.keplerGl.map) {
      // component hasn't mount yet
      return;
    }

    if (prevProps.keplerGl.map.visState.hoverInfo !== keplerGl.map.visState.hoverInfo) {
      // hovered object has changed
      this.props.customHoverBehavior(getHoverInfo(keplerGl.map.visState.hoverInfo));
    }

    if (prevProps.keplerGl.map.visState.clicked !== keplerGl.map.visState.clicked) {
      // clicked object has changed
      this.props.customClickBehavior(getHoverInfo(keplerGl.map.visState.clicked));
    }
  }

  handleConfigChange() {
    const currentState = this.getMapConfig();
    if (!currentState) {
      return;
    }

    const serializedState = JSON.stringify(currentState);

    if (this.preValue !== serializedState) {
      // keplerGl State has changed
      this.props.configCallBack('keplerConfig', serializedState);
      this.preValue = serializedState;
    }
  }
  // This method is used as reference to show how to export the current kepler.gl instance configuration
  // Once exported the configuration can be imported using parseSavedConfig or load method from KeplerGlSchema
  getMapConfig() {
    // retrieve kepler.gl store
    const {keplerGl} = this.props;
    // retrieve current kepler.gl instance store
    const {map} = keplerGl;

    // create the config object
    return KeplerGlSchema.getConfigToSave(map);
  }

  render() {
    return (
      <div style={{position: 'absolute', width: '100%', height: '100%', minHeight: '70vh'}}>
          <KeplerGl
            mapboxApiAccessToken={this.props.mapboxAPIKey}
            id="map"
            appName="Kepler.gl in Tableau!"
            version="v0.1"
            width={this.props.width}
            height={this.props.height}
          />
      </div>
    );
  }
}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(mapStateToProps, dispatchToProps)(App);
// export default App;
