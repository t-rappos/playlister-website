
// table imports
// import { render } from "react-dom";
// import { makeData, Logo, Tips } from "./Utils";
import React, {Component} from 'react';
import PropTypes from 'prop-types';
// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

import RowCopies from './row/rowCopies';
import RowDevices from './row/rowDevices';
import RowPlayButton from './row/rowPlayButton';
//i mport RowFilenames from './row/rowFilenames';
import RowSelectCheckbox from './row/rowSelectCheckbox';
import RowTags from './row/rowTags';
import RowTagsDropDown from './row/rowTagsDropDown';

const columns = [
  {
    Header: "My Tracks",
    columns: [
      {
        Header: "Play",
        id: 'playButton',
        Cell: row => (<RowPlayButton />),
      },
      {
        Header: "Selection",
        id: 'selection',
        Cell: row => (<RowSelectCheckbox />),
      },
      {
        Header: "Title",
        id: "title",
        accessor: d => d.title,
      },
      {
        Header: "Album",
        id: "album",
        accessor: d => d.album,
      },
      {
        Header: "Artist",
        id: "artist",
        accessor: d => d.artist,
      },
      {
        Header: "Filenames",
        id: 'filename',
        accessor: d => d.filenames || "", //d.filenames.split(',') || [],
        Cell: row => (<div>{row.value}</div>),//<RowFilenames filenames={row.value || []} />),
      },
      {
        Header: "Copies",
        id: 'copies',
        accessor: d => 0, //d.filenames.split(',').length || 0,
        Cell: row => (<RowCopies copies={row.value} />),
      },
      {
        Header: "Devices",
        id: 'devices',
        accessor: d => d.devices,
        Cell: row => (<RowDevices deviceNames={row.value.split(',') || []} deviceColorId={[0, 1, 3, 4]} />), //TODO: fix device color
      },
      {
        Header: "Paths",
        id: 'paths',
        accessor: d => d.paths,
    
      },
      {
        Header: "Tags / Playlists",
        id: 'tags',
        Cell: row => (<RowTags tagNames={['liquid', 'neuro']} tagColors={['rgb(100,160,220)', 'rgb(180,120,120)']}/>),
      },
      {
        Header: "Toggle Playlist/Tag for selection",
        id: 'tagsDropDown',
        Cell: row => (<RowTagsDropDown tagNames={['liquid', 'neuro']} tagIds={[0, 1]} tagSelectedArray={[false, true]} />),
      },
      {
        Header: "Youtube Id",
        id: "YoutubeId",
        accessor: d => d.youtubeId,
        // show: false,
      },
      {
        Header: "Hash",
        id: "hash",
        accessor: d => d.hash
      },
    ],
  },
];


  //filtered = {props.selectionData === [] || !props.selectionData || !props.selectionData.path ? 0 : [{ // the current filters model
  //   id: 'paths',
  //    value: props.selectionData.path
  //  }]}

  //filtered={props.selectionData === [] || !props.selectionData || !props.selectionData.path ? [] : [{ // the current filters model
  //  id: 'paths',
  //  value: props.selectionData.path
  //}]}
  //filter={'id': "paths", 'value': "E:\music\Drum_Bass"}

 class TrackTable extends Component {
  constructor(){
    super();
    this.state = {filterPath : ""};
  }

  render(){
    console.log("props", this.props);

    let RT = (this.props.selectionData === [] || !this.props.selectionData || !this.props.selectionData.path || this.props.selectionData.path === this.state.filterPath) ? (
    <ReactTable
      getTdProps={(state, rowInfo /* , column, instance */) => ({
        onClick: (e, handleOriginal) => {
          // state.resolvedData[viewIndex+1]._index
          const viewIndex = rowInfo.viewIndex + (rowInfo.pageSize * rowInfo.page);
          this.props.setYoutubeIdCallback(
            rowInfo.row.YoutubeId,
            rowInfo.row.hash,
            viewIndex, // index in sorted array for clicked track
            state.resolvedData,
            rowInfo.row.title,
            rowInfo.row.trackalbum,
            rowInfo.row.artist,
          );
      
          if (handleOriginal) {
            handleOriginal();
          }
        },
      })}
      data={this.props.data}
      filterable
    
      defaultFilterMethod={(filter, row) => {return (row[filter.id] &&
        row[filter.id].indexOf(filter.value)) !== -1}}
      columns={columns}
      defaultPageSize={10}
      className="-striped -highlight"
    />) :
    (<ReactTable
      getTdProps={(state, rowInfo /* , column, instance */) => ({
        onClick: (e, handleOriginal) => {
          // state.resolvedData[viewIndex+1]._index
          const viewIndex = rowInfo.viewIndex + (rowInfo.pageSize * rowInfo.page);
          this.props.setYoutubeIdCallback(
            rowInfo.row.YoutubeId,
            rowInfo.row.hash,
            viewIndex, // index in sorted array for clicked track
            state.resolvedData,
            rowInfo.row.title,
            rowInfo.row.trackalbum,
            rowInfo.row.artist,
          );
      
          if (handleOriginal) {
            handleOriginal();
          }
        },
      })}
      data={this.props.data}
      filterable
    
      defaultFilterMethod={(filter, row) => {return (row[filter.id] &&
        row[filter.id].indexOf(filter.value)) !== -1}}
      columns={columns}
      defaultPageSize={10}
      className="-striped -highlight"
      filtered={[{'id': "paths", 'value': this.props.selectionData.path}]}
    />);

    return (
      <div>
        {RT}
        <br />
      </div>
    )}
}
  
TrackTable.defaultProps = {
  youtubeId: "-1",
  selectionData: []
};
TrackTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  youtubeId: PropTypes.string,
  setYoutubeIdCallback: PropTypes.func.isRequired,
  selectionData: PropTypes.object
};

export default TrackTable;


/*
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
                  } */
/* {
                  Header: "First Name",
                  accessor: "firstName"
                },
                {
                  Header: "Last Name",
                  id: "lastName",
                  accessor: d => d.lastName
                } */
