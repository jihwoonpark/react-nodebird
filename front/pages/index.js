import React, { useEffect } from 'react'; //next를 프레임워크로 쓰면 import안해도 정상작동 함
import AppLayout from '../components/AppLayout';
import { useSelector, useDispatch } from 'react-redux';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';
import { END } from 'redux-saga';
import axios from 'axios';

const Home = () =>{
    const dispatch = useDispatch();
    const {me} = useSelector(state=>state.user);
    const {mainPosts, hasMorePosts, loadPostsLoading,retweetError} = useSelector(state=>state.post);

    useEffect(()=>{
        if(retweetError){
          alert(retweetError);
        }
      },[retweetError]);

    //useEffect를 하나에 몰아서 적으면 안되나?
    // useEffect(()=>{
    //     dispatch({
    //         type: LOAD_USER_REQUEST
    //     })
    //     dispatch({
    //         type:LOAD_POSTS_REQUEST,
    //     })
    // },[]);

    useEffect(()=>{
        function onScroll(){
            // console.log(window.scrollY, document.documentElement.clientHeight, document.documentElement.scrollHeight)
            //scroll이벤트가 여러번 발생함, post saga에서 throttle해도 여러번 LOAD_POSTS_REQUEST 요청이 감, 
            //요청이 갈때는 loadPostsLoading가 true라서(loadpost가 성공하면 false), true일때만 요청이 가게끔 코딩함
            if(window.scrollY+document.documentElement.clientHeight > document.documentElement.scrollHeight - 300){
                if(hasMorePosts && !loadPostsLoading){
                    const lastId = mainPosts[mainPosts.length -1]?.id;
                    dispatch({
                        type:LOAD_POSTS_REQUEST,
                        lastId,
                    });
                }
            }
        }
        window.addEventListener('scroll',onScroll)
        return ()=>{
            window.removeEventListener('scroll', onScroll)
        }
    },[hasMorePosts, loadPostsLoading, mainPosts])


    return (
        <AppLayout>
            {me && <PostForm />}
            {mainPosts.map(post=><PostCard key={post.id} post={post} />)}            
        </AppLayout>        
    )        
};

//아래부분이 const Home = () =>{} 보다 먼저실행되고, front서버에서만 실행됨 / const Home = ()는 브라우저와 front서버 두 곳에서 다 실행
//wrapper.getServerSidePropsd의 실행결과는 reducers>index.js에서 HYDRATE로 보내져 실행됨
export const getServerSideProps = wrapper.getServerSideProps(async(context)=>{
    // console.log('Home context', context); //context는 아래에 적음
    // console.log('getServerSideProps start');
    // console.log('context.req.headers.cookie',context.req.headers.cookie);
    // console.log('context.store.dispatch(type:user)')
    // context.req가 있으면 서버에서 실행됐다는 의미 임=>2021.04.29 context.req는 back서버에서의 req와 동일한듯
    // 쿠키는 브라우저에서 만드는데, front서버에서 직접 back서버로 요청보낼때는 수동으로 쿠키를 넣어줘야 함
    const cookie = context.req ? context.req.headers.cookie : '';
    axios.defaults.headers.Cookie = '';
    if(context.req && cookie){
        axios.defaults.headers.Cookie = cookie;
    }
    context.store.dispatch({
        type: LOAD_MY_INFO_REQUEST,
      });
    // console.log('context.store.dispatch(type:post)')
    context.store.dispatch({
        type:LOAD_POSTS_REQUEST,
    });    
    //아래 2줄 코드 없으면, back서버에 REQUEST를 보내고 success까지 기다리지 않고, 
    // 다시 REQUEST를 HYDRATE로 보냄 => 따라서 back서버에서 데이터를 못 가져오게되어 게시물, 사용자정보 못 불러옴
    // console.log('context.store.dispatch(END)')
    context.store.dispatch(END);//LOAD_POSTS_REQUEST에 대한 SUCCESS응답이 올때까지 기다림
    // console.log('context.store.sagaTask.toPromise() start')
    await context.store.sagaTask.toPromise();//configureStore에 store.sagaTask 지정했음    
});

export default Home;

