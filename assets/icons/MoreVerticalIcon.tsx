import React from 'react';
import {TouchableOpacity} from 'react-native';
import Svg, {Path} from 'react-native-svg';

const MoreVerticalIcon = ({
  size = 24,
  color = '#4A4A4A',
  strokeWidth = 1.5,
  style,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={style}>
        <Path
          d="M12 5.92C12.2546 5.92 12.4988 5.81886 12.6789 5.63882C12.8589 5.45879 12.96 5.21461 12.96 4.96C12.96 4.70539 12.8589 4.46121 12.6789 4.28118C12.4988 4.10114 12.2546 4 12 4C11.7454 4 11.5013 4.10114 11.3212 4.28118C11.1412 4.46121 11.04 4.70539 11.04 4.96C11.04 5.21461 11.1412 5.45879 11.3212 5.63882C11.5013 5.81886 11.7454 5.92 12 5.92ZM12 12.96C12.2546 12.96 12.4988 12.8589 12.6789 12.6788C12.8589 12.4988 12.96 12.2546 12.96 12C12.96 11.7454 12.8589 11.5012 12.6789 11.3212C12.4988 11.1411 12.2546 11.04 12 11.04C11.7454 11.04 11.5013 11.1411 11.3212 11.3212C11.1412 11.5012 11.04 11.7454 11.04 12C11.04 12.2546 11.1412 12.4988 11.3212 12.6788C11.5013 12.8589 11.7454 12.96 12 12.96ZM12 20C12.2546 20 12.4988 19.8989 12.6789 19.7188C12.8589 19.5388 12.96 19.2946 12.96 19.04C12.96 18.7854 12.8589 18.5412 12.6789 18.3612C12.4988 18.1811 12.2546 18.08 12 18.08C11.7454 18.08 11.5013 18.1811 11.3212 18.3612C11.1412 18.5412 11.04 18.7854 11.04 19.04C11.04 19.2946 11.1412 19.5388 11.3212 19.7188C11.5013 19.8989 11.7454 20 12 20Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  );
};

export default MoreVerticalIcon;
