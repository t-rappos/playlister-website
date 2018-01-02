
//table imports
//import { render } from "react-dom";
//import { makeData, Logo, Tips } from "./Utils";
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

class TrackTable extends Component{
  constructor() {
    super();
  }
  render() {
    return (
      <div>
        <h3>{this.props.youtubeId}</h3>
        <ReactTable
        getTdProps={(state, rowInfo, column, instance) => {
          return {
            onClick: (e, handleOriginal) => {

              console.log(rowInfo.row.YoutubeId);
              this.props.setYoutubeIdCallback(rowInfo.row.YoutubeId);
              // IMPORTANT! React-Table uses onClick internally to trigger
              // events like expanding SubComponents and pivots.
              // By default a custom 'onClick' handler will override this functionality.
              // If you want to fire the original onClick handler, call the
              // 'handleOriginal' function.
              if (handleOriginal) {
                handleOriginal()
              }
            }
          }
        }}
          data={this.props.data}
          
          columns={[
            {
              Header: "Name",
              columns: [
                  {
                    Header: "Device Id",
                    id: "deviceId",
                    accessor: d => d.devices
                  },
                  {
                    Header: "Title",
                    id: "title",
                    accessor: d => d.title
                  },
                  {
                    Header: "Album",
                    id: "trackalbum",
                    accessor: d => d.album
                  },
                  {
                    Header: "Artist",
                    id: "artist",
                    accessor: d => d.artist
                  },
                  {
                    Header: "Filesize",
                    id: "filesize",
                    accessor: d => d.filesize
                  },
                  {
                    Header: "Hash",
                    id: "hash",
                    accessor: d => d.hash
                  },
                  
                  {
                    Header: "Paths",
                    id: "paths",
                    accessor: d => d.paths
                  },
                  {
                    Header: "Filenames",
                    id: "filenames",
                    accessor: d => d.filenames
                  },
                  {
                    Header: "youtubeId",
                    id: "YoutubeId",
                    accessor: d => d.youtubeId
                  }
                /*{
                  Header: "First Name",
                  accessor: "firstName"
                },
                {
                  Header: "Last Name",
                  id: "lastName",
                  accessor: d => d.lastName
                }*/
              ]
            }
            /*,
            {
              Header: "Info",
              columns: [
                {
                  Header: "Age",
                  accessor: "age"
                },
                {
                  Header: "Status",
                  accessor: "status"
                }
              ]
            },
            {
              Header: 'Stats',
              columns: [
                {
                  Header: "Visits",
                  accessor: "visits"
                }
              ]
            }*/
          ]}
          defaultPageSize={10}
          className="-striped -highlight"
        />
        <br />
      </div>
    );
  }
}

TrackTable.propTypes = {
    data : PropTypes.arrayOf(PropTypes.object).isRequired,
    youtubeId : PropTypes.string,
    setYoutubeIdCallback : PropTypes.func.isRequired
};

export default TrackTable;