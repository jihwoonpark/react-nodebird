/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback} from 'react';
import { Card, Popover, Button, Avatar, Comment, List} from 'antd';
import PropTypes from "prop-types";
import { RetweetOutlined, HeartOutlined, HeartTwoTone, MessageOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import moment from 'moment';

import PostImages from './PostImages';
import CommentForm from './CommentForm';
import PostCardContent from './PostCardContent';
import { REMOVE_POST_REQUEST, LIKE_POST_REQUEST, UNLIKE_POST_REQUEST, RETWEET_REQUEST } from '../reducers/post';
import FollowButton from './FollowButton';

moment.locale('ko'); //한글로 변경

function PostCard({post}) {
  const dispatch = useDispatch();
  const {removePostLoading} = useSelector(state=>state.post);
  // const [liked, setLiked] = useState(false);
  const [commentFormOpened, setCommentFormOpened] = useState(false);
  const id = useSelector(state=>state.user.me?.id); //optional chaining  
  
  const onLike = useCallback(()=>{   
    if(!id){
      return alert('로그인이 필요합니다')
    }    
    return dispatch({
      type:LIKE_POST_REQUEST,
      data:post.id
    })
  },[id])

  const onUnlike = useCallback(()=>{
    if(!id){
      return alert('로그인이 필요합니다')
    }   
    return dispatch({
      type:UNLIKE_POST_REQUEST,
      data:post.id
    })
  },[id])
  
  const onToggleComment = useCallback(()=>{
    setCommentFormOpened(prev => !prev);
  },[])

  const onRemovePost = useCallback(()=>{
    if(!id){
      return alert('로그인이 필요합니다')
    }   
    return dispatch({
      type:REMOVE_POST_REQUEST,
      data:post.id,
    })  
  },[id, post.id])

  const onRetweet = useCallback(() =>{
    if(!id){
      return alert('로그인이 필요합니다')
    }    
    dispatch({
      type:RETWEET_REQUEST,
      data:post.id,
    })
  },[post.id])

  const liked = post.Likers.find(v=> v.id === id)

  return (
    <div>
      <Card
        cover={post.Images[0] && <PostImages images={post.Images}/>}
        actions={[
          <RetweetOutlined key="retweet" onClick={onRetweet} />,          
          liked ? <HeartTwoTone twoToneColor="#eb2f96" key="heart" onClick={onUnlike} />
                : <HeartOutlined key="heart" onClick={onLike} />,             
          <MessageOutlined key="comment" onClick={onToggleComment} />,
          <Popover key="more" content={(
            <Button.Group>
              {/* 게시글의 작성자 아이디가 로그인한 아이디와 같으면 == 내가 작성했으면 */}
              {id && post.User.id === id 
                ? (
                  <>
                    <Button>수정</Button>
                    <Button type="danger" loading={removePostLoading} onClick={onRemovePost}>삭제</Button>
                  </>
                )
                : <Button>신고</Button>              
              }              
            </Button.Group>
          )}>
            <EllipsisOutlined/>
          </Popover>
        ]}
        title={post.RetweetId ? `${post.User.nickname}님이 리트윗하셨습니다.` : null}
        extra={id && <FollowButton post={post} />}
      >
        {post.RetweetId && post.Retweet
          ?(
            // 리트윗일 경우 카드안에 다시 카드를 넣음
            <Card 
              cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images}/>}
            >
            <div style={{float:'right'}}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
            <Card.Meta
                avatar={<Link href={`/user/${post.Retweet.User.id}`}><a><Avatar>{post.Retweet.User.nickname[0]}</Avatar></a></Link>}
                title={post.Retweet.User.nickname}
                description={<PostCardContent postData={post.Retweet.content}/>}
              />
            </Card>            
          ) 
          :(<>
              <div style={{float:'right'}}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
              <Card.Meta
                avatar={<Link href={`/user/${post.User.id}`}><a><Avatar>{post.User.nickname[0]}</Avatar></a></Link>}            
                title={post.User.nickname}
                description={<PostCardContent postData={post.content}/>}
            />
          </>
          )
        }

      </Card>
      {commentFormOpened && (
        <div> 
          <CommentForm post={post}/>
          <List 
            header={`${post.Comments.length}개의 댓글`}
            itemLayout="horizontal"
            dataSource={post.Comments}
            renderItem={(item)=>(
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={<Link href={`/user/${item.User.id}`}><a><Avatar>{item.User.nickname[0]}</Avatar></a></Link>}                  
                  content={item.content}
                />                
              </li>
            )}
          />      
        </div>
      ) }
      
      
    </div>
  );
}

PostCard.propTypes = {
  post:PropTypes.shape({ //object를 더 자세하게 적을때 사용
    id:PropTypes.number,
    User:PropTypes.object,
    content:PropTypes.string,
    createdAt:PropTypes.string,
    Comments:PropTypes.arrayOf(PropTypes.object),//객체들의 배열
    Images:PropTypes.arrayOf(PropTypes.object),
    Likers:PropTypes.arrayOf(PropTypes.object),
    RetweetId:PropTypes.number,
    Retweet:PropTypes.objectOf(PropTypes.any),
  }).isRequired
}

export default PostCard;