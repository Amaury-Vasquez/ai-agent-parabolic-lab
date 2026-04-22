import { useRef } from "react";
const useModalFormConfirm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const handleConfirmClick = () => {
    formRef.current?.requestSubmit();
  };
  return { formRef, handleConfirmClick };
};
export default useModalFormConfirm;
