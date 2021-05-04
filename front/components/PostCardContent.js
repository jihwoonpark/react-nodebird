import React from 'react';
import PropTypes from "prop-types";
import Link from 'next/link';

function PostCardContent({postData}) {//첫번재 게시글 #해시태그 #익스프레스
  return (
    <div>
      {/* split에서는 정규표현식을 괄호로 감싸야지 정상작동 함, 정규표현식 기준으로 문자를 자름 */}
      {postData.split(/(#[^\s#]+)/g).map((v,i)=>{                
          if(v.match(/(#[^\s#]+)/)){
            return <Link href={`/hashtag/${v.slice(1)}`} key={i}><a>{v}</a></Link>
          }
          return v;
      })}
    </div>
  );
}

PostCardContent.propTypes = {
    postData:PropTypes.string.isRequired,
}

export default PostCardContent;