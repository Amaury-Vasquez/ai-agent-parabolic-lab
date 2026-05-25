import { Rocket } from "lucide-react";
import Link from "next/link";

interface HeadingProps {
  panelDescription: string;
}

const Heading = ({ panelDescription }: HeadingProps) => (
  <Link
    href="/"
    className="flex items-center gap-3 min-w-0 rounded-xl p-1.5 -m-1.5 hover:bg-base-300/60 transition-colors"
  >
    <span className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-sm shrink-0">
      <Rocket className="size-5" />
    </span>
    <span className="flex flex-col min-w-0">
      <span className="font-bold text-base leading-tight truncate">
        ParabolicLab
      </span>
      <span className="text-xs opacity-60 leading-tight truncate">
        Panel · {panelDescription}
      </span>
    </span>
  </Link>
);

export default Heading;
