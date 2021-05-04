import React, { useCallback, useState, useEffect } from 'react';
import Head from 'next/head';
import { Form, Input, Checkbox, Button } from 'antd';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import Router from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';

import AppLayout from '../components/AppLayout';
import useInput from '../hooks/useInput';
import { LOAD_MY_INFO_REQUEST, SIGN_UP_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';


const ErrorMessage = styled.div`
		color:red;	
	`;

function Signup() {

	const [email, onChangeEmail] = useInput('');
	const [nickname, onChangeNickname] = useInput('');
	const [password, onChangePassword] = useInput('');

	const [passwordCheck, setPasswordCheck] = useState('');
	const [passwordError, setPassswordError] = useState(false);
	const [term, setTerm] = useState(false);
	const [termError, setTermError] = useState(false);

	const dispatch = useDispatch();
	const {signUpLoading, signUpDone, signUpError, me} = useSelector(state=>state.user)


	useEffect(()=>{
		if(me && me.id){
			//push는 뒤로가기했을때, 페이지 살아있는데, replace는 해당 페이지가 사라짐
			Router.replace('/')
		}
	},[me && me.id])

	useEffect(()=>{
		if(signUpDone){//user 리듀서에서 signupdone 상태 있음
			Router.replace('/')
		}
	},[signUpDone]);

	useEffect(()=>{
		if(signUpError){
			//res.status(403).send('이미 사용중인 아이디입니다.') -> yield put({ type: SIGN_UP_FAILURE, error: err.response.data
			//-> draft.signUpError = action.error; 
			alert(signUpError);
		}
	},[signUpError]);

	const onChangePasswordCheck = useCallback((e)=>{
		setPasswordCheck(e.target.value);
		setPassswordError(e.target.value !== password)
	},[password])

	const onChangeTerm = useCallback((e)=>{
		setTerm(e.target.checked);
		console.log('e.target.checked',e.target.checked); //check되면 true, false
		setTermError(false);
	},[])

	const onSubmit = useCallback(()=>{
		if(password !== passwordCheck){
			return setPassswordError(true);
		}
		if(!term){
			return setTermError(true);
		}
		// console.log(email, nickname, password)
		dispatch({
			type:SIGN_UP_REQUEST,
			data:{email, password, nickname}
		});
	},[email, nickname, password, passwordCheck, term])

	return (
		<AppLayout>
			<Head>
				<title>회원가입 | NodeBird</title>
			</Head>
            <Form onFinish={onSubmit}>
				<div>
					<label htmlFor="user-email">이메일</label>
					<br/>
					<Input name="user-email" type='email' value={email} onChange={onChangeEmail} required></Input>
				</div>
				<div>
					<label htmlFor="user-nickname">닉네임</label>
					<br/>
					<Input name="user-nickname" value={nickname} onChange={onChangeNickname} required></Input>
				</div>
				<div>
					<label htmlFor="user-password">비밀번호</label>
					<br/>
					<Input name="user-password" type="password" value={password} onChange={onChangePassword} required></Input>
				</div>
				<div>
					<label htmlFor="user-password-check">비밀번호체크</label>
					<br/>
					<Input name="user-password-check" type="password" value={passwordCheck} onChange={onChangePasswordCheck} required/>						
					{passwordError && <ErrorMessage>비밀번호가 일치하지 않습니다</ErrorMessage>}
				</div>
				<div>
					<Checkbox name='user-term' checked={term} onChange={onChangeTerm}>동의합니다.</Checkbox>
					{termError && <ErrorMessage>약관에 동의해야 합니다.</ErrorMessage>}
				</div>
				<div style={{marginTop:10}}>
					<Button type="primary" htmlType="submit" loading={signUpLoading}>가입하기</Button>
				</div>
			</Form>
		</AppLayout>
	);
}

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
//   console.log('getServerSideProps start');
//   console.log(context.req.headers);
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch(END);
//   console.log('getServerSideProps end');
  await context.store.sagaTask.toPromise();
});
export default Signup;


