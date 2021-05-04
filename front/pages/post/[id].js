import React from "react";
import { useRouter } from "next/router";
import wrapper from '../../store/configureStore';
import { END } from 'redux-saga';
import axios from 'axios';
import Head from 'next/head';

import { LOAD_MY_INFO_REQUEST } from "../../reducers/user";
import {LOAD_POST_REQUEST} from "../../reducers/post";
import AppLayout from "../../components/AppLayout";
import PostCard from "../../components/PostCard";
import { useSelector } from "react-redux";

const Post = () => {
    const router = useRouter();
    const {id} = router.query;
    const {singlePost} = useSelector((state) =>state.post);
 
    return (
        <AppLayout>
            <Head>
                <title>
                    {singlePost.User.nickname}님의 글
                </title>
                <meta name="description" content={singlePost.content} />
                <meta property="og:title" content={`${singlePost.User.nickname}의 게시글`} />                
                <meta property="og:description" content={singlePost.content} />
                <meta property="og:image" content={singlePost.Images[0] ? singlePost.Images[0].src : 'https://nodebird.com/favicon.ico'} />
                <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
            </Head>
            <PostCard post={singlePost}></PostCard>
        </AppLayout>
    )
    
};

export const getServerSideProps = wrapper.getServerSideProps(async(context)=>{    
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
    
    context.store.dispatch({
        type:LOAD_POST_REQUEST,
        data:context.params.id //next 프론트서버 params, query 접근은 context.params, query로 함
    })

    context.store.dispatch(END);//LOAD_POSTS_REQUEST에 대한 SUCCESS응답이 올때까지 기다림    
    await context.store.sagaTask.toPromise();//configureStore에 store.sagaTask 지정했음    
});

export default Post;
