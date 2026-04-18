import { getIconButtonClasses, Tooltip } from "amvasdev-ui";
import clsx, { ClassValue } from "clsx";
import Link from "next/link";
import { ReactNode, useState } from "react";

interface IconLinkProps {
  href: string;
  className?: ClassValue;
  icon: ReactNode;
  tooltip?: ReactNode;
}

const IconLink = ({ href, className, icon, tooltip }: IconLinkProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const onMouseLeave = () => {
    setIsHovered(false);
    setIsFocused(false);
  };

  return (
    <Link
      href={href}
      className={clsx(getIconButtonClasses(), className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={onMouseLeave}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {icon}
      {(isHovered || isFocused) && tooltip ? <Tooltip content={tooltip} /> : null}
    </Link>
  );
};

export default IconLink;
