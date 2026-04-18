import { Rocket } from "lucide-react";
import LoginForm from "@/components/LoginForm";

const Login = () => (
  <div className="h-full flex items-center justify-center px-4 py-8">
    <div className="w-full max-w-md flex flex-col gap-6">
      {/* Logo and Welcome */}
      <div className="text-center">
        <span className="inline-flex items-center justify-center size-12 bg-primary rounded-2xl">
          <Rocket className="size-6 text-primary-content" />
        </span>
      </div>
      <h1 className="text-2xl font-bold text-center">
        Bienvenido a ParabolicLab
      </h1>
      {/* Login Card */}
      <LoginForm />
    </div>
  </div>
);

export default Login;
