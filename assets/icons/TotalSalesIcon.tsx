import React from 'react';
import Svg, {Path} from 'react-native-svg';

const TotalSalesIcon = ({size = 24, color = '#1FC16B', style}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}>
      <Path
        d="M21.41 11.41L12.58 2.58C12.21 2.21 11.7 2 11.17 2H4C2.9 2 2 2.9 2 4V11.17C2 11.7 2.21 12.21 2.59 12.58L11.42 21.41C12.2 22.19 13.47 22.19 14.25 21.41L21.42 14.24C22.2 13.46 22.2 12.2 21.41 11.41ZM6.5 8C5.67 8 5 7.33 5 6.5C5 5.67 5.67 5 6.5 5C7.33 5 8 5.67 8 6.5C8 7.33 7.33 8 6.5 8Z"
        fill={color}
      />
    </Svg>
  );
};

export default TotalSalesIcon;
