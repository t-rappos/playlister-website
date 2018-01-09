
const TrackTreeStyle = {
  tree: {
    base: {
      listStyle: 'none',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      margin: 20,
      padding: 10,
      fontFamily: 'lucida grande ,tahoma,verdana,arial,sans-serif',
      fontSize: '14px',
      textAlign: 'left',
      minWidth: '180px',
    },
    node: {
      base: {
        position: 'relative',
      },
      link: {
        cursor: 'pointer',
        position: 'relative',
        padding: '0px 5px',
        display: 'block',
      },
      activeLink: {
        background: 'rgba(0, 0, 0, 0.1)',
      },
      toggle: {
        base: {
          position: 'relative',
          // display: 'inline-block',
          float: 'left',
          verticalAlign: 'top',
          marginLeft: '-5px',
          height: '24px',
          width: '24px',
        },
        wrapper: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          margin: '-7px 0 0 -7px',
          height: '14px',
        },
        height: 14,
        width: 14,
        arrow: {
          fill: '#9DA5AB',
          strokeWidth: 0,
        },
      },
      header: {
        base: {
          // display: 'inline-block',
          verticalAlign: 'top',
          color: 'black',
        },
        connector: {
          width: '2px',
          height: '12px',
          borderLeft: 'solid 2px black',
          borderBottom: 'solid 2px black',
          position: 'absolute',
          top: '0px',
          left: '-21px',
        },
        title: {
          lineHeight: '24px',
          verticalAlign: 'middle',
        },
      },
      subtree: {
        listStyle: 'none',
        paddingLeft: '19px',
      },
      loading: {
        color: '#E2C089',
      },
    },
  },
};

export default TrackTreeStyle;
