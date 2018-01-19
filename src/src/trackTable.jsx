import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactTable from "react-table";
import "react-table/react-table.css";

import RowCopies from './row/rowCopies';
import RowDevices from './row/rowDevices';
import RowPlayButton from './row/rowPlayButton';
import RowSelectCheckbox from './row/rowSelectCheckbox';
import RowTags from './row/rowTags';
import RowTagsDropDown from './row/rowTagsDropDown';

import {connect} from 'react-redux';
import {setYoutubeId, 
  fulfillRequestNextTrack, 
  fulfillRequestPreviousTrack} from './actions/youtube';

function makeColumns(_this){
return [
  {
    Header: "My Tracks",
    columns: [
      
      {
        Header: "Play",
        id: 'playButton',
        Cell: (row, a, b, c) => (<RowPlayButton onClick = {()=>{
          console.log(row);
          let {viewIndex, pageSize, page} = row;
          viewIndex = viewIndex + (pageSize * page);
          console.log("set view index", viewIndex);
          _this.setState({lastClickedRow: viewIndex});
          _this.props.dispatch(setYoutubeId(row.row.YoutubeId, row.row.hash));
        }}/>),
      },
      
      {
        Header: "DataIndex",
        id: "dataIndex",
        accessor: d => d.dataIndex
      },
      {
        Header: "PlaylistIds",
        id: "playlistIds",
        accessor: d => d.playlistids
      },
      {
        Header: "Selection",
        id: 'selection',
        accessor: d => d.selected,
        Cell: row => (<RowSelectCheckbox id={row.original.hash} checked={row.original.selected} onChecked={(val)=>{
          _this.props.onSelection(row.original.dataIndex, val);
        }}/>),
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
        Cell: row => (<RowTags 
          tagNames= {row.original.playlistids 
                    ? row.original.playlistids.split(" ")
                    .map((pid) => {
                      const playlist = _this.props.playlistData.find((p)=>{
                         return ""+p.id === pid
                      }); 
                      return playlist ? playlist.name : "X"
                    }) 
                    : []
                  }
          tagColors={row.original.playlistids 
            ? row.original.playlistids.split(" ")
              .map((pid) => {
                const playlist = _this.props.playlistData.find((p)=>{
                  return ""+p.id === pid
                  });
                return playlist ? playlist.color : "X"
              }) 
            : []} />),
      },
      {
        Header: "Toggle Playlist/Tag for selection",
        id: 'tagsDropDown',
        Cell: row => (<RowTagsDropDown onSelection={(tagId)=>{
          console.log(tagId, " was clicked");
          _this.props.onDropDownSelect(tagId, row.original.dataIndex);
        }} tagNames={_this.props.playlistData.map(p=>p.name)} tagIds={_this.props.playlistData.map(p=>p.id)} tagSelectedArray={[false, true]} />),
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
}

 class TrackTable extends Component {

  constructor(){
    super();
    this.state = {
      lastClickedRow: null, //this is the view index
      resolvedData: null
    };
  }

  componentWillReceiveProps(nextProps){
    console.log("nextProps", nextProps);
    if(this.state.lastClickedRow >= 0){
      let viewIndex = this.state.lastClickedRow;
      if(nextProps.nextTrackRequested){
        console.log("next track requested");
        if(viewIndex === this.state.resolvedData.length-1){viewIndex = -1;}
        viewIndex += 1;
        const nextRow = this.state.resolvedData[viewIndex];
        const {YoutubeId, hash} = nextRow;
        console.log("Going to next track ", nextRow, YoutubeId, hash);
        this.setState({lastClickedRow : viewIndex});
        this.props.dispatch(setYoutubeId(YoutubeId, hash));

      } else if(nextProps.previousTrackRequested){
        console.log("prev track requested");
        if(viewIndex === 0){viewIndex = this.state.resolvedData.length;}
        viewIndex -= 1;
        const nextRow = this.state.resolvedData[viewIndex];
        console.log("viewIndex, nextRow", viewIndex, nextRow);
        const {YoutubeId, hash} = nextRow;
        console.log("Going to prev track ", nextRow, YoutubeId, hash);
        this.setState({lastClickedRow : viewIndex});
        this.props.dispatch(setYoutubeId(YoutubeId, hash));

      }
    }
  }

  render(){
    console.log("render tracktable");

    const filterValue = this.props.selectionData.path || this.props.selectionData.playlistId || "paths";
    const filterId = this.props.selectionData.path ? "paths" : 
                        (this.props.selectionData.playlistId ? "playlistIds" : "");
    const filter = [{'id': filterId, 'value': ""+filterValue}];
    console.log('filter',filter)

    let RT = (this.props.selectionData === []
      || (!this.props.selectionData.path && !this.props.selectionData.playlistId))
    ?
    (<ReactTable
      getTdProps={(tableState, rowInfo) => ({
        onClick: (e, handleOriginal) => {
          console.log("tableState", tableState);
          this.setState({resolvedData : tableState.sortedData});
          if (handleOriginal) {
            handleOriginal();
          }
        }})}
      data={this.props.data}
      filterable
      defaultFilterMethod={(filter, row) => {
        let keep = row[filter.id] && row[filter.id].indexOf && 
          row[filter.id].indexOf(filter.value) !== -1;
        return keep;
      }}
      columns={makeColumns(this)}
      defaultPageSize={10}
      className="-highlight"
    />)
    :
    (<ReactTable
      getTdProps={(tableState, rowInfo) => ({
        onClick: (e, handleOriginal) => {
          console.log("tableState", tableState);
          this.setState({resolvedData : tableState.sortedData});
          if (handleOriginal) {
            handleOriginal();
          }
        }})}
      data={this.props.data}
      filterable
      defaultFilterMethod={(filter, row) => {
        let keep = row[filter.id] && row[filter.id].indexOf && 
          row[filter.id].indexOf(filter.value) !== -1;
        return keep;
      }}
      columns={makeColumns(this)}
      defaultPageSize={10}
      className="-striped -highlight"
      filtered = {filter}
    />);

    return (
      <div>
        {RT}
        <br />
      </div>
    )}
}
  
TrackTable.defaultProps = {
  selectionData: [],
  playlistData: []
};

TrackTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  playlistData: PropTypes.arrayOf(PropTypes.object),
  onSelection: PropTypes.func.isRequired,
  onDropDownSelect: PropTypes.func.isRequired,
  selectionData: PropTypes.object
};

export default connect((store)=>{
  return {
    nextTrackRequested : store.youtube.nextTrackRequested,
    previousTrackRequested : store.youtube.previousTrackRequested
  };
})(TrackTable);