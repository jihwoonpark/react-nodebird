
import {HYDRATE} from 'next-redux-wrapper';
import {combineReducers} from 'redux';
import user from './user';
import post from './post';

// (이전상태, 액션) => 다음상태
const rootReducer = (state, action) =>{ 
    console.log('rootReducer action')
    switch (action.type){
        case HYDRATE:
            console.log('HYDRATE action.payload',action.payload);
            return action.payload;
        //default에서 객체를 만들어서 return 할 수도 있는건가?
        default:{
            console.log('rootReducer default')
            const combineReducer = combineReducers({
                user,
                post,
            });
        return combineReducer(state,action);
        }        
    }
};


// const rootReducer = combineReducers({
//     //서버사이드 랜더링을 위해서 index가 필요하다고 함?
//     index: (state={}, action)=>{
//         switch (action.type) {
//             case HYDRATE:
//                 console.log('HYDRATE', action);
//                 return {...state, ...action.payload};
//             default:
//                 return state;
//         }
//     },
//     user,
//     post,
// });

export default rootReducer