import { Rocket } from "lucide-react";
import Link from "next/link";

interface HeadingProps {
  panelDescription: string;
}

const Heading = ({ panelDescription }: HeadingProps) => (
  <Link href="/" className="flex items-center gap-3 bg-base-200">
    <div className="w-10 h-10 bg-base-300 rounded-lg flex items-center justify-center">
      <Rocket className="w-6 h-6 text-primary" />
    </div>
    <div>
      <h1 className="font-bold text-lg">ParabolicLab</h1>
      <p className="text-xs opacity-80">{panelDescription}</p>
    </div>
  </Link>
);

export default Heading;
