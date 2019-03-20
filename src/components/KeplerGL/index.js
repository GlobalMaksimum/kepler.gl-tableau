import React from 'react';
import PropTypes from 'prop-types';

// kepler example wrapper
import {Provider} from 'react-redux';
import store from './store';
import App from './app';
// import './styles/superfine.css';

//lodash
import _ from 'lodash';

//material ui
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

// hierarchyDataPreped
// (the original code contained a bug which would result
// in worldDataMissing always being an empty array)
function buildKeplerData(keplerData) {
    //now that we are in here we can rename fields as we need to in order avoid errors

    return keplerData;
}

// Create a memoized version of each call which will (hopefully) cache the calls.
// NOTE: passing the whole "props" to these functions will make them sub-optimal as
// the memoize depends on passing an equal object to get the cached result.
let memoized = {
    buildKeplerData: _.memoize(buildKeplerData),
};

class KeplerGlComponent extends React.Component {
    constructor (props) {
      super(props);
      this.state = {
        keplerData: undefined,
      }
    }
    preprocessData() {
        const {
            data,
            tableauSettings,
        } = this.props;


        return {keplerData: memoized.buildKeplerData(data)};
    }

    componentDidMount() {
        console.log('in kepler component mount', this.props.data);
    }

    render() {
        const {
            height,
            width,
            data,
            tableauSettings,
            readOnly,
            keplerConfig,
            mapboxAPIKey
        } = this.props;

        // pull in memoized stuff for use in render function
        let {
            keplerData,
        } = this.preprocessData();


        // need to see if we can enable both summary and point hover on this
        // coding for summary only below
        const popOver = (d) => {
            console.log('in tooltip', d);
            return (
                <Paper style={{'padding': '5px'}}>
                    <Typography> Placeholder tooltip </Typography>
                </Paper>
            );
        }

        if ( !keplerData ) {
            return null;
        } else {
            return (
                <Provider store={store}>
                    <App
                        height={height}
                        width={width}
                        data={keplerData}
                        readOnly={readOnly}
                        keplerConfig={keplerConfig}
                        mapboxAPIKey={mapboxAPIKey}

                        configCallBack={this.props.configCallBack}
                        tooltipContent={popOver}
                        customClickBehavior={this.props.clickCallBack}
                        customHoverBehavior={this.props.hoverCallBack}
                    />
                </Provider>
            );
        }
    }
}

// KeplerGlComponent.propTypes = {
//     classes: PropTypes.object.isRequired,
// };

export default KeplerGlComponent;
