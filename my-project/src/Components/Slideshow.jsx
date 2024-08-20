import React from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'; // Import default styles

const Slideshow = () => {
  const slideImages = [
    './Bilder/gratisHäst.jpg', // Relative path to your image
    './Bilder/PappaCrazy.png'  // Relative path to your image
  ];

  return (
    <div>
      <Slide easing="ease">
        {slideImages.map((slideImage, index) => (
          <div className="each-slide" key={index}>
            <div style={{'backgroundImage': `url(${slideImage})`, height: '500px', backgroundSize: 'cover'}}>
              <span>Slide {index + 1}</span>
            </div>
          </div>
        ))}
      </Slide>
    </div>
  );
};

export default Slideshow;
