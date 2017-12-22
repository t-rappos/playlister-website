
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
        <ReactTable
          data={this.props.data}
          columns={[
            {
              Header: "Name",
              columns: [
                  {
                    Header: "Date Added (to device)",
                    id: "dateAdded",
                    accessor: d => d.dateAdded
                  },
                  {
                    
                    Header: "Date Last Scanned",
                    id: "dateLastScanned",
                    accessor: d => d.dateLastScanned
                  },
                  {
                    
                    Header: "Device Id",
                    id: "deviceId",
                    accessor: d => d.deviceId
                  },
                  {
                    
                    Header: "Album",
                    id: "trackalbum",
                    accessor: d => d.track.album
                  },
                  {
                    Header: "Artist",
                    id: "artist",
                    accessor: d => d.track.artist
                  },
                  {
                    Header: "Track Date Added (To account)",
                    id: "trackdateAdded",
                    accessor: d => d.track.dateAdded
                  },
                  {
                    Header: "Filename",
                    id: "filename",
                    accessor: d => d.track.filename
                  },
                  {
                    Header: "Filesize",
                    id: "filesize",
                    accessor: d => d.track.filesize
                  },
                  {
                    Header: "Hash",
                    id: "hash",
                    accessor: d => d.track.hash
                  },
                  {
                    Header: "Track Id",
                    id: "trackid",
                    accessor: d => d.track.id
                  },
                  {
                    Header: "Path",
                    id: "path",
                    accessor: d => d.track.path
                  },
                  {
                    Header: "Title",
                    id: "title",
                    accessor: d => d.track.title
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
};

export default TrackTable;