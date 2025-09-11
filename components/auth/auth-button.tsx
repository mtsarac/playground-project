import RegisterDialog from "./register-dialog";
import LoginDialog from "./login-dialog";

type AuthButtonProps = {
  type: "login" | "register";
};

export default function AuthButton(props: AuthButtonProps) {
  const isLogin = props.type === "login";
  return <div>{isLogin ? <LoginDialog /> : <RegisterDialog />}</div>;
}
