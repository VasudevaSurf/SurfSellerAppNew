import React from 'react';
import Svg, {Path} from 'react-native-svg';

const BrainIcon = ({size = 24, color = '#3A5AFE', style}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}>
      <Path
        d="M11.209 3.81608C11.1602 3.55537 11.0099 3.32472 10.791 3.17488C10.5722 3.02504 10.3027 2.96828 10.042 3.01708C9.78132 3.06588 9.55068 3.21624 9.40084 3.4351C9.25099 3.65395 9.19423 3.92337 9.24303 4.18408L9.56803 5.92408C8.54093 6.45249 7.71285 7.29968 7.20802 8.33857C6.70318 9.37745 6.5488 10.552 6.76803 11.6861L7.04403 13.1591L7.09903 13.4551C7.35703 14.8291 6.87103 15.7171 6.46903 16.4531C6.18403 16.9731 5.94203 17.4171 6.03203 17.9021C6.14203 18.4881 6.25203 19.0751 6.78203 18.9761L19.482 16.5991C20.01 16.4991 19.9 15.9141 19.79 15.3291C19.687 14.7651 19.154 14.2061 18.595 13.6181C17.989 12.9821 17.352 12.3121 17.191 11.5671C16.958 10.4821 16.916 10.1801 16.888 9.98008C16.879 9.91708 16.872 9.86308 16.86 9.79808C16.6346 8.54978 15.9721 7.42251 14.9913 6.61813C14.0105 5.81375 12.7753 5.38479 11.507 5.40808L11.209 3.81608Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.53901 4.27802C6.73545 4.45603 6.85317 4.70476 6.8663 4.96953C6.87943 5.23431 6.78688 5.49346 6.60901 5.69002C5.49401 6.92002 4.90401 8.29502 4.77901 9.95002C4.75912 10.2146 4.63495 10.4604 4.43381 10.6334C4.23268 10.8064 3.97106 10.8924 3.70651 10.8725C3.44195 10.8526 3.19614 10.7285 3.02313 10.5273C2.85013 10.3262 2.76412 10.0646 2.78401 9.80002C2.94401 7.70102 3.71301 5.90702 5.12601 4.34702C5.21423 4.24968 5.32077 4.17067 5.43954 4.11451C5.55832 4.05835 5.68699 4.02615 5.81821 4.01974C5.94943 4.01334 6.08063 4.03285 6.20431 4.07717C6.32798 4.12148 6.44172 4.18974 6.53901 4.27802Z"
        fill={color}
      />
      <Path
        d="M8.95001 19.7C9.65001 20.5 10.65 21 11.75 21C13.35 21 14.65 19.9 15.05 18.5L8.95001 19.7Z"
        fill={color}
      />
    </Svg>
  );
};

export default BrainIcon;
