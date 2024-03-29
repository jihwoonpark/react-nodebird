import React, { useState } from "react";
import PropTypes from 'prop-types';
import Slick from 'react-slick';
import { Overlay, Global, Header, CloseBtn, SlickWrapper, ImageWrapper, Indicator} from "./styles";

const ImagesZoom = ({images, onClose})=>{
    const [currentSlide, setCurrentSlide] = useState(0);
    return(
        <Overlay>
            <Global/>
            <Header>
                <h1>상세이미지</h1>
                <CloseBtn onClick={onClose}>X</CloseBtn>
            </Header>
            <SlickWrapper>
                <div>
                    <Slick
                        initialSlide={0}
                        // 다음 장으로 넘어가면 slide에 1,2 등의 번호가 담기고 그 번호를 저장
                        beforeChange={(slide)=> setCurrentSlide(slide)}
                        infinite
                        arrows={false}
                        slidesToShow={1}
                        slidesToScroll={1}
                    >
                        {images.map((v)=>(
                            <ImageWrapper key={v.src}>
                                <img src={v.src.replace(/\/thumb\//,'/original/')} alt={v.src}/>
                            </ImageWrapper>
                        ) )}
                    </Slick>
                    <Indicator>
                        <div>
                            {currentSlide +1}
                            {' '}
                            /
                            {images.length}
                        </div>
                    </Indicator>
                </div>
            </SlickWrapper>
        </Overlay>
    )
}

ImagesZoom.propTypes = {
    images:PropTypes.arrayOf(PropTypes.object).isRequired,
    onClose:PropTypes.func.isRequired,
}

export default ImagesZoom;

