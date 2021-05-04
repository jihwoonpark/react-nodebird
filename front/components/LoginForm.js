import React, { useCallback, useMemo, useEffect } from "react";
import { Form, Input, Button } from "antd";
import Link from "next/link";
import styled from "styled-components";
// import PropTypes from "prop-types";
import userInput from "../hooks/useInput";
import {useDispatch, useSelector} from 'react-redux';
import { loginRequestAction } from "../reducers/user";


const ButtonWrapper = styled.div`
	margin-top: 10px;
`;

const FormWrapper = styled(Form)`
	padding: 10px;
`;

function LoginForm() {
  const dispatch = useDispatch();
  const {logInLoading, logInError} = useSelector(state=>state.user)
  const [email, onChangeEmail] = userInput('');
  const [password, onChangePassword] = userInput('');  

	// const [id, setId] = useState("");
	// const [password, setPassword] = useState("");

	// const onChangeId = useCallback((e) => {
	// 	setId(e.target.value);
	// }, []);

	// const onChangePassword = useCallback((e) => {
	// 	setPassword(e.target.value);
	// }, []);

	const style = useMemo(() => ({ marginTop: 10 }));

	useEffect(()=>{
		if(logInError){
			alert(logInError)
		}
	},[logInError]);

	const onSubmitForm = useCallback(() => {
			// console.log(email, password);
			dispatch(loginRequestAction({email,password}))
		}, [email, password]
	);

	return (
		<FormWrapper onFinish={onSubmitForm}>
			<div>
				<label htmlFor="user-email">이메일</label>
				<br />
				<Input name="user-email" type='email' value={email} onChange={onChangeEmail} required></Input>
			</div>
			<div>
				<label htmlFor="user-password">비밀번호</label>
				<br />
				<Input
					type="password"
					name="user-password"
					value={password}
					onChange={onChangePassword}
					required
				></Input>
			</div>
			{/* style에 객체를 주면 계속 리랜더링됨 => 내용이 안바껴도 이전{}===현재{} 는 false로 나와서 리랜더링됨 */}
			<ButtonWrapper style={style}>
				<Button type="primary" htmlType="submit" loading={logInLoading}>
					로그인
				</Button>
				<Link href="/signup">
					<a>
						<Button>회원가입</Button>
					</a>
				</Link>
			</ButtonWrapper>
		</FormWrapper>
	);
}

// LoginForm.propTypes = {
// 	setIsLoggedIn: PropTypes.func.isRequired,
// };

export default LoginForm;

