/*
    to import:
    import * as user from "../userActions"
    or import {fetchUser} from "../userActions"
    user.fetchUser()
    fetchUser()


export function increment(){
    return {type:"INC", val: "x"};
}

export function timed(){
    return (dispatch) => {
        dispatch({type: "START_TIMED", payload: "start"});
        setTimeout(()=>{
          console.log("d end");
          dispatch({type: "END_TIMED", payload: "end"});
        }, 5000);
      };
}

export function withPromise(){
    return {
        type: "FOO",
        payload: new Promise((res, rej)=>{
          setTimeout(()=>{res(true);}, 5000);
        })
      };
}

*/