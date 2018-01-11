
// table imports
// import { render } from "react-dom";
// import { makeData, Logo, Tips } from "./Utils";
import React from 'react';
import PropTypes from 'prop-types';
// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

import RowCopies from './row/rowCopies';
import RowDevices from './row/rowDevices';
import RowPlayButton from './row/rowPlayButton';
import RowFilenames from './row/rowFilenames';
import RowSelectCheckbox from './row/rowSelectCheckbox';
import RowTags from './row/rowTags';
import RowTagsDropDown from './row/rowTagsDropDown';

const TrackTable = props => (
  <div>
    <ReactTable
      getTdProps={(state, rowInfo /* , column, instance */) => ({
        onClick: (e, handleOriginal) => {
          // state.resolvedData[viewIndex+1]._index
          const viewIndex = rowInfo.viewIndex + (rowInfo.pageSize * rowInfo.page);
          props.setYoutubeIdCallback(
            rowInfo.row.YoutubeId,
            rowInfo.row.hash,
            viewIndex, // index in sorted array for clicked track
            state.resolvedData,
            rowInfo.row.title,
            rowInfo.row.trackalbum,
            rowInfo.row.artist,
          );
          // IMPORTANT! React-Table uses onClick internally to trigger
          // events like expanding SubComponents and pivots.
          // By default a custom 'onClick' handler will override this functionality.
          // If you want to fire the original onClick handler, call the
          // 'handleOriginal' function.
          if (handleOriginal) {
            handleOriginal();
          }
        },
      })}
      data={props.data}

      columns={[
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
              Cell: row => (<RowFilenames filenames={['mobile/music', 'pc/music/dnb']} />),
            },
            {
              Header: "Copies",
              id: 'copies',
              Cell: row => (<RowCopies copies={1} />),
            },
            {
              Header: "Devices",
              id: 'devices',
              Cell: row => (<RowDevices deviceNames={['pc', 'android']} deviceColorId={[0, 1]} />),
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
          ],
        },
      ]}
      defaultPageSize={10}
      className="-striped -highlight"
    />
    <br />
  </div>
);
TrackTable.defaultProps = {
  youtubeId: "-1",
};
TrackTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  youtubeId: PropTypes.string,
  setYoutubeIdCallback: PropTypes.func.isRequired,
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
