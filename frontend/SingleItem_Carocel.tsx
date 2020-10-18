import React, { FC, memo } from 'react';
import ReactImageMagnify from 'react-image-magnify';
import ReactSlick from 'react-slick';
import { Props } from './interfaceTypes/SingleItemCarocel'

//import './styles/SingleItemStyles.css';

//SingleItemCarocel
const SingleItemCarocel: FC<Props> = ({ 
    item, cartClick, rimProps,
    smallImage, largeImage, smallImage2, largeImage2, smallImage3, largeImage3,
    smallImage4, largeImage4, smallImage5, largeImage5, smallImage6, largeImage6
}) => {

  const front_500 = smallImage === '' || cartClick === true ? item.image : smallImage;
  const front_779 = smallImage2 === '' || cartClick === true ? item.image2 : smallImage2;
  const front_1020 = smallImage3 === '' || cartClick === true ? item.image3 : smallImage3;
  const front_1200 = smallImage4 === '' || cartClick === true ? item.image4 : smallImage4;
  const front_1426 = smallImage5 === '' || cartClick === true ? item.image5 : smallImage5;
  const front_1600 = smallImage6 === '' || cartClick === true ? item.image6 : smallImage6;

  const back_500 = largeImage === '' || cartClick === true ? item.largeImage : largeImage;
  const back_779 = largeImage2 === '' || cartClick === true ? item.largeImage2 : largeImage2;
  const back_1020 = largeImage3 === '' || cartClick === true ? item.largeImage3 : largeImage3;
  const back_1200 = largeImage4 === '' || cartClick === true ? item.largeImage4 : largeImage4;
  const back_1426 = largeImage5 === '' || cartClick === true ? item.largeImage5 : largeImage5;
  const back_1600 = largeImage6 === '' || cartClick === true ? item.largeImage6 : largeImage6;

  const frontSrcSet = [
      { src: front_500, setting: '500w' },
      { src: front_779, setting: '779w' },
      { src: front_1020, setting: '1020w' },
      { src: front_1200, setting: '1200w' },
      { src: front_1426, setting: '1426w' },
      { src: front_1600, setting: '1600w' }
  ]
  .map(itemz => `${itemz.src} ${itemz.setting}`)
  .join(', ');

  const backSrcSet = [
      { src: back_500, setting: '500w' },
      { src: back_779, setting: '779w' },
      { src: back_1020, setting: '1020w' },
      { src: back_1200, setting: '1200w' },
      { src: back_1426, setting: '1426w' },
      { src: back_1600, setting: '1600w' }
  ]
  .map(itemz => `${itemz.src} ${itemz.setting}`)
  .join(', ');

    // My defined pages
    const page1SrcSet = [
        { src: front_500, setting: '500w' },
        { src: back_500, setting: '1200w' }
    ]
    .map(itemz => `${itemz.src} ${itemz.setting}`)
    .join(', ');

    const page2SrcSet = [
        { src: front_779, setting: '500w' },
        { src: back_779, setting: '1200w' }
    ]
    .map(itemz => `${itemz.src} ${itemz.setting}`)
    .join(', ');

    const page3SrcSet = [
        { src: front_1020, setting: '500w' },
        { src: back_1020, setting: '1200w' }
    ]
    .map(itemz => `${itemz.src} ${itemz.setting}`)
    .join(', ');

    const page4SrcSet = [
        { src: front_1200, setting: '500w' },
        { src: back_1200, setting: '1200w' }
    ]
    .map(itemz => `${itemz.src} ${itemz.setting}`)
    .join(', ');

    const page5SrcSet = [
        { src: front_1426, setting: '500w' },
        { src: back_1426, setting: '1200w' }
    ]
    .map(itemz => `${itemz.src} ${itemz.setting}`)
    .join(', ');

    const page6SrcSet = [
        { src: front_1600, setting: '500w' },
        { src: back_1600, setting: '1200w' }
    ]
    .map(itemz => `${itemz.src} ${itemz.setting}`)
    .join(', ');

  const dataSource = [
    {
        srcSet: page1SrcSet,
        small: front_500,
        large: back_500
    },
    {
        srcSet: page2SrcSet,
        small: front_779,
        large: back_779
    },
    {
        srcSet: page3SrcSet,
        small: front_1020,
        large: back_1020
    },
    {
        srcSet: page4SrcSet,
        small: front_1200,
        large: back_1200
    },
    {
        srcSet: page5SrcSet,
        small: front_1426,
        large: back_1426
    },
    {
        srcSet: page6SrcSet,
        small: front_1600,
        large: back_1600
    }
  ];

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 2000,
    initialSlide: 2,
    cssEase: "linear"
  }

  return (
    <ReactSlick {...settings as any} >
        {dataSource.map((src, index) => (
            <div key={index}>
                <ReactImageMagnify
                    {...{
                        smallImage: {
                            alt: item.title,
                            isFluidWidth: true,
                            src: src.small,
                            srcSet: src.srcSet,
                            sizes: '(max-width: 480px) 100vw, (max-width: 1200px) 30vw, 360px'
                        },
                        largeImage: {
                            src: src.large,
                            width: 1200,
                            height: 1800
                        },
                        lensStyle: { backgroundColor: 'rgba(0,0,0,.6)' }
                    }}
                    {...rimProps}
                />
            </div>
        ))}
    </ReactSlick>
  )

}

export default SingleItemCarocel;

