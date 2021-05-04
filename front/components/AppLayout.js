import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { Menu, Input, Row, Col } from "antd";
import UserProfile from './UserProfile';
import LoginForm from './LoginForm';
import styled from 'styled-components';
import { useSelector } from "react-redux";
import useInput from "../hooks/useInput";
import Router from "next/router";

const SearchInput = styled(Input.Search)`
  vertical-align:middle;`

function AppLayout({ children }) {
//  const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [searchInput,onChangeSearchInput] = useInput('');
	const {me} = useSelector(state => state.user);
	
	const onSearch = useCallback(()=>{
		Router.push(`/hashtag/${searchInput}`)
	})
	
	return (
		<div>
			<Menu mode="horizontal">
				<Menu.Item>
					<Link href="/">
						<a>노드버드</a>
					</Link>
				</Menu.Item>
				<Menu.Item>
					<Link href="/profile">
						<a>프로필</a>
					</Link>
				</Menu.Item>
				<Menu.Item>
					{/* 검색버튼 누르면 onSearch함수 실행 */}
					<SearchInput            
						placeholder="input search text"
						enterButton="Search"
						size="large"
						onChange={onChangeSearchInput}
						onSearch={onSearch}
					/>
				</Menu.Item>
				<Menu.Item>
					<Link href="/signup">
						<a>회원가입</a>
					</Link>
				</Menu.Item>
			</Menu>
      <Row gutter={4}>
        <Col xs={24} md={6}>
          {me ? <UserProfile /> : <LoginForm />}
        </Col>
        <Col xs={24} md={12}>
          {children}
        </Col>
        <Col xs={24} md={6}>
			{/* noreferrer noopener 웹보안상 쓰는 거라 함 */}
          <a href="https://www.zerocho.com" target="blank" rel="noreferrer noopener">Made by cho</a>
        </Col>
      </Row>			
	</div>
	);
}

AppLayout.propTypes = {
	children: PropTypes.node.isRequired,
};

export default AppLayout;


