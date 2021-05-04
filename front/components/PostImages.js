import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { PlusOutlined } from "@ant-design/icons";
import ImagesZoom from "./ImagesZoom";

function PostImages({ images }) {
	const [showImagesZoom, setShowImagesZoom] = useState(false);
	const onZoom = useCallback(() => {
		setShowImagesZoom(true);
  }, []);
  
  const onClose = useCallback(() => {
		setShowImagesZoom(false);
  }, []);
  

	if (images.length === 1) {
		return (
		<>
		{/* role="presentation" => 시각장애인에게 이 부분은 클릭 안해도된다고 알려줌 */}
		<img role="presentation" src={`http://localhost:3065/${images[0].src}`} alt={images[0].src} onClick={onZoom} />
        {showImagesZoom && <ImagesZoom images={images} onClose={onClose} />}
		</>
		);
	}
	if (images.length === 2) {
		return (
      <>
        <div>
          <img src={`http://localhost:3065/${images[0].src}`} width="50%" onClick={onZoom} />
          <img src={`http://localhost:3065/${images[1].src}`} width="50%" onClick={onZoom} />
        </div>
        {showImagesZoom && <ImagesZoom images={images} onClose={onClose} />}
      </>
		);
	}
	// 이미지가 3개 이상일 경우
	return (
		<>
			<div>
				<img role="presentation" style={{ width:"50%", display:'inline-block'}} src={`http://localhost:3065/${images[0].src}`} alt={images[0].src} onClick={onZoom} />
				<div
					role="presentation"
					style={{
						display: "inline-block",
						width: "50%",
						textAlign: "center",
						verticalAlign: "middle",
					}}
					onClick={onZoom}
				>
					<PlusOutlined />
					<br />
					{images.length - 1}개의 사진 더보기          
				</div>
			</div>
      {showImagesZoom && <ImagesZoom images={images} onClose={onClose} />}
		</>
	);
}

PostImages.propTypes = {
	images: PropTypes.arrayOf(PropTypes.object),
};

export default PostImages;
