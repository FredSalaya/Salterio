// src/components/FancyText.jsx
import GradientText from './GradientText' 

export default function FancyText({
  text,
  colors = ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'],
  animationSpeed = 3,
  showBorder = false,
  className = '',
}) {
  return (
    <GradientText
      colors={colors}
      animationSpeed={animationSpeed}
      showBorder={showBorder}
      className={className}
    >
      {text}
    </GradientText>
  )
}