// context {
//     req: IncomingMessage {
//       _readableState: ReadableState {
//         objectMode: false,
//         highWaterMark: 16384,
//         buffer: BufferList { head: null, tail: null, length: 0 },
//         length: 0,
//         pipes: null,
//         pipesCount: 0,
//         flowing: null,
//         ended: true,
//         endEmitted: false,
//         reading: false,
//         sync: true,
//         needReadable: false,
//         emittedReadable: false,
//         readableListening: false,
//         resumeScheduled: false,
//         paused: true,
//         emitClose: true,
//         autoDestroy: false,
//         destroyed: false,
//         defaultEncoding: 'utf8',
//         awaitDrain: 0,
//         readingMore: true,
//         decoder: null,
//         encoding: null
//       },
//       readable: true,
//       _events: [Object: null prototype] {
//         end: [Function: resetHeadersTimeoutOnReqEnd]
//       },
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       socket: Socket {
//         connecting: false,
//         _hadError: false,
//         _parent: null,
//         _host: null,
//         _readableState: [ReadableState],
//         readable: true,
//         _events: [Object: null prototype],
//         _eventsCount: 8,
//         _maxListeners: undefined,
//         _writableState: [WritableState],
//         writable: true,
//         allowHalfOpen: true,
//         _sockname: null,
//         _pendingData: null,
//         _pendingEncoding: '',
//         server: [Server],
//         _server: [Server],
//         timeout: 120000,
//         parser: [HTTPParser],
//         on: [Function: socketListenerWrap],
//         addListener: [Function: socketListenerWrap],
//         prependListener: [Function: socketListenerWrap],
//         _paused: false,
//         _httpMessage: [ServerResponse],
//         [Symbol(asyncId)]: 951217,
//         [Symbol(kHandle)]: [TCP],
//         [Symbol(lastWriteQueueSize)]: 0,
//         [Symbol(timeout)]: Timeout {
//           _idleTimeout: 120000,
//           _idlePrev: [Timeout],
//           _idleNext: [TimersList],
//           _idleStart: 5139588,
//           _onTimeout: [Function: bound ],
//           _timerArgs: undefined,
//           _repeat: null,
//           _destroyed: false,
//           [Symbol(refed)]: false,
//           [Symbol(asyncId)]: 951218,
//           [Symbol(triggerId)]: 951217
//         },
//         [Symbol(kBuffer)]: null,
//         [Symbol(kBufferCb)]: null,
//         [Symbol(kBufferGen)]: null,
//         [Symbol(kBytesRead)]: 0,
//         [Symbol(kBytesWritten)]: 0
//       },
//       connection: Socket {
//         connecting: false,
//         _hadError: false,
//         _parent: null,
//         _host: null,
//         _readableState: [ReadableState],
//         readable: true,
//         _events: [Object: null prototype],
//         _eventsCount: 8,
//         _maxListeners: undefined,
//         _writableState: [WritableState],
//         writable: true,
//         allowHalfOpen: true,
//         _sockname: null,
//         _pendingData: null,
//         _pendingEncoding: '',
//         server: [Server],
//         _server: [Server],
//         timeout: 120000,
//         parser: [HTTPParser],
//         on: [Function: socketListenerWrap],
//         addListener: [Function: socketListenerWrap],
//         prependListener: [Function: socketListenerWrap],
//         _paused: false,
//         _httpMessage: [ServerResponse],
//         [Symbol(asyncId)]: 951217,
//         [Symbol(kHandle)]: [TCP],
//         [Symbol(lastWriteQueueSize)]: 0,
//         [Symbol(timeout)]: Timeout {
//           _idleTimeout: 120000,
//           _idlePrev: [Timeout],
//           _idleNext: [TimersList],
//           _idleStart: 5139588,
//           _onTimeout: [Function: bound ],
//           _timerArgs: undefined,
//           _repeat: null,
//           _destroyed: false,
//           [Symbol(refed)]: false,
//           [Symbol(asyncId)]: 951218,
//           [Symbol(triggerId)]: 951217
//         },
//         [Symbol(kBuffer)]: null,
//         [Symbol(kBufferCb)]: null,
//         [Symbol(kBufferGen)]: null,
//         [Symbol(kBytesRead)]: 0,
//         [Symbol(kBytesWritten)]: 0
//       },
//       httpVersionMajor: 1,
//       httpVersionMinor: 1,
//       httpVersion: '1.1',
//       complete: true,
//       headers: {
//         host: 'localhost:3000',
//         connection: 'keep-alive',
//         'cache-control': 'max-age=0',
//         'upgrade-insecure-requests': '1',
//         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
//         accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
//         'sec-fetch-site': 'same-origin',
//         'sec-fetch-mode': 'navigate',
//         'sec-fetch-user': '?1',
//         'sec-fetch-dest': 'document',
//         referer: 'http://localhost:3000/',
//         'accept-encoding': 'gzip, deflate, br',
//         'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
//         cookie: 'username-localhost-8888="2|1:0|10:1593925321|23:username-localhost-8888|44:NzEyNTgwNzFiNGEyNDdlMzgwN2Y0MTk1MTc5NDIzOTc=|1eb1690022b19f9cf3e0c47f2b0b5086fc6d2061cfb6e071385ee39cfb073706"; rnbck=s%3AAgTuiENa7sgVgSQh8MxuBRG7WzmpnX_G.Ag%2B5Pu8SlOJ85OoInqLB1sOiSjHMMHL3eKKf6Ygx4ME'
//       },
//       rawHeaders: [
//         'Host',
//         'localhost:3000',
//         'Connection',
//         'keep-alive',
//         'Cache-Control',
//         'max-age=0',
//         'Upgrade-Insecure-Requests',
//         '1',
//         'User-Agent',
//         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
//         'Accept',
//         'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',    
//         'Sec-Fetch-Site',
//         'same-origin',
//         'Sec-Fetch-Mode',
//         'navigate',
//         'Sec-Fetch-User',
//         '?1',
//         'Sec-Fetch-Dest',
//         'document',
//         'Referer',
//         'http://localhost:3000/',
//         'Accept-Encoding',
//         'gzip, deflate, br',
//         'Accept-Language',
//         'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
//         'Cookie',
//         'username-localhost-8888="2|1:0|10:1593925321|23:username-localhost-8888|44:NzEyNTgwNzFiNGEyNDdlMzgwN2Y0MTk1MTc5NDIzOTc=|1eb1690022b19f9cf3e0c47f2b0b5086fc6d2061cfb6e071385ee39cfb073706"; rnbck=s%3AAgTuiENa7sgVgSQh8MxuBRG7WzmpnX_G.Ag%2B5Pu8SlOJ85OoInqLB1sOiSjHMMHL3eKKf6Ygx4ME'
//       ],
//       trailers: {},
//       rawTrailers: [],
//       aborted: false,
//       upgrade: false,
//       url: '/',
//       method: 'GET',
//       statusCode: null,
//       statusMessage: null,
//       client: Socket {
//         connecting: false,
//         _hadError: false,
//         _parent: null,
//         _host: null,
//         _readableState: [ReadableState],
//         readable: true,
//         _events: [Object: null prototype],
//         _eventsCount: 8,
//         _maxListeners: undefined,
//         _writableState: [WritableState],
//         writable: true,
//         allowHalfOpen: true,
//         _sockname: null,
//         _pendingData: null,
//         _pendingEncoding: '',
//         server: [Server],
//         _server: [Server],
//         timeout: 120000,
//         parser: [HTTPParser],
//         on: [Function: socketListenerWrap],
//         addListener: [Function: socketListenerWrap],
//         prependListener: [Function: socketListenerWrap],
//         _paused: false,
//         _httpMessage: [ServerResponse],
//         [Symbol(asyncId)]: 951217,
//         [Symbol(kHandle)]: [TCP],
//         [Symbol(lastWriteQueueSize)]: 0,
//         [Symbol(timeout)]: Timeout {
//           _idleTimeout: 120000,
//           _idlePrev: [Timeout],
//           _idleNext: [TimersList],
//           _idleStart: 5139588,
//           _onTimeout: [Function: bound ],
//           _timerArgs: undefined,
//           _repeat: null,
//           _destroyed: false,
//           [Symbol(refed)]: false,
//           [Symbol(asyncId)]: 951218,
//           [Symbol(triggerId)]: 951217
//         },
//         [Symbol(kBuffer)]: null,
//         [Symbol(kBufferCb)]: null,
//         [Symbol(kBufferGen)]: null,
//         [Symbol(kBytesRead)]: 0,
//         [Symbol(kBytesWritten)]: 0
//       },
//       _consuming: false,
//       _dumped: false,
//       __nextReduxWrapperStore: {
//         dispatch: [Function],
//         subscribe: [Function: subscribe],
//         getState: [Function: getState],
//         replaceReducer: [Function: replaceReducer],
//         sagaTask: [Object],
//         [Symbol(observable)]: [Function: observable]
//       }
//     },
//     res: ServerResponse {
//       _events: [Object: null prototype] { finish: [Function: bound resOnFinish] },
//       _eventsCount: 1,
//       _maxListeners: undefined,
//       outputData: [],
//       outputSize: 0,
//       writable: true,
//       _last: false,
//       chunkedEncoding: false,
//       shouldKeepAlive: true,
//       useChunkedEncodingByDefault: true,
//       sendDate: true,
//       _removedConnection: false,
//       _removedContLen: false,
//       _removedTE: false,
//       _contentLength: null,
//       _hasBody: true,
//       _trailer: '',
//       finished: false,
//       _headerSent: false,
//       socket: Socket {
//         connecting: false,
//         _hadError: false,
//         _parent: null,
//         _host: null,
//         _readableState: [ReadableState],
//         readable: true,
//         _events: [Object: null prototype],
//         _eventsCount: 8,
//         _maxListeners: undefined,
//         _writableState: [WritableState],
//         writable: true,
//         allowHalfOpen: true,
//         _sockname: null,
//         _pendingData: null,
//         _pendingEncoding: '',
//         server: [Server],
//         _server: [Server],
//         timeout: 120000,
//         parser: [HTTPParser],
//         on: [Function: socketListenerWrap],
//         addListener: [Function: socketListenerWrap],
//         prependListener: [Function: socketListenerWrap],
//         _paused: false,
//         _httpMessage: [Circular],
//         [Symbol(asyncId)]: 951217,
//         [Symbol(kHandle)]: [TCP],
//         [Symbol(lastWriteQueueSize)]: 0,
//         [Symbol(timeout)]: Timeout {
//           _idleTimeout: 120000,
//           _idlePrev: [Timeout],
//           _idleNext: [TimersList],
//           _idleStart: 5139588,
//           _onTimeout: [Function: bound ],
//           _timerArgs: undefined,
//           _repeat: null,
//           _destroyed: false,
//           [Symbol(refed)]: false,
//           [Symbol(asyncId)]: 951218,
//           [Symbol(triggerId)]: 951217
//         },
//         [Symbol(kBuffer)]: null,
//         [Symbol(kBufferCb)]: null,
//         [Symbol(kBufferGen)]: null,
//         [Symbol(kBytesRead)]: 0,
//         [Symbol(kBytesWritten)]: 0
//       },
//       connection: Socket {
//         connecting: false,
//         _hadError: false,
//         _parent: null,
//         _host: null,
//         _readableState: [ReadableState],
//         readable: true,
//         _events: [Object: null prototype],
//         _eventsCount: 8,
//         _maxListeners: undefined,
//         _writableState: [WritableState],
//         writable: true,
//         allowHalfOpen: true,
//         _sockname: null,
//         _pendingData: null,
//         _pendingEncoding: '',
//         server: [Server],
//         _server: [Server],
//         timeout: 120000,
//         parser: [HTTPParser],
//         on: [Function: socketListenerWrap],
//         addListener: [Function: socketListenerWrap],
//         prependListener: [Function: socketListenerWrap],
//         _paused: false,
//         _httpMessage: [Circular],
//         [Symbol(asyncId)]: 951217,
//         [Symbol(kHandle)]: [TCP],
//         [Symbol(lastWriteQueueSize)]: 0,
//         [Symbol(timeout)]: Timeout {
//           _idleTimeout: 120000,
//           _idlePrev: [Timeout],
//           _idleNext: [TimersList],
//           _idleStart: 5139588,
//           _onTimeout: [Function: bound ],
//           _timerArgs: undefined,
//           _repeat: null,
//           _destroyed: false,
//           [Symbol(refed)]: false,
//           [Symbol(asyncId)]: 951218,
//           [Symbol(triggerId)]: 951217
//         },
//         [Symbol(kBuffer)]: null,
//         [Symbol(kBufferCb)]: null,
//         [Symbol(kBufferGen)]: null,
//         [Symbol(kBytesRead)]: 0,
//         [Symbol(kBytesWritten)]: 0
//       },
//       _header: null,
//       _onPendingData: [Function: bound updateOutgoingData],
//       _sent100: false,
//       _expect_continue: false,
//       statusCode: 200,
//       locals: {},
//       flush: [Function: flush],
//       write: [Function: write],
//       end: [Function: end],
//       on: [Function: on],
//       writeHead: [Function: writeHead],
//       [Symbol(kNeedDrain)]: false,
//       [Symbol(isCorked)]: false,
//       [Symbol(kOutHeaders)]: null
//     },
//     query: {},
//     store: {
//       dispatch: [Function],
//       subscribe: [Function: subscribe],
//       getState: [Function: getState],
//       replaceReducer: [Function: replaceReducer],
//       sagaTask: {
//         '@@redux-saga/TASK': true,
//         id: 516,
//         meta: [Object],
//         isRoot: true,
//         context: {},
//         joiners: [],
//         queue: [Object],
//         cancel: [Function: cancel],
//         cont: [Function: noop],
//         end: [Function: end],
//         setContext: [Function: setContext],
//         toPromise: [Function: toPromise],
//         isRunning: [Function: isRunning],
//         isCancelled: [Function: isCancelled],
//         isAborted: [Function: isAborted],
//         result: [Function: result],
//         error: [Function: error]
//       },
//       [Symbol(observable)]: [Function: observable]
//     }
//   }
