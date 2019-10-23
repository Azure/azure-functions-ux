import React, { useEffect } from 'react';
import AppInsightsService from '../../../../ApiHelpers/AppInsightsService';

// AppInsightsService.getStreamingLogResults(this._portalCommunicator)
// .then(r => {
//   console.log(r);
// });

const FunctionMonitorDataLoader: React.SFC<any> = props => {
  // initialization
  useEffect(() => {
    let intervalId = -1;
    let sequenceNumber = 0;

    intervalId = window.setInterval(() => {
      AppInsightsService.getStreamingLogResults(sequenceNumber).then(r => {
        if (!r.metadata.success) {
          console.log('failed');
          return;
        }

        for (const dataRange of r.data.DataRanges) {
          if (dataRange.Documents) {
            for (const doc of dataRange.Documents) {
              if (doc.SequenceNumber) {
                sequenceNumber = doc.SequenceNumber;
              }

              // if (doc.Content.OperationName === 'HttpTrigger2') {
              console.log(new Date().toUTCString() + ' ' + doc.Content.Message);
              // }
            }
          }
        }
      });
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return <></>;
};

export default FunctionMonitorDataLoader;
