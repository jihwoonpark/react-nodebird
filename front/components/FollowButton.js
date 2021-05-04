import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { UNFOLLOW_REQUEST, FOLLOW_REQUEST } from "../reducers/user";

function FollowButton({ post }) {
	const dispatch = useDispatch();
	const { me, followLoading, unfollowLoading } = useSelector(
		(state) => state.user
	);

	//내 팔로잉 목록에 있으면
	const isFollowing = me?.Followings.find((v) => v.id === post.User.id);

	const onClickButton = useCallback(() => {
		if (isFollowing) {
			dispatch({
                type: UNFOLLOW_REQUEST,
                data:post.User.id,
			});
		} else {
			dispatch({
                type: FOLLOW_REQUEST,
                data:post.User.id,
			});
		}
	}, [isFollowing]);

	if(post.User.id === me.id){
		return null;
	}
	return (
		<Button loading={followLoading || unfollowLoading} onClick={onClickButton}>
			{isFollowing ? "언팔로우" : "팔로우"}
		</Button>
	);
}

FollowButton.propTypes = {
	post: PropTypes.object.isRequired,
};

export default FollowButton;
